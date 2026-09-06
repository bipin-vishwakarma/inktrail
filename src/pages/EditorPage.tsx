import { useState, useMemo, useDeferredValue, useEffect, useRef, useCallback } from 'react';

import { 
    FileText, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify, 
    Download, Clock, 
    ZoomIn, ZoomOut, Palette,
    RotateCcw, Camera, Scissors, X, Dices,
    Maximize2, Minimize2, Clipboard, Sparkles, Trash2
} from 'lucide-react';

import { useStore } from '../lib/store';
import { useToast } from '../hooks/useToast';
import HistoryModal from '../components/modals/HistoryModal';
import ExportModal from '../components/modals/ExportModal';
import { CreatorModal } from '../components/modals/CreatorModal';
import { HandwrittenWord } from '../components/HandwrittenWord';
import { ThumbnailBar } from '../components/ThumbnailBar';
import { CameraOverlay } from '../components/CameraOverlay';
import { HumanErrorsControls } from '../components/HumanErrorsControls';
import { CameraPhysicsControls } from '../components/CameraPhysicsControls';
import { PenPresetSelector } from '../components/PenPresetSelector';
import { parseWordToken, measureWordWidth, getFontFamilyCss, getEffectiveFontSize, clearWidthCache, type WordToken } from '../utils/humanErrorEngine';
import { computePagePhoneShadow } from '../utils/cameraShadowEngine';
import { cleanAIText, isLikelyAIText } from '../utils/aiTextCleaner';
import type { StrikeStyle } from '../types';

// --- PIPELINE TYPES ---
interface LineData {
    tokens: WordToken[];
    text: string;
    type: 'text' | 'bullet' | 'number' | 'empty' | 'comparison';
    indent: number;
    dir?: 'ltr' | 'rtl';
    charIndex: number;
    marginIndex?: string;
    startChar: number;
    endChar: number;
    leftTokens?: WordToken[];
    rightTokens?: WordToken[];
}

interface PageData {
    lines: LineData[];
    index: number;
}

// --- PIPELINE STAGE 1 & 2: TOKENIZE & BUILD LINES WITH FONT METRICS ---
function buildDocumentLines(
    text: string, 
    maxLineWidth: number,
    font: string,
    fontSize: number,
    seed: string,
    typoRate: number,
    strikeStyle: StrikeStyle,
    autoCaret: boolean,
    smartMarginIndexing: boolean = true
): LineData[] {
    const rawParagraphs = text.split('\n');
    const documentLines: LineData[] = [];
    let globalCharOffset = 0;
    let inCompareBlock = false;

    for (let pIndex = 0; pIndex < rawParagraphs.length; pIndex++) {
        const paragraph = rawParagraphs[pIndex];
        const paraStartOffset = globalCharOffset;
        const paraEndOffset = globalCharOffset + paragraph.length;
        globalCharOffset += paragraph.length + 1; // +1 for newline

        const trimmed = paragraph.trim();

        // 2-Column Comparison Block delimiters
        if (trimmed.toLowerCase() === '[compare]' || trimmed.toLowerCase() === '[comparison]') {
            inCompareBlock = true;
            continue;
        }
        if (trimmed.toLowerCase() === '[/compare]' || trimmed.toLowerCase() === '[/comparison]') {
            inCompareBlock = false;
            continue;
        }

        // 2-Column Comparison Row Parsing (|| Col 1 | Col 2 || or within [compare] block)
        const isInlineCompare = trimmed.startsWith('||') && trimmed.endsWith('||') && trimmed.length > 4;
        const isBlockCompareLine = inCompareBlock && trimmed.includes('|');

        if (isInlineCompare || isBlockCompareLine) {
            let cleanLine = trimmed;
            if (isInlineCompare) {
                cleanLine = cleanLine.slice(2, -2).trim();
            }
            const pipeIdx = cleanLine.indexOf('|');
            if (pipeIdx !== -1) {
                const leftStr = cleanLine.slice(0, pipeIdx).trim();
                const rightStr = cleanLine.slice(pipeIdx + 1).trim();

                const parseTokens = (sideText: string, offsetMultiplier: number) => {
                    const words = sideText.split(/\s+/).filter(Boolean);
                    return words.flatMap((w, wIdx) =>
                        parseWordToken(w, wIdx + offsetMultiplier, 0, pIndex, seed, typoRate, strikeStyle, autoCaret)
                    );
                };

                const leftTokens = parseTokens(leftStr, 0);
                const rightTokens = parseTokens(rightStr, 100);

                documentLines.push({
                    tokens: [...leftTokens, ...rightTokens],
                    leftTokens,
                    rightTokens,
                    text: `${leftStr} | ${rightStr}`,
                    type: 'comparison',
                    indent: 0,
                    charIndex: paraStartOffset,
                    startChar: paraStartOffset,
                    endChar: paraEndOffset,
                });
                continue;
            }
        }

        // Empty line or markdown horizontal divider handling (---, ***, ___)
        if (paragraph.trim().length === 0 || /^(?:---|___|\*\*\*)\s*$/.test(paragraph.trim())) {
            documentLines.push({
                tokens: [],
                text: '',
                type: 'empty',
                indent: 0,
                charIndex: paraStartOffset,
                startChar: paraStartOffset,
                endChar: paraEndOffset,
            });
            continue;
        }

        // Live Normalization of Markdown Headings & Answer Markers
        let normalizedPara = paragraph;
        if (/^#\s+/.test(normalizedPara)) {
            normalizedPara = '__' + normalizedPara.replace(/^#\s+/, '').replace(/\*\*/g, '').trim().toUpperCase() + '__';
        } else if (/^##\s+/.test(normalizedPara)) {
            normalizedPara = '__' + normalizedPara.replace(/^##\s+/, '').replace(/\*\*/g, '').trim() + '__';
        } else if (/^#{3,6}\s*/.test(normalizedPara)) {
            normalizedPara = normalizedPara.replace(/^#{3,6}\s*/, '').replace(/\*\*/g, '').trim();
        }
        normalizedPara = normalizedPara.replace(/^(\s*)\*\*(Ans(?:wer)?[\.:\-]?)\*\*/i, '$1$2');

        // Smart Margin Indexing Engine:
        // Detects Question numbers (Q1., Q.1, Question 1:), Answer tags (Ans:, Answer:),
        // Item bullets, and Roman numerals ((i), i., 1., (a))
        let marginMarker: string | undefined = undefined;
        let indentLevel = 0;
        let lineType: 'text' | 'bullet' | 'number' = 'text';
        let bodyText = normalizedPara;

        if (smartMarginIndexing) {
            const marginMatch = normalizedPara.match(
                /^(\s*)(Q(?:uestion|ues|ue)[\.:\-]?\s*(?:\d+[\.:\)]?)?|Q\.?\s*\d+[\.:\)]?|Ans(?:wer)?[\.:\-]?|Sol(?:ution)?[\.:\-]?|A\d+[\.:\)]?|\(\s*[a-zA-Z0-9ivxlcdm]+\s*\)|\d+[\.)]\s?|[ivxlcdm]+[\.)]\s?|[a-zA-Z][\.)])\s*(.*)$/i
            );
            if (marginMatch) {
                marginMarker = marginMatch[2].trim();
                bodyText = marginMatch[3] || '';
                lineType = 'number';
            }
        }

        if (!marginMarker) {
            const bulletMatch = normalizedPara.match(/^(\s*)([-*•])\s+(.*)$/);
            const numberMatch = normalizedPara.match(/^(\s*)(\d+[\.\)])\s+(.*)$/);

            if (bulletMatch) {
                indentLevel = Math.min(3, Math.floor(bulletMatch[1].length / 2) + 1);
                lineType = 'bullet';
                bodyText = `• ${bulletMatch[3]}`;
            } else if (numberMatch) {
                indentLevel = Math.min(3, Math.floor(numberMatch[1].length / 2) + 1);
                lineType = 'number';
                bodyText = `${numberMatch[2]} ${numberMatch[3]}`;
            }
        }

        // Measure available line width after indent
        const effectiveLineWidth = maxLineWidth - (indentLevel * fontSize * 0.5);
        const rawWords = bodyText.split(/\s+/).filter(Boolean).map(w => w.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*\*/g, ''));

        // Pre-parse tokens through Human Error Engine with multi-word highlighter, double-underline and box support
        let activeHighlight: 'yellow' | 'green' | 'pink' | 'blue' | null = null;
        let activeDoubleUnderline = false;
        let activeBox = false;

        const tokens: WordToken[] = rawWords.flatMap((w, wIdx) => {
            let word = w;
            let isHighlighted = false;
            let highlightColor: 'yellow' | 'green' | 'pink' | 'blue' = 'yellow';
            let isDoubleUnderline = false;
            let isBoxed = false;

            // 1. Highlighter check (==yellow:word== or ==word== or multi-word span)
            const hlStart = word.match(/^==(yellow|green|pink|blue):/i) || (word.startsWith('==') ? ['=='] : null);
            if (hlStart) {
                activeHighlight = (hlStart as any)[1] ? ((hlStart as any)[1].toLowerCase() as any) : 'yellow';
                word = word.slice(hlStart[0].length);
            }
            if (activeHighlight) {
                isHighlighted = true;
                highlightColor = activeHighlight;
            }
            if (word.endsWith('==') && (isHighlighted || activeHighlight)) {
                word = word.slice(0, -2);
                activeHighlight = null;
            }

            // 2. Double underline check (__word__ or multi-word span)
            if (word.startsWith('__')) {
                activeDoubleUnderline = true;
                word = word.slice(2);
            }
            if (activeDoubleUnderline) {
                isDoubleUnderline = true;
            }
            if (word.endsWith('__') && (isDoubleUnderline || activeDoubleUnderline)) {
                word = word.slice(0, -2);
                activeDoubleUnderline = false;
            }

            // 3. Formula/Answer Box check ([[word]] or multi-word span)
            if (word.startsWith('[[')) {
                activeBox = true;
                word = word.slice(2);
            }
            if (activeBox) {
                isBoxed = true;
            }
            if (word.endsWith(']]') && (isBoxed || activeBox)) {
                word = word.slice(0, -2);
                activeBox = false;
            }

            const parsed = parseWordToken(word, wIdx, 0, pIndex, seed, typoRate, strikeStyle, autoCaret);
            return parsed.map(tok => ({
                ...tok,
                isHighlighted: isHighlighted || tok.isHighlighted,
                highlightColor: highlightColor || tok.highlightColor,
                isDoubleUnderline: isDoubleUnderline || tok.isDoubleUnderline,
                isBoxed: isBoxed || tok.isBoxed,
            }));
        });

        // If bodyText was empty (e.g. line was just "Ans:"), create line with marker
        if (tokens.length === 0 && marginMarker) {
            documentLines.push({
                tokens: [],
                text: '',
                type: lineType,
                indent: indentLevel,
                charIndex: paraStartOffset,
                marginIndex: marginMarker,
                startChar: paraStartOffset,
                endChar: paraEndOffset
            });
            continue;
        }

        // Word-wrap using pixel-accurate font measurements
        let currentLineTokens: WordToken[] = [];
        let currentLineWidth = 0;
        const spaceWidth = measureWordWidth(' ', font, fontSize);
        let isFirstLineOfParagraph = true;

        for (let t = 0; t < tokens.length; t++) {
            const tok = tokens[t];
            const tokenPixelWidth = measureWordWidth(tok.text, font, fontSize);

            if (currentLineTokens.length > 0 && (currentLineWidth + spaceWidth + tokenPixelWidth > effectiveLineWidth)) {
                // Wrap line cleanly
                documentLines.push({
                    tokens: currentLineTokens,
                    text: currentLineTokens.map(tk => tk.text).join(' '),
                    type: lineType,
                    indent: indentLevel,
                    charIndex: paraStartOffset,
                    marginIndex: isFirstLineOfParagraph ? marginMarker : undefined,
                    startChar: paraStartOffset,
                    endChar: paraEndOffset
                });
                isFirstLineOfParagraph = false;
                currentLineTokens = [tok];
                currentLineWidth = tokenPixelWidth;
            } else {
                currentLineTokens.push(tok);
                currentLineWidth += (currentLineTokens.length === 1 ? 0 : spaceWidth) + tokenPixelWidth;
            }
        }

        if (currentLineTokens.length > 0) {
            documentLines.push({
                tokens: currentLineTokens,
                text: currentLineTokens.map(tk => tk.text).join(' '),
                type: lineType,
                indent: indentLevel,
                charIndex: paraStartOffset,
                marginIndex: isFirstLineOfParagraph ? marginMarker : undefined,
                startChar: paraStartOffset,
                endChar: paraEndOffset
            });
        }
    }

    return documentLines;
}

// --- PIPELINE STAGE 3: PAGINATION ---
function paginateLines(lines: LineData[], linesPerPage: number, page1Capacity: number): PageData[] {
    const pages: PageData[] = [];
    let currentLines: LineData[] = [];
    let isFirstPage = true;

    for (let i = 0; i < lines.length; i++) {
        const capacity = isFirstPage ? page1Capacity : linesPerPage;
        currentLines.push(lines[i]);

        if (currentLines.length >= capacity) {
            pages.push({ lines: currentLines, index: pages.length });
            currentLines = [];
            isFirstPage = false;
        }
    }

    if (currentLines.length > 0) {
        pages.push({ lines: currentLines, index: pages.length });
    }

    return pages.length > 0 ? pages : [{ lines: [{ tokens: [], text: '', type: 'empty', indent: 0, charIndex: 0, startChar: 0, endChar: 0 }], index: 0 }];
}

// --- DATA CONSTANTS ---
const FONTS = [
    // === TextToHandwriting.com Classic Vault (Authentic Scanned Hands) ===
    { name: 'Handwriting 1', label: 'Handwriting 1 (TextToHandwriting Classic Ballpoint)' },
    { name: 'Handwriting 2', label: 'Handwriting 2 (Clean Cursive Slant)' },
    { name: 'Handwriting 3', label: 'Handwriting 3 (Neat Student Pen)' },
    { name: 'Handwriting 4', label: 'Handwriting 4 (Fluid Natural Slant)' },
    { name: 'Handwriting 5', label: 'Handwriting 5 (Fast Exam Flow)' },
    { name: 'Handwriting 6', label: 'Handwriting 6 (Compact Notebook Hand)' },
    { name: 'Handwriting 7', label: 'Handwriting 7 (School Cursive Notes)' },
    { name: 'Handwriting 8', label: 'Handwriting 8 (Natural Messy Ballpoint)' },
    { name: 'Handwriting 9', label: 'Handwriting 9 (Rapid Loose Notes)' },
    { name: 'Handwriting 10', label: 'Handwriting 10 (Neat Compact Print)' },
    { name: 'Handwriting 11', label: 'Handwriting 11 (Fluid Student Ballpoint)' },
    { name: 'Handwriting 12', label: 'Handwriting 12 (Hurried College Scrawl)' },
    { name: 'Handwriting 13', label: 'Handwriting 13 (Bold Messy Scribble)' },
    { name: 'Handwriting 14', label: 'Handwriting 14 (Casual Pen Notes)' },
    { name: 'Handwriting 15', label: 'Handwriting 15 (Fine Line Flow)' },
    { name: 'Handwriting 16', label: 'Handwriting 16 (Quick Homework Hand)' },
    { name: 'Handwriting 17', label: 'Handwriting 17 (Loose Student Pen)' },
    { name: 'Handwriting 18', label: 'Handwriting 18 (Natural Exam Script)' },
    { name: 'Handwriting 19', label: 'Handwriting 19 (Casual Notebook Hand)' },
    { name: 'Handwriting 20', label: 'Handwriting 20 (Clean Rapid Flow)' },
    { name: 'Handwriting 21', label: 'Handwriting 21 (Fluid Study Notes)' },
    { name: 'Handwriting 22', label: 'Handwriting 22 (Authentic Class Pen)' },

    // === EXTREME MESSY / RAW HUMAN HANDWRITING ===
    { name: 'Covered By Your Grace', label: 'Messy Classroom Scrawl (Raw Ballpoint)' },
    { name: 'Walter Turncoat', label: 'Unhinged Student Scribble (Chaotic Natural Pen)' },
    { name: 'Rock Salt', label: 'Rough Marker Scratch (Gritty Raw Hand)' },
    { name: 'Grape Nuts', label: 'Shaky Rushed Notes (Trembling Ballpoint)' },
    { name: 'Swanky and Moo Moo', label: 'Wild Messy Scrawl (Extreme Imperfect Hand)' },
    { name: 'Sedgwick Ave', label: 'Street-Style Quick Scribble (Graffiti Pen)' },
    { name: 'Liu Jian Mao Cao', label: 'Extreme Brush Scrawl (Raw Calligraphy Rush)' },
    { name: 'Caveat', label: 'Natural Fast Handwriting (Organic Ballpoint Flow)' },
    { name: 'Coming Soon', label: 'Casual Classroom Print (Relaxed Student Hand)' },
    { name: 'Schoolbell', label: 'School Notebook Print (Natural Student Print)' },
    { name: 'Reenie Beanie', label: 'Tall Messy Scribble (Thin Rushed Pen)' },
    { name: 'Mr Dafoe', label: 'Illegible Doctor Signature (Extreme Cursive Scrawl)' },

    // === Rushed Doctor & Frantic Cursive Notes (Fast Connecting Script) ===
    { name: 'Meddon', label: "Doctor's Prescription (Rapid Connecting Ink Scrawl)" },
    { name: 'Kristi', label: 'Frantic Student Cursive (Rushed Slanted Pen)' },
    { name: 'WindSong', label: 'Rapid Medical Script (Flowing Connected Cursive)' },
    { name: 'Cedarville Cursive', label: 'Student Cursive (Natural Continuous Flow)' },
    { name: 'League Script', label: 'School Running Hand (Continuous Connected Ligatures)' },
    { name: 'Square Peg', label: 'Rapid Modern Cursive (Connected Flow)' },
    { name: 'La Belle Aurore', label: 'Student Cursive (Fast Ink Pen)' },
    { name: 'Waiting for the Sunrise', label: 'Notebook Cursive (Slanted Homework)' },
    { name: 'Marck Script', label: 'School Cursive (Fluid Script)' },
    { name: 'Zeyada', label: 'Loose Cursive (Casual Rushed Student)' },
    { name: 'Dawning of a New Day', label: 'Fine Ballpoint (Light Cursive)' },

    // === Authentic Rushed Student Homework & Ballpoint Scribbles ===
    { name: 'Nothing You Could Do', label: 'Student Homework (Authentic Ballpoint)' },
    { name: 'Mynerve', label: 'Rushed Student Scribble (Messy Ballpoint with Real Jitter)' },
    { name: 'Just Me Again Down Here', label: 'Student Notes (Rushed & Imperfect)' },
    { name: 'Just Another Hand', label: 'Rapid Lecture Scrawl (Narrow Fast Pen)' },
    { name: 'The Girl Next Door', label: 'Quick Notebook Scrawl (Natural Casual Hand)' },
    { name: 'Sue Ellen Francisco', label: 'Hurried Fine Scrawl (Quick Notes)' },
    { name: 'Loved by the King', label: 'Messy Tall Scrawl (Fast Class Notes)' },
    { name: 'Give You Glory', label: 'Hurried Student Hand (Imperfect Exam Notes)' },
    { name: 'Bad Script', label: 'Casual Ballpoint (Homework Notes)' },
];

const PAPERS = [
    { 
        id: 'youva-spiral', 
        name: 'Indian Student Spiral (Youva / Classmate)', 
        css: 'bg-white', 
        lineHeight: 32, 
        hasRedMargin: true,
        style: { 
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '100% 32px' 
        } 
    },
    { 
        id: 'college', 
        name: 'College Ruled (Red Margin)', 
        css: 'bg-white', 
        lineHeight: 32, 
        hasRedMargin: true,
        style: { 
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '100% 32px' 
        } 
    },
    { 
        id: 'lined', 
        name: 'Standard Blue Ruled', 
        css: 'bg-white', 
        lineHeight: 32, 
        hasRedMargin: false,
        style: { 
            backgroundImage: 'linear-gradient(#93c5fd 1px, transparent 1px)', 
            backgroundSize: '100% 32px' 
        } 
    },
    { 
        id: 'grid', 
        name: 'Engineering Graph Paper', 
        css: 'bg-white', 
        lineHeight: 28, 
        hasRedMargin: false,
        style: { 
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', 
            backgroundSize: '24px 24px, 24px 24px' 
        } 
    },
    { 
        id: 'blank', 
        name: 'Plain White Sheet', 
        css: 'bg-white', 
        lineHeight: 32, 
        hasRedMargin: false,
        style: {} 
    },
    { 
        id: 'vintage', 
        name: 'Vintage Notepad', 
        css: 'bg-[#fef3c7]', 
        lineHeight: 34, 
        hasRedMargin: false,
        style: { 
            backgroundColor: '#fef3c7', 
            backgroundImage: 'linear-gradient(#fde68a 1px, transparent 1px)', 
            backgroundSize: '100% 34px' 
        } 
    },
];

function normalizeInput(str: string): string {
    return str
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/-- /g, '— ')
        .replace(/\.\.\./g, '…');
}

export default function EditorPage() {
    const { addToast } = useToast();
    const sourceRef = useRef<HTMLTextAreaElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    
    // Global Store State
    const { 
        text, setText, 
        handwritingStyle: font, setHandwritingStyle: setFont,
        fontSize, setFontSize,
        inkColor: color,
        paperMaterial, setPaperMaterial,
        marginTop, marginBottom, marginLeft, marginRight, setMargins,
        showPageNumbers, showHeader, headerText, setPageOptions,
        showNotebookHeaderBox, setShowNotebookHeaderBox,
        notebookDate, setNotebookDate,
        jitter, setJitter,
        charJitter,
        fatigue,
        pressure, setPressure,
        smudge, setSmudge,
        baseline, setBaseline,
        textAlign, setTextAlign,
        autoTypoRate,
        strikeStyle,
        autoCaret,
        correctionColor,
        lowInkFade,
        lowInkStart,
        lowInkIntensity,
        phoneShadow,
        phoneShadowAngle,
        phoneShadowIntensity,
        phoneShadowVariation,
        perspectiveWarp,
        tiltX,
        tiltY,
        lightingMode,
        lightingWarmth,
        paperCrease,
        sensorNoise,
        randomTilt,
        coffeeStain,
        spiralBinding,
        inkBleedThrough,
        inkBleedIntensity,
        notebookBrand, setNotebookBrand,
        notebookDayCircle, setNotebookDayCircle,
        activePageIndex,
        setActivePageIndex,
        pageEffectOverrides,
        smartMarginIndexing, setSmartMarginIndexing,
        history: storeHistory, addToHistory,
        resetStyles, reset,
        resetFormatting, resetPaperSettings,
        randomizeRealism
    } = useStore();

    // 0ms Input Latency: Local Draft State with Debounced Sync to Store
    const [draftText, setDraftText] = useState(text);

    useEffect(() => {
        if (text !== draftText) {
            setDraftText(text);
        }
    }, [text]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (draftText !== text) {
                setText(normalizeInput(draftText));
            }
        }, 150);
        return () => clearTimeout(handler);
    }, [draftText, text, setText]);

    // Enhanced Textarea States & Handlers
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const [editorFontSize, setEditorFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
    const [isEditorExpanded, setIsEditorExpanded] = useState(false);

    const updateCursorPos = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const selStart = target.selectionStart || 0;
        const textBefore = target.value.slice(0, selStart);
        const lines = textBefore.split('\n');
        setCursorPos({
            line: lines.length,
            col: lines[lines.length - 1].length + 1
        });
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.currentTarget;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const next = draftText.slice(0, start) + '    ' + draftText.slice(end);
            setDraftText(next);
            setTimeout(() => {
                target.setSelectionRange(start + 4, start + 4);
            }, 0);
        } else if (e.key === 'Enter') {
            const target = e.currentTarget;
            const start = target.selectionStart;
            const textBefore = draftText.slice(0, start);
            const currentLine = textBefore.split('\n').pop() || '';
            
            // Smart auto-bullet and list continuation
            const bulletMatch = currentLine.match(/^(\s*)(•|-|\*)\s+/);
            const numMatch = currentLine.match(/^(\s*)(\d+)[\.\)]\s+/);
            
            if (bulletMatch) {
                if (currentLine.trim() === '•' || currentLine.trim() === '-' || currentLine.trim() === '*') {
                    // Double Enter: cancel list
                    e.preventDefault();
                    const lineStart = start - currentLine.length;
                    const next = draftText.slice(0, lineStart) + draftText.slice(start);
                    setDraftText(next);
                    setTimeout(() => {
                        target.setSelectionRange(lineStart, lineStart);
                    }, 0);
                } else {
                    e.preventDefault();
                    const insert = '\n' + bulletMatch[1] + bulletMatch[2] + ' ';
                    const next = draftText.slice(0, start) + insert + draftText.slice(start);
                    setDraftText(next);
                    setTimeout(() => {
                        target.setSelectionRange(start + insert.length, start + insert.length);
                    }, 0);
                }
            } else if (numMatch) {
                const num = parseInt(numMatch[2], 10);
                if (currentLine.trim() === `${num}.` || currentLine.trim() === `${num})`) {
                    // Double Enter: cancel numbered list
                    e.preventDefault();
                    const lineStart = start - currentLine.length;
                    const next = draftText.slice(0, lineStart) + draftText.slice(start);
                    setDraftText(next);
                    setTimeout(() => {
                        target.setSelectionRange(lineStart, lineStart);
                    }, 0);
                } else {
                    e.preventDefault();
                    const insert = '\n' + numMatch[1] + (num + 1) + '. ';
                    const next = draftText.slice(0, start) + insert + draftText.slice(start);
                    setDraftText(next);
                    setTimeout(() => {
                        target.setSelectionRange(start + insert.length, start + insert.length);
                    }, 0);
                }
            }
        }
    }, [draftText]);

    const handlePasteClipboard = useCallback(async () => {
        try {
            const clipText = await navigator.clipboard.readText();
            if (clipText) {
                const toInsert = isLikelyAIText(clipText) ? cleanAIText(clipText) : clipText;
                if (sourceRef.current) {
                    const start = sourceRef.current.selectionStart;
                    const end = sourceRef.current.selectionEnd;
                    const next = draftText.slice(0, start) + toInsert + draftText.slice(end);
                    setDraftText(next);
                    setText(next);
                    setTimeout(() => {
                        sourceRef.current?.focus();
                        sourceRef.current?.setSelectionRange(start + toInsert.length, start + toInsert.length);
                    }, 0);
                } else {
                    const next = draftText ? draftText + '\n\n' + toInsert : toInsert;
                    setDraftText(next);
                    setText(next);
                }
                if (isLikelyAIText(clipText)) {
                    addToast('Pasted & auto-cleaned AI content for handwriting!', 'success');
                } else {
                    addToast('Pasted from clipboard!', 'success');
                }
            }
        } catch (err) {
            console.warn('Clipboard read failed:', err);
        }
    }, [draftText, setText, addToast]);

    const handleCleanAIText = useCallback(() => {
        const cleaned = cleanAIText(draftText);
        setDraftText(cleaned);
        setText(cleaned);
        addToast('Cleaned AI preambles, headers & Q/A formatting!', 'success');
    }, [draftText, setText, addToast]);

    const handleCleanSpacing = useCallback(() => {
        const cleaned = draftText
            .split('\n')
            .map(l => l.trimEnd())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n');
        setDraftText(cleaned);
    }, [draftText]);

    // Floating MS Word-Style Context Toolbar for Text Selection
    const [floatingToolbar, setFloatingToolbar] = useState<{
        isOpen: boolean;
        x: number;
        y: number;
        text: string;
        source: 'canvas' | 'textarea';
        start?: number;
        end?: number;
    }>({
        isOpen: false,
        x: 0,
        y: 0,
        text: '',
        source: 'textarea',
    });

    const applyFormatToSelection = useCallback((prefix: string, suffix: string) => {
        if (!floatingToolbar.text) return;

        if (floatingToolbar.source === 'textarea' && floatingToolbar.start !== undefined && floatingToolbar.end !== undefined) {
            const start = floatingToolbar.start;
            const end = floatingToolbar.end;
            const selected = draftText.slice(start, end);
            
            let replacement = `${prefix}${selected}${suffix}`;
            if (prefix === '' && suffix === '') {
                // Clear formatting
                replacement = selected
                    .replace(/==(?:yellow:|green:|pink:|blue:)?/gi, '')
                    .replace(/==/g, '')
                    .replace(/\[\[/g, '')
                    .replace(/\]\]/g, '')
                    .replace(/__/g, '')
                    .replace(/~~/g, '')
                    .replace(/\*\*/g, '');
            }

            const next = draftText.slice(0, start) + replacement + draftText.slice(end);
            setDraftText(next);
            setText(next);
            setFloatingToolbar(prev => ({ ...prev, isOpen: false }));
            setTimeout(() => {
                sourceRef.current?.focus();
                sourceRef.current?.setSelectionRange(start, start + replacement.length);
            }, 10);
            addToast('Applied formatting to text!', 'success');
        } else if (floatingToolbar.source === 'canvas') {
            const term = floatingToolbar.text;
            const idx = draftText.indexOf(term);
            if (idx !== -1) {
                let replacement = `${prefix}${term}${suffix}`;
                if (prefix === '' && suffix === '') {
                    replacement = term
                        .replace(/==(?:yellow:|green:|pink:|blue:)?/gi, '')
                        .replace(/==/g, '')
                        .replace(/\[\[/g, '')
                        .replace(/\]\]/g, '')
                        .replace(/__/g, '')
                        .replace(/~~/g, '')
                        .replace(/\*\*/g, '');
                }
                const next = draftText.slice(0, idx) + replacement + draftText.slice(idx + term.length);
                setDraftText(next);
                setText(next);
                addToast(`Formatted "${term.slice(0, 20)}..." on paper!`, 'success');
            } else {
                addToast('Selection not found in source text', 'info');
            }
            setFloatingToolbar(prev => ({ ...prev, isOpen: false }));
            window.getSelection()?.removeAllRanges();
        }
    }, [floatingToolbar, draftText, setText, addToast]);

    // Detect selection on canvas preview (like MS Word)
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        const handleCanvasSelection = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) return;
                const text = selection.toString().trim();
                if (!text || text.length === 0) return;

                const container = canvasContainerRef.current;
                if (!container) return;

                if (selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
                    ? range.commonAncestorContainer.parentElement 
                    : range.commonAncestorContainer;
                if (!node || !container.contains(node)) return;

                const rect = range.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;

                setFloatingToolbar({
                    isOpen: true,
                    x: Math.min(window.innerWidth - 200, Math.max(200, rect.left + rect.width / 2)),
                    y: Math.max(16, rect.top - 50),
                    text,
                    source: 'canvas',
                });
            }, 30);
        };

        const container = canvasContainerRef.current;
        if (!container) return;

        container.addEventListener('mouseup', handleCanvasSelection);
        return () => {
            if (timer) clearTimeout(timer);
            container.removeEventListener('mouseup', handleCanvasSelection);
        };
    }, []);

    const handleTextareaSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        updateCursorPos(e);
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        if (end > start) {
            const selText = target.value.slice(start, end).trim();
            if (selText.length > 0) {
                const rect = target.getBoundingClientRect();
                setFloatingToolbar({
                    isOpen: true,
                    x: Math.min(window.innerWidth - 180, Math.max(180, rect.left + rect.width / 2)),
                    y: Math.max(16, rect.top - 46),
                    text: selText,
                    source: 'textarea',
                    start,
                    end,
                });
                return;
            }
        }
        setFloatingToolbar(prev => prev.source === 'textarea' ? { ...prev, isOpen: false } : prev);
    }, [updateCursorPos]);

    // Close floating toolbar on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.ms-word-floating-toolbar')) return;
            setFloatingToolbar(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close focus editor on Escape key
    useEffect(() => {
        if (!isEditorExpanded) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditorExpanded(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditorExpanded]);

    // Randomness Seed State for re-rolling variations
    const [randomSeed, setRandomSeed] = useState(0);

    // UI States
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'zip'>('pdf');
    const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [fontLoadedVersion, setFontLoadedVersion] = useState(0);

    // Dynamic optical font-size scaling per handwriting style (matches texttohandwriting.com calibration)
    const effectiveFontSize = useMemo(() => getEffectiveFontSize(font, fontSize), [font, fontSize]);

    // Actively load the handwriting font via FontFaceSet API and trigger precise re-measurement
    useEffect(() => {
        let active = true;
        const fontCss = getFontFamilyCss(font);
        if (typeof document !== 'undefined' && document.fonts) {
            document.fonts.load(`${effectiveFontSize}px ${fontCss}`).then(() => {
                if (active) {
                    clearWidthCache();
                    setFontLoadedVersion(v => v + 1);
                }
            }).catch(() => {});
        }
        return () => { active = false; };
    }, [font, effectiveFontSize]);

    // Navigation & Tab States
    const [activeSidebarTab, setActiveSidebarTab] = useState<'write' | 'pen' | 'paper' | 'realism' | 'effects'>('write');
    const [mobileTab] = useState<'write' | 'canvas' | 'settings'>('canvas');

    // Dynamic Zoom & Fit Engine
    const [zoomMode, setZoomMode] = useState<'fit-width' | 'fit-page' | 'manual'>('fit-width');
    const [manualZoom, setManualZoom] = useState(1.0);
    const [scale, setScale] = useState(1.0);

    const recalculateScale = useCallback(() => {
        if (!canvasContainerRef.current) return;
        const { clientWidth, clientHeight } = canvasContainerRef.current;
        if (clientWidth === 0 || clientHeight === 0) return;

        if (zoomMode === 'fit-width') {
            const availableWidth = clientWidth - 56;
            const newScale = Math.max(0.35, Math.min(1.4, availableWidth / 800));
            setScale(newScale);
        } else if (zoomMode === 'fit-page') {
            const availableHeight = clientHeight - 64;
            const newScale = Math.max(0.35, Math.min(1.2, availableHeight / 1131));
            setScale(newScale);
        } else {
            setScale(manualZoom);
        }
    }, [zoomMode, manualZoom]);

    useEffect(() => {
        recalculateScale();
        const el = canvasContainerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(recalculateScale);
        observer.observe(el);
        return () => observer.disconnect();
    }, [recalculateScale]);

    const setZoom = (newZoom: number) => {
        setZoomMode('manual');
        setManualZoom(Math.max(0.4, Math.min(2.0, Math.round(newZoom * 100) / 100)));
    };

    const zoomIn = () => setZoom(scale + 0.1);
    const zoomOut = () => setZoom(scale - 0.1);
    const zoomFitWidth = () => setZoomMode('fit-width');
    const zoomFitPage = () => setZoomMode('fit-page');
    const zoom100 = () => {
        setZoomMode('manual');
        setManualZoom(1.0);
    };

    // Sync Paper
    const paper = useMemo(() => {
        return PAPERS.find(p => p.id === paperMaterial) || PAPERS[0];
    }, [paperMaterial]);

    // Page Navigation & Thumbnail Jumping
    const handleJumpToPage = useCallback((targetIdx: number) => {
        setActivePageIndex(targetIdx);
        const el = document.querySelector(`[data-page-index="${targetIdx}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [setActivePageIndex]);

    // Page Effects States
    const [showStickyNote, setShowStickyNote] = useState(false);
    const [stickyNoteText, setStickyNoteText] = useState("Don't forget!");

    // History Snapshots (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (text && text.length > 10) {
                const latest = storeHistory[0];
                if (!latest || latest.text !== text) {
                    addToHistory({
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        text
                    });
                }
            }
        }, 10000); 
        return () => clearTimeout(timer);
    }, [text, storeHistory, addToHistory]);

    // Direct On-Paper Studio Editing State
    const [editingLine, setEditingLine] = useState<{ pIdx: number; lIdx: number } | null>(null);
    const [inlineText, setInlineText] = useState('');
    const inlineInputRef = useRef<HTMLInputElement>(null);

    const startInlineEdit = (pIdx: number, lIdx: number, currentLine: LineData) => {
        setEditingLine({ pIdx, lIdx });
        setInlineText(currentLine.text);
        setTimeout(() => {
            if (inlineInputRef.current) {
                inlineInputRef.current.focus();
                inlineInputRef.current.select();
            }
        }, 30);
    };

    const saveInlineEdit = (pIdx: number, lIdx: number) => {
        const targetPage = pages[pIdx];
        const line = targetPage?.lines[lIdx];
        if (!line) {
            setEditingLine(null);
            return;
        }

        const prefix = text.slice(0, line.startChar);
        const suffix = text.slice(line.endChar);
        
        let replacement = inlineText;
        if (line.marginIndex && !inlineText.startsWith(line.marginIndex)) {
            replacement = `${line.marginIndex} ${inlineText}`;
        }

        const updated = prefix + replacement + suffix;
        setDraftText(updated);
        setText(updated);
        setEditingLine(null);
        addToast('Updated on paper!', 'success');
    };

    const cancelInlineEdit = () => {
        setEditingLine(null);
    };

    // Creator Modal State
    const [showCreatorModal, setShowCreatorModal] = useState(false);

    // Empty Margin Text Editor State & Handlers
    const [editingMargin, setEditingMargin] = useState<{ pIdx: number; lIdx: number } | null>(null);
    const [marginInputText, setMarginInputText] = useState('');
    const marginInputRef = useRef<HTMLInputElement>(null);

    const startMarginEdit = (pIdx: number, lIdx: number, currentTag?: string) => {
        setEditingMargin({ pIdx, lIdx });
        setMarginInputText(currentTag || '');
        setTimeout(() => {
            if (marginInputRef.current) {
                marginInputRef.current.focus();
                marginInputRef.current.select();
            }
        }, 30);
    };

    const saveMarginEdit = (pIdx: number, lIdx: number) => {
        const targetPage = pages[pIdx];
        const line = targetPage?.lines[lIdx];
        if (!line) {
            setEditingMargin(null);
            return;
        }

        const trimmed = marginInputText.trim();
        const currentTag = line.marginIndex || '';
        const lineFullText = text.slice(line.startChar, line.endChar);
        let updatedLineText = lineFullText;

        if (currentTag) {
            if (lineFullText.startsWith(currentTag)) {
                const remainder = lineFullText.slice(currentTag.length).trimStart();
                updatedLineText = trimmed ? `${trimmed} ${remainder}` : remainder;
            } else {
                updatedLineText = trimmed ? `${trimmed} ${lineFullText.trimStart()}` : lineFullText;
            }
        } else {
            if (trimmed) {
                updatedLineText = `${trimmed} ${lineFullText}`;
            }
        }

        const prefix = text.slice(0, line.startChar);
        const suffix = text.slice(line.endChar);
        const updated = prefix + updatedLineText + suffix;

        setDraftText(updated);
        setText(updated);
        setEditingMargin(null);
        addToast(trimmed ? `Margin set: "${trimmed}"` : 'Margin tag cleared', 'success');
    };

    const cancelMarginEdit = () => {
        setEditingMargin(null);
    };

    // Deferred text for smooth background document compilation
    const deferredText = useDeferredValue(text);

    // --- PIPELINE EXECUTION: PRE-TOKENIZATION & PAGE PAGINATION ---
    const pages = useMemo(() => {
        const isSpiralActive = spiralBinding || paper.id === 'youva-spiral';
        const effectiveLeftForPagination = isSpiralActive ? Math.max(marginLeft, 118) : marginLeft;
        const effectiveRightForPagination = isSpiralActive ? Math.max(marginRight, 65) : marginRight;
        const effectiveTopForPagination = (paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox) 
            ? Math.max(marginTop, 80) 
            : marginTop;

        const bodyHeight = 1131 - effectiveTopForPagination - marginBottom;
        const linesPerPage = Math.max(1, Math.floor(bodyHeight / paper.lineHeight));
        const maxLineWidth = Math.max(200, (800 - effectiveLeftForPagination - effectiveRightForPagination) - 16);
        
        // Calculate header lines to reduce page 1 capacity
        const headerLineCount = showHeader && headerText.trim() ? headerText.split('\n').length : 0;
        const page1Lines = Math.max(1, linesPerPage - (headerLineCount > 0 ? headerLineCount + 1 : 0)); 

        const rawLines = buildDocumentLines(
            deferredText, 
            maxLineWidth,
            font,
            effectiveFontSize,
            String(randomSeed), 
            autoTypoRate, 
            strikeStyle, 
            autoCaret,
            smartMarginIndexing
        );
        return paginateLines(rawLines, linesPerPage, page1Lines);
    }, [deferredText, effectiveFontSize, font, fontLoadedVersion, paper.lineHeight, paper.hasRedMargin, paper.id, spiralBinding, showNotebookHeaderBox, marginTop, marginBottom, marginLeft, marginRight, showHeader, headerText, randomSeed, autoTypoRate, strikeStyle, autoCaret, smartMarginIndexing]);

    // Synchronize active page index with scroll position
    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const targets = container.querySelectorAll('.handwritten-export-target');
        if (!targets.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const pageAttr = entry.target.getAttribute('data-page-index');
                        if (pageAttr !== null) {
                            setActivePageIndex(Number(pageAttr));
                        }
                    }
                }
            },
            { root: container, threshold: 0.35 }
        );

        targets.forEach((t) => observer.observe(t));
        return () => observer.disconnect();
    }, [pages.length, setActivePageIndex]);

    // Word statistics
    const wordCount = useMemo(() => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }, [text]);

    // Click on handwritten word focuses source text
    const handleWordClick = (charIndex: number) => {
        if (sourceRef.current) {
            sourceRef.current.focus();
            sourceRef.current.setSelectionRange(charIndex, charIndex);
            sourceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Re-roll Random Variations
    const handleShuffleRandomness = () => {
        setRandomSeed(prev => prev + 1);
        addToast('Variations re-rolled!', 'info');
    };

    // Reset Handlers
    const handleResetStylesOnly = () => {
        resetStyles();
        setShowResetModal(false);
        addToast('Settings reset to defaults', 'success');
    };

    const handleResetEverything = () => {
        reset();
        setDraftText('');
        setShowResetModal(false);
        addToast('Document and settings cleared', 'success');
    };

    // Export execution
    const handleStartExport = (format: 'pdf' | 'zip') => {
        setExportFormat(format);
        setExportStatus('idle');
        setIsExportModalOpen(true);
        setProgress(0);
    };

    const executeExport = async (customName: string, explicitFormat?: 'pdf' | 'zip') => {
        const currentFormat = explicitFormat || exportFormat;
        setExportStatus('processing');
        setProgress(0);
        
        try {
            await import('../utils/exportUtils').then(({ exportDocument }) => 
                exportDocument({
                    name: customName,
                    format: currentFormat,
                    onProgress: (p) => setProgress(p)
                })
            );
            
            setExportStatus('complete');
            addToast('Export Complete!', 'success');
        } catch (err) {
            console.error('Export error:', err);
            setExportStatus('error');
            addToast(`Export Failed: ${(err as Error).message}`, 'error');
        }
    };

    return (
        <div className="w-screen h-screen overflow-hidden flex flex-col bg-white text-neutral-900 font-sans select-none">
            
            {/* ==================== TOP BAR (Apple/Linear Aesthetic) ==================== */}
            <header className="h-14 bg-white border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
                {/* Left: macOS Dots, Brand Badge & Editable Document Title */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        {/* macOS Colored Window Control Dots */}
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                        </div>
                        <div className="h-4 w-px bg-neutral-200" />
                        <div className="flex items-center gap-1.5">
                            <span className="font-display font-extrabold text-sm tracking-tight text-neutral-900">InkTrail</span>
                        </div>
                    </div>

                    <div className="h-4 w-px bg-neutral-200 hidden sm:block shrink-0" />

                    {/* Editable Document Title */}
                    <input 
                        type="text" 
                        value={headerText}
                        onChange={(e) => setPageOptions({ headerText: e.target.value })}
                        placeholder="Untitled Assignment"
                        className="bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white text-xs font-semibold text-neutral-800 placeholder:text-neutral-400 border border-neutral-200/60 focus:border-neutral-900 px-2.5 py-1 rounded-lg outline-none transition-all max-w-[140px] sm:max-w-[200px] truncate"
                    />

                    {/* Stats Pill */}
                    <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
                        <span>{pages.length} {pages.length === 1 ? 'page' : 'pages'}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-400" />
                        <span>{wordCount} words</span>
                    </div>
                </div>

                {/* Center: Canvas Zoom & Fit Dock */}
                <div className="hidden lg:flex items-center gap-1 bg-neutral-100/90 border border-neutral-200/80 p-1 rounded-xl shadow-2xs text-neutral-700">
                    <button 
                        onClick={zoomOut}
                        title="Zoom Out"
                        className="p-1.5 hover:bg-white hover:text-neutral-900 rounded-lg text-neutral-600 transition-all active:scale-95"
                    >
                        <ZoomOut size={13} />
                    </button>

                    <button 
                        onClick={zoom100}
                        title="Reset to 100%"
                        className="px-2 py-0.5 text-xs font-mono font-bold text-neutral-800 hover:bg-white rounded-lg transition-colors min-w-[44px] text-center"
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    <button 
                        onClick={zoomIn}
                        title="Zoom In"
                        className="p-1.5 hover:bg-white hover:text-neutral-900 rounded-lg text-neutral-600 transition-all active:scale-95"
                    >
                        <ZoomIn size={13} />
                    </button>

                    <div className="h-3 w-px bg-neutral-300 mx-0.5" />

                    <button 
                        onClick={zoomFitWidth}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            zoomMode === 'fit-width' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        Fit Width
                    </button>

                    <button 
                        onClick={zoomFitPage}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            zoomMode === 'fit-page' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        Fit Page
                    </button>
                </div>

                {/* Right: Randomize, Reset, Creator, History, Export Preview */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Realism Randomizer Dice Button */}
                    <button 
                        onClick={() => {
                            randomizeRealism();
                            handleShuffleRandomness();
                            addToast('🎲 Rolled organic human realism variations!', 'success');
                        }}
                        title="Roll random organic handwriting flaws, slant & lighting"
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-all active:scale-95 border border-amber-200/80 shadow-2xs"
                    >
                        <Dices size={13} className="text-amber-600" />
                        <span className="hidden sm:inline">Randomize</span>
                    </button>

                    {/* Reset Button */}
                    <button 
                        onClick={() => setShowResetModal(true)}
                        title="Reset document styles or clear page"
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-600 rounded-xl text-xs font-bold transition-all active:scale-95 border border-neutral-200/60"
                    >
                        <RotateCcw size={13} />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    {/* Creator Credits Button with Bipin's Picture */}
                    <button 
                        onClick={() => setShowCreatorModal(true)}
                        title="Created with passion by Bipin Vishwakarma — View Profile & Socials"
                        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200/70 text-neutral-700 rounded-xl text-xs font-bold transition-all active:scale-95 border border-neutral-200/60"
                    >
                        <div className="relative flex items-center justify-center">
                            <img 
                                src="https://avatars.githubusercontent.com/u/151464007?v=4" 
                                alt="Bipin Vishwakarma" 
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500 shadow-2xs"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://github.com/bipin-vishwakarma.png';
                                }}
                            />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
                        </div>
                        <span className="hidden md:inline text-[11px] font-semibold text-neutral-800">Bipin</span>
                    </button>

                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        title="Version History"
                        className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <Clock size={16} />
                    </button>

                    {/* Primary Export Preview Button */}
                    <button 
                        onClick={() => handleStartExport('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md shadow-neutral-900/15 transition-all active:scale-95"
                    >
                        <Download size={14} />
                        <span>Export Preview</span>
                    </button>
                </div>
            </header>

            {/* ==================== WORKSTATION BODY ==================== */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* 1. LEFT SIDEBAR CONTROLS */}
                <div className={`w-full lg:w-[400px] bg-white border-r border-neutral-200/80 flex flex-col shrink-0 overflow-hidden z-20 ${mobileTab === 'canvas' ? 'hidden lg:flex' : 'flex'}`}>
                    
                    {/* Navigation Tabs (Apple/Linear Segmented Style) */}
                    <div className="grid grid-cols-5 bg-neutral-100/90 p-1.5 shrink-0 border-b border-neutral-200/80 gap-1">
                        {[
                            { id: 'write' as const, label: 'Write', icon: FileText },
                            { id: 'pen' as const, label: 'Pen', icon: Palette },
                            { id: 'paper' as const, label: 'Paper', icon: AlignLeft },
                            { id: 'realism' as const, label: 'Realism', icon: Scissors },
                            { id: 'effects' as const, label: 'Effects', icon: Camera },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveSidebarTab(t.id)}
                                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                                    activeSidebarTab === t.id
                                        ? 'bg-neutral-900 text-white shadow-xs'
                                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60'
                                }`}
                            >
                                <t.icon size={13} />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels Content */}
                    <div className={`flex-1 ${activeSidebarTab === 'write' ? 'flex flex-col min-h-0' : 'overflow-y-auto custom-scrollbar space-y-6'} p-5 text-sm bg-white`}>
                        
                        {/* TAB 1: WRITE */}
                        {activeSidebarTab === 'write' && (
                            <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
                                {/* Heading Option */}
                                <div className="shrink-0 bg-neutral-50/90 p-3.5 rounded-2xl border border-neutral-200/80 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                Document Heading
                                            </span>
                                            {showHeader && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-neutral-700 select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={showHeader} 
                                                onChange={e => setPageOptions({ showHeader: e.target.checked })} 
                                                className="w-3.5 h-3.5 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                            />
                                            <span className="text-[11px]">Show Heading</span>
                                        </label>
                                    </div>

                                    {showHeader && (
                                        <div className="space-y-2">
                                            <textarea
                                                value={headerText}
                                                onChange={e => setPageOptions({ headerText: e.target.value })}
                                                placeholder="Name: Bipin Vishwakarma     Sap ID: 500124214&#10;Subject: Human Computer Interaction"
                                                rows={Math.min(4, Math.max(2, (headerText.split('\n').length)))}
                                                className="w-full min-h-[58px] max-h-[120px] p-2.5 rounded-xl bg-white border border-neutral-200/90 text-neutral-900 text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/15 focus:border-neutral-400 transition-all resize-y font-sans font-medium custom-scrollbar"
                                            />
                                            {/* Quick Heading Template Chips */}
                                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                                                <span className="text-neutral-400 font-bold text-[9px] uppercase tracking-wider">Presets:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setPageOptions({ headerText: 'Name: Bipin Vishwakarma     Sap ID: 500124214\nSubject: Assignment 1' })}
                                                    className="px-2 py-0.5 rounded-md bg-white hover:bg-neutral-200/70 text-neutral-600 border border-neutral-200 transition-colors cursor-pointer"
                                                >
                                                    Name & Sap ID
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPageOptions({ headerText: 'Assignment: Module 3 Notes\nDate: ' + new Date().toLocaleDateString('en-GB') })}
                                                    className="px-2 py-0.5 rounded-md bg-white hover:bg-neutral-200/70 text-neutral-600 border border-neutral-200 transition-colors cursor-pointer"
                                                >
                                                    Assignment & Date
                                                </button>
                                                {headerText && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPageOptions({ headerText: '' })}
                                                        className="text-neutral-400 hover:text-rose-600 text-[10px] ml-auto transition-colors font-medium"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Main Text Source Card - Instant 0ms Typing & Smooth Inset Scrollbar */}
                                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                                    {/* Action Bar & Stats */}
                                    <div className="flex items-center justify-between shrink-0 gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                Text Content
                                            </span>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full font-mono">
                                                {wordCount} words
                                            </span>
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full font-mono hidden sm:inline-block">
                                                {draftText.length} chars
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={handlePasteClipboard}
                                                title="Paste text from clipboard (auto-cleans AI preambles)"
                                                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-neutral-200/70 shadow-2xs active:scale-95"
                                            >
                                                <Clipboard size={12} />
                                                <span>Paste</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCleanAIText}
                                                title="Clean AI formatting, remove chat intros, and format headers & Q/A"
                                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                                            >
                                                <Sparkles size={12} className="text-amber-600" />
                                                <span>Clean AI</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditorExpanded(true)}
                                                title="Open Fullscreen Focus Mode"
                                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-neutral-200/60"
                                            >
                                                <Maximize2 size={12} />
                                                <span className="hidden sm:inline">Focus</span>
                                            </button>
                                            {draftText.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm('Clear all document text?')) {
                                                            setDraftText('');
                                                        }
                                                    }}
                                                    title="Clear All Text"
                                                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Detection & 1-Click Auto-Format Banner */}
                                    {isLikelyAIText(draftText) && (
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 animate-in fade-in duration-150 shrink-0">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Sparkles size={12} className="text-amber-600 shrink-0" />
                                                <span>AI chat formatting detected</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCleanAIText}
                                                className="px-2.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                                            >
                                                Auto-Format →
                                            </button>
                                        </div>
                                    )}

                                    {/* Inset Textarea Container - Floating Scrollbar & Status Bar */}
                                    <div className="flex-1 min-h-[260px] flex flex-col rounded-2xl bg-neutral-50/90 border border-neutral-200 focus-within:bg-white focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all shadow-2xs overflow-hidden">
                                        <textarea
                                            ref={sourceRef}
                                            value={draftText}
                                            onKeyDown={handleKeyDown}
                                            onKeyUp={handleTextareaSelect}
                                            onClick={handleTextareaSelect}
                                            onSelect={handleTextareaSelect}
                                            onMouseUp={handleTextareaSelect}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (val.includes('->')) {
                                                    val = val.replace(/(^|\s)->(\s|$)/g, '$1→$2');
                                                }
                                                setDraftText(val);
                                                updateCursorPos(e);
                                            }}
                                            placeholder="Start typing your text here...&#10;&#10;Supports markdown bullets, Q1/Ans formatting, ==highlighters==, [[boxes]], and [compare] tables!"
                                            className={`flex-1 w-full p-4 bg-transparent border-0 text-neutral-900 ${
                                                editorFontSize === 'sm' ? 'text-xs' : editorFontSize === 'lg' ? 'text-base' : 'text-sm'
                                            } leading-relaxed focus:outline-none transition-all resize-none font-sans overflow-y-auto custom-scrollbar pr-3`}
                                        />

                                        {/* Textarea Bottom Status Bar */}
                                        <div className="px-3.5 py-1.5 bg-neutral-100/70 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-500 font-medium select-none shrink-0">
                                            <div className="flex items-center gap-2.5">
                                                <span className="font-mono text-[10px] text-neutral-600 bg-white/80 px-1.5 py-0.5 rounded border border-neutral-200/60">
                                                    Ln {cursorPos.line}, Col {cursorPos.col}
                                                </span>
                                                <span className="text-neutral-300">•</span>
                                                <span className="text-[10px] text-neutral-500">
                                                    ~{Math.max(1, Math.ceil(wordCount / 220))} {Math.ceil(wordCount / 220) === 1 ? 'page' : 'pages'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditorFontSize(f => f === 'sm' ? 'base' : f === 'base' ? 'lg' : 'sm')}
                                                    title="Toggle Editor Text Size"
                                                    className="px-2 py-0.5 rounded-md hover:bg-neutral-200/80 text-[10px] font-bold text-neutral-600 transition-colors cursor-pointer"
                                                >
                                                    Text: {editorFontSize === 'sm' ? 'Compact' : editorFontSize === 'base' ? 'Medium' : 'Large'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditorExpanded(true)}
                                                    title="Open Fullscreen Focus Mode"
                                                    className="p-1 rounded-md hover:bg-neutral-200/80 text-neutral-600 transition-colors cursor-pointer"
                                                >
                                                    <Maximize2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PEN & STYLE */}
                        {activeSidebarTab === 'pen' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-1 border-b border-neutral-100">
                                    <span className="text-xs font-bold text-neutral-800">Pen & Typography</span>
                                    <button
                                        onClick={() => {
                                            resetFormatting();
                                            addToast('Pen settings reset to defaults', 'info');
                                        }}
                                        className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-800 font-semibold px-2 py-0.5 rounded-md hover:bg-neutral-100 transition-colors"
                                        title="Reset font size, line spacing and baseline"
                                    >
                                        <RotateCcw size={11} />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                {/* Font Selection */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                            Handwriting Style
                                        </label>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                                            {FONTS.length} Fonts
                                        </span>
                                    </div>
                                    <select
                                        value={font}
                                        onChange={e => setFont(e.target.value)}
                                        className="w-full p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer transition-all"
                                    >
                                        {FONTS.map(f => (
                                            <option key={f.name} value={f.name} className="py-1">{f.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Font Size & Baseline Slider */}
                                <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5 text-neutral-600 font-bold">
                                            <span>Font Size</span>
                                            <span className="font-mono text-neutral-900">{fontSize}px</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="14" 
                                            max="64" 
                                            value={fontSize} 
                                            onChange={e => setFontSize(Number(e.target.value))} 
                                            className="w-full accent-neutral-900 cursor-pointer" 
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5 text-neutral-600 font-bold">
                                            <span>Line Nudge / Baseline</span>
                                            <span className="font-mono text-neutral-900">{baseline}px</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="-10" 
                                            max="30" 
                                            value={baseline} 
                                            onChange={e => setBaseline(Number(e.target.value))} 
                                            className="w-full accent-neutral-900 cursor-pointer" 
                                        />
                                    </div>
                                </div>

                                {/* Text Alignment */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">
                                        Text Alignment
                                    </label>
                                    <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200/70">
                                        {[
                                            { id: 'left' as const, icon: AlignLeft },
                                            { id: 'center' as const, icon: AlignCenter },
                                            { id: 'right' as const, icon: AlignRight },
                                            { id: 'justify' as const, icon: AlignJustify }
                                        ].map(opt => (
                                            <button 
                                                key={opt.id} 
                                                onClick={() => setTextAlign(opt.id)} 
                                                className={`flex-1 p-2 flex justify-center rounded-xl transition-all ${
                                                    textAlign === opt.id ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                                                }`}
                                            >
                                                <opt.icon size={15} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pen Preset & Ink Color */}
                                <div className="space-y-3">
                                    <PenPresetSelector />
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PAPER & LAYOUT */}
                        {activeSidebarTab === 'paper' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-1 border-b border-neutral-100">
                                    <span className="text-xs font-bold text-neutral-800">Paper & Margins</span>
                                    <button
                                        onClick={() => {
                                            resetPaperSettings();
                                            addToast('Paper and margins reset to defaults', 'info');
                                        }}
                                        className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-800 font-semibold px-2 py-0.5 rounded-md hover:bg-neutral-100 transition-colors"
                                        title="Reset paper sheet and margin dimensions"
                                    >
                                        <RotateCcw size={11} />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                {/* Paper Type Selection */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2.5">
                                        Paper Material
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {PAPERS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPaperMaterial(p.id as any)}
                                                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border transition-all ${
                                                    paper.id === p.id 
                                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                                                        : 'bg-neutral-50 border-neutral-200/70 text-neutral-700 hover:bg-neutral-100'
                                                }`}
                                            >
                                                <span>{p.name}</span>
                                                {paper.id === p.id && <span className="w-2 h-2 rounded-full bg-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Page Number Option */}
                                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={showPageNumbers} 
                                        onChange={e => setPageOptions({ showPageNumbers: e.target.checked })} 
                                        className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-neutral-800">Show Bottom Page Numbers (— 1 —)</span>
                                </label>

                                {/* Classic Student Notebook Date & Page Box */}
                                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2.5">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-neutral-900">Classic Notebook Date & Page Box</span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-md">Iconic</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={showNotebookHeaderBox} 
                                            onChange={e => setShowNotebookHeaderBox(e.target.checked)} 
                                            className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                        />
                                    </label>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                                        Renders the pre-printed red Classmate/Navneet header box in the top-right corner with DATE and dynamic PAGE NO.
                                    </p>
                                    {showNotebookHeaderBox && (
                                        <div className="pt-2 space-y-2 border-t border-rose-200/60">
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] font-bold text-neutral-600 shrink-0">Custom Date:</label>
                                                <input 
                                                    type="text" 
                                                    value={notebookDate}
                                                    onChange={e => setNotebookDate(e.target.value)}
                                                    placeholder={new Date().toLocaleDateString('en-GB')}
                                                    className="flex-1 px-2.5 py-1 text-xs font-mono font-semibold bg-white border border-neutral-200 rounded-lg outline-none focus:border-neutral-900"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] font-bold text-neutral-600 shrink-0">Brand Label:</label>
                                                <select
                                                    value={notebookBrand}
                                                    onChange={e => setNotebookBrand(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-xs font-bold bg-white border border-neutral-200 rounded-lg outline-none focus:border-neutral-900 cursor-pointer"
                                                >
                                                    <option value="YOUVA">YOUVA (Navneet)</option>
                                                    <option value="CLASSMATE">CLASSMATE</option>
                                                    <option value="SPELLAR">SPELLAR</option>
                                                    <option value="SUNDARAM">SUNDARAM</option>
                                                </select>
                                            </div>
                                            <label className="flex items-center justify-between cursor-pointer pt-1">
                                                <span className="text-[11px] font-bold text-neutral-600">Circle Today's Day (M T W T F S S)</span>
                                                <input
                                                    type="checkbox"
                                                    checked={notebookDayCircle}
                                                    onChange={e => setNotebookDayCircle(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Smart Margin Indexing Option */}
                                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1.5">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-neutral-900">Smart Margin Indexing</span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">Student</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={smartMarginIndexing} 
                                            onChange={e => setSmartMarginIndexing(e.target.checked)} 
                                            className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                        />
                                    </label>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                                        Automatically places question markers (Q1., Q.1), answer tags (Ans:, Sol:), and Roman numerals in the left margin area like a real student notebook.
                                    </p>
                                </div>

                                {/* Margins */}
                                <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                                        Page Margins (px)
                                    </label>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-neutral-500 font-bold">
                                                <span>Top</span>
                                                <span className="font-mono text-neutral-900">{marginTop}</span>
                                            </div>
                                            <input type="range" min="20" max="150" value={marginTop} onChange={e => setMargins({ top: Number(e.target.value) })} className="w-full accent-neutral-900 cursor-pointer" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-neutral-500 font-bold">
                                                <span>Bottom</span>
                                                <span className="font-mono text-neutral-900">{marginBottom}</span>
                                            </div>
                                            <input type="range" min="20" max="150" value={marginBottom} onChange={e => setMargins({ bottom: Number(e.target.value) })} className="w-full accent-neutral-900 cursor-pointer" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-neutral-500 font-bold">
                                                <span>Left</span>
                                                <span className="font-mono text-neutral-900">{marginLeft}</span>
                                            </div>
                                            <input type="range" min="20" max="150" value={marginLeft} onChange={e => setMargins({ left: Number(e.target.value) })} className="w-full accent-neutral-900 cursor-pointer" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-neutral-500 font-bold">
                                                <span>Right</span>
                                                <span className="font-mono text-neutral-900">{marginRight}</span>
                                            </div>
                                            <input type="range" min="10" max="100" value={marginRight} onChange={e => setMargins({ right: Number(e.target.value) })} className="w-full accent-neutral-900 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: REALISM & ERRORS */}
                        {activeSidebarTab === 'realism' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-1 border-b border-neutral-100">
                                    <span className="text-xs font-bold text-neutral-800">Human Imperfections</span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => {
                                                randomizeRealism();
                                                addToast('🎲 Organic realism variations rolled!', 'success');
                                            }}
                                            className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-900 font-semibold px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/60"
                                            title="Roll random human flaws"
                                        >
                                            <Dices size={11} className="text-amber-600" />
                                            <span>Randomize</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setJitter(1.5);
                                                setPressure(1.0);
                                                setSmudge(0);
                                                addToast('Realism controls reset', 'info');
                                            }}
                                            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-800 font-semibold px-2 py-0.5 rounded-md hover:bg-neutral-100 transition-colors"
                                            title="Reset wobble, pressure and smudge"
                                        >
                                            <RotateCcw size={11} />
                                            <span>Reset</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1 text-neutral-600 font-bold">
                                            <span>Baseline Wobble</span>
                                            <span className="font-mono text-neutral-900">{jitter}</span>
                                        </div>
                                        <input type="range" min="0" max="6" step="0.5" value={jitter} onChange={e => setJitter(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1 text-neutral-600 font-bold">
                                            <span>Pen Pressure Variation</span>
                                            <span className="font-mono text-neutral-900">{Math.round(pressure * 100)}%</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.1" value={pressure} onChange={e => setPressure(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1 text-neutral-600 font-bold">
                                            <span>Ink Smudge</span>
                                            <span className="font-mono text-neutral-900">{smudge}</span>
                                        </div>
                                        <input type="range" min="0" max="5" step="0.5" value={smudge} onChange={e => setSmudge(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer" />
                                    </div>
                                </div>

                                {/* Human Errors & Strike Engine */}
                                <HumanErrorsControls />
                            </div>
                        )}

                        {/* TAB 5: EFFECTS & CAMERA PHYSICS */}
                        {activeSidebarTab === 'effects' && (
                            <div className="space-y-6">
                                {/* Camera & Photo Physics */}
                                <CameraPhysicsControls />

                                {/* Sticky Note Extra */}
                                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={showStickyNote} 
                                            onChange={e => setShowStickyNote(e.target.checked)} 
                                            className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-neutral-900 block">Sticky Post-it Note</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">Adds a yellow taped reminder on page 1</span>
                                        </div>
                                    </label>
                                    {showStickyNote && (
                                        <textarea
                                            value={stickyNoteText}
                                            onChange={e => setStickyNoteText(e.target.value)}
                                            placeholder="Write reminder note..."
                                            className="w-full h-18 p-3 rounded-xl bg-amber-100 text-amber-950 border border-amber-300/60 text-xs font-sans font-semibold focus:outline-none resize-none shadow-xs"
                                        />
                                     )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* 2. RIGHT DIGITAL CANVAS WORKSTATION (Edge-to-Edge Drafting Desk) */}
                <main 
                    ref={canvasContainerRef}
                    className={`flex-1 h-full overflow-auto custom-scrollbar flex flex-col items-center bg-[#F1F3F6] relative p-4 sm:p-8 pr-14 sm:pr-20 pb-16 select-text ${mobileTab !== 'canvas' ? 'hidden lg:flex' : 'flex'}`}
                >
                    {/* Drafting Desk Dot Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

                    {/* Pages Container */}
                    <div className="flex flex-col items-center gap-10 sm:gap-14 py-6 relative z-10 w-full">
                        {pages.map((page, pIdx) => {
                            const pageOverrides = pageEffectOverrides[pIdx] || {};
                            const effectiveCoffeeStain = pageOverrides.coffeeStain !== undefined ? pageOverrides.coffeeStain : coffeeStain;
                            const effectiveCrease = pageOverrides.paperCrease !== undefined ? pageOverrides.paperCrease : paperCrease;
                            const effectivePerspective = pageOverrides.perspectiveWarp !== undefined ? pageOverrides.perspectiveWarp : perspectiveWarp;
                            const baseTiltX = pageOverrides.tiltX !== undefined ? pageOverrides.tiltX : tiltX;
                            const baseTiltY = pageOverrides.tiltY !== undefined ? pageOverrides.tiltY : tiltY;
                            const pageTiltX = (effectivePerspective && randomTilt)
                                ? baseTiltX + Math.sin((pIdx + 1) * 7.91 + (randomSeed || 1)) * 3.5
                                : baseTiltX;
                            const pageTiltY = (effectivePerspective && randomTilt)
                                ? baseTiltY + Math.cos((pIdx + 1) * 6.33 + (randomSeed || 1)) * 3.5
                                : baseTiltY;
                            const effectiveLighting = pageOverrides.lightingMode !== undefined ? pageOverrides.lightingMode : lightingMode;
                            const effectiveWarmth = pageOverrides.lightingWarmth !== undefined ? pageOverrides.lightingWarmth : lightingWarmth;
                            const effectiveNoise = pageOverrides.sensorNoise !== undefined ? pageOverrides.sensorNoise : sensorNoise;
                            const pageShadow = computePagePhoneShadow(
                                pIdx,
                                phoneShadow,
                                phoneShadowAngle,
                                phoneShadowIntensity,
                                randomSeed,
                                phoneShadowVariation,
                                pageOverrides
                            );

                            const isSpiralActive = spiralBinding || paper.id === 'youva-spiral';
                            const isVerso = (pIdx + 1) % 2 === 0;
                            const isLeftSpiral = isSpiralActive && !isVerso;
                            const redMarginLeft = isLeftSpiral ? 104 : 65;
                            const effectivePageMarginLeft = isLeftSpiral ? Math.max(marginLeft, 118) : marginLeft;
                            const effectivePageMarginRight = (isSpiralActive && isVerso) ? Math.max(marginRight, 65) : marginRight;
                            const effectivePageMarginTop = (paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox)
                                ? Math.max(marginTop, 80)
                                : marginTop;

                            return (
                                <div 
                                    key={pIdx}
                                    style={{ 
                                        width: 800 * scale, 
                                        height: 1131 * scale,
                                    }}
                                    className="relative shrink-0 transition-all duration-150 ease-out cursor-pointer"
                                    onClick={() => setActivePageIndex(pIdx)}
                                >
                                    <div 
                                        className={`handwritten-page-render absolute top-0 left-0 w-[800px] h-[1131px] bg-white ${
                                            pIdx === activePageIndex 
                                                ? 'ring-2 ring-blue-500/70 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.22)]' 
                                                : pIdx === 0 
                                                    ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)]' 
                                                    : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]'
                                        } overflow-hidden rounded-xs origin-top-left`} 
                                        style={{ 
                                            transform: `scale(${scale})`,
                                            transformOrigin: 'top left',
                                        }}
                                    >
                                        {/* Export target capture area: 800x1131 container preserving 3D tilt and shadows */}
                                        <div 
                                            className="handwritten-export-target w-[800px] h-[1131px] relative overflow-hidden bg-white flex items-center justify-center"
                                            data-page-index={pIdx}
                                        >
                                            <div 
                                                className={`w-full h-full relative ${paper.css} transition-transform duration-200`} 
                                                style={{
                                                    ...paper.style,
                                                    ...(effectivePerspective ? {
                                                        transform: `perspective(1000px) rotateX(${pageTiltX}deg) rotateY(${pageTiltY}deg) scale(0.92)`,
                                                        transformOrigin: 'center center',
                                                        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.06)',
                                                        borderRadius: '3px',
                                                    } : {})
                                                }}
                                            >
                                                
                                                {/* Clean Top Margin Header Zone Mask (Clears any background ruled lines above double red rule) */}
                                                {(paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox) && (
                                                    <div 
                                                        className="absolute top-0 left-0 right-0 h-[72px] pointer-events-none z-[5]"
                                                        style={{
                                                            backgroundColor: paper.style.backgroundColor || (paper.id === 'vintage' ? '#fef3c7' : '#ffffff'),
                                                        }}
                                                    />
                                                )}

                                                {/* Red Margin Line (Full height top-to-bottom) */}
                                                {paper.hasRedMargin && (
                                                    <div 
                                                        className="absolute top-0 bottom-0 w-[2px] bg-rose-400 opacity-60 pointer-events-none z-10 transition-all" 
                                                        style={{ left: `${redMarginLeft}px` }}
                                                    />
                                                )}

                                                {/* Double Red Top Header Rule (Classic Indian Student Notebook Style) */}
                                                {(paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox) && (
                                                    <div className="absolute left-0 right-0 top-[72px] pointer-events-none z-10">
                                                        <div className="w-full h-[1.5px] bg-rose-400 opacity-65" />
                                                        <div className="w-full h-[1.5px] bg-rose-400 opacity-65 mt-[3px]" />
                                                    </div>
                                                )}

                                                {/* Physical Camera & Environment Overlay */}
                                                <CameraOverlay
                                                    phoneShadow={pageShadow.enabled}
                                                    phoneShadowAngle={pageShadow.angle}
                                                    phoneShadowIntensity={pageShadow.intensity}
                                                    phoneShadowX={pageShadow.shadowX}
                                                    phoneShadowY={pageShadow.shadowY}
                                                    phoneShadowWidth={pageShadow.width}
                                                    phoneShadowHeight={pageShadow.height}
                                                    phoneShadowPenumbra={pageShadow.penumbra}
                                                    lightingMode={effectiveLighting}
                                                    lightingWarmth={effectiveWarmth}
                                                    paperCrease={effectiveCrease}
                                                    sensorNoise={effectiveNoise}
                                                    coffeeStain={effectiveCoffeeStain}
                                                    pageIndex={pIdx}
                                                    spiralBinding={spiralBinding || paper.id === 'youva-spiral'}
                                                    inkBleedThrough={inkBleedThrough}
                                                    inkBleedIntensity={inkBleedIntensity}
                                                />

                                                {/* Sticky Note */}
                                                {showStickyNote && pIdx === 0 && (
                                                    <div 
                                                        className="absolute top-6 right-6 w-36 h-36 bg-amber-200 text-amber-950 p-4 shadow-xl rotate-3 z-30 font-sans text-xs font-semibold leading-snug rounded-xs border border-amber-300 pointer-events-none"
                                                    >
                                                        <div className="w-12 h-3 bg-amber-300/60 -top-1.5 left-1/2 -translate-x-1/2 absolute rounded-xs" />
                                                        {stickyNoteText}
                                                    </div>
                                                )}

                                                {/* Standardized Student Notebook Date & Page No. Box (Matching Real Youva/Classmate) */}
                                                {showNotebookHeaderBox && (
                                                    <div 
                                                        className="absolute top-[12px] z-20 pointer-events-none select-none text-left"
                                                        style={{
                                                            right: (isSpiralActive && isVerso) ? '64px' : '24px',
                                                            width: '168px',
                                                            height: '52px',
                                                            border: '1.2px solid rgba(244, 63, 94, 0.55)',
                                                            borderRadius: '4px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                                            display: 'flex',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {/* Left Section: 3 Rows (Days Tracker, Page No, Date) */}
                                                        <div className="flex-1 flex flex-col justify-between" style={{ width: '110px' }}>
                                                            {/* Row 1: M T W T F S S Day Tracker */}
                                                            <div className="h-[17px] border-b border-rose-400/45 flex items-center justify-around px-1 text-[7.5px] font-mono font-bold text-rose-500/80 select-none">
                                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => {
                                                                    const isToday = dIdx === ((new Date().getDay() + 6) % 7);
                                                                    return (
                                                                        <span key={dIdx} className="relative inline-flex items-center justify-center w-3 h-3">
                                                                            <span className={isToday && notebookDayCircle ? 'text-blue-700 font-black' : 'text-neutral-500'}>
                                                                                {day}
                                                                            </span>
                                                                            {isToday && notebookDayCircle && (
                                                                                <svg 
                                                                                    className="absolute -inset-0.5 w-3.5 h-3.5 pointer-events-none overflow-visible"
                                                                                    viewBox="0 0 20 20"
                                                                                >
                                                                                    <ellipse 
                                                                                        cx="10" 
                                                                                        cy="10" 
                                                                                        rx="7.5" 
                                                                                        ry="7" 
                                                                                        fill="none" 
                                                                                        stroke={color} 
                                                                                        strokeWidth="1.5" 
                                                                                        strokeDasharray="40" 
                                                                                        strokeDashoffset="1" 
                                                                                        transform="rotate(-8 10 10)" 
                                                                                        opacity="0.9"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Row 2: Page No. */}
                                                            <div className="h-[17px] border-b border-rose-400/45 flex items-center justify-between px-1.5 leading-none">
                                                                <span className="text-[8px] font-mono font-bold tracking-tight text-rose-500/85">
                                                                    Page No. :
                                                                </span>
                                                                <span 
                                                                    style={{
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: Math.max(13, fontSize * 0.8),
                                                                        color: color,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    {String(pIdx + 1).padStart(2, '0')}
                                                                </span>
                                                            </div>

                                                            {/* Row 3: Date */}
                                                            <div className="h-[17px] flex items-center justify-between px-1.5 leading-none">
                                                                <span className="text-[8px] font-mono font-bold tracking-tight text-rose-500/85">
                                                                    Date :
                                                                </span>
                                                                <span 
                                                                    style={{
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: Math.max(12, fontSize * 0.75),
                                                                        color: color,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    {notebookDate || new Date().toLocaleDateString('en-GB')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Section: Brand Badge Compartment */}
                                                        <div 
                                                            className="w-[58px] border-l border-rose-400/45 flex flex-col items-center justify-center p-1 select-none bg-rose-50/25 overflow-hidden text-center"
                                                        >
                                                            {(!notebookBrand || notebookBrand === 'YOUVA') && (
                                                                <div className="flex flex-col items-center justify-center w-full select-none">
                                                                    <span className="text-[10px] font-black tracking-wider text-rose-600/90 leading-none">
                                                                        YOUVA
                                                                    </span>
                                                                    <span className="text-[6px] font-extrabold tracking-widest text-rose-400/80 mt-0.5 uppercase">
                                                                        SPELLAR
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notebookBrand === 'CLASSMATE' && (
                                                                <div className="flex flex-col items-center justify-center w-full select-none">
                                                                    <span className="text-[10px] font-black tracking-tight text-rose-600/90 italic leading-none font-serif">
                                                                        classmate
                                                                    </span>
                                                                    <span className="text-[5px] font-bold tracking-[0.2em] text-rose-400/75 mt-0.5 uppercase">
                                                                        BY ITC
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notebookBrand === 'SPELLAR' && (
                                                                <div className="flex flex-col items-center justify-center w-full select-none">
                                                                    <span className="text-[9px] font-black tracking-wider text-rose-600/90 leading-none">
                                                                        SPELLAR
                                                                    </span>
                                                                    <span className="text-[5.5px] font-bold tracking-[0.16em] text-rose-400/75 mt-0.5 uppercase">
                                                                        NAVNEET
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notebookBrand === 'SUNDARAM' && (
                                                                <div className="flex flex-col items-center justify-center w-full px-0.5 select-none">
                                                                    {/* Authentic Sundaram Seal Emblem */}
                                                                    <div className="flex items-center justify-center gap-1 mb-0.5">
                                                                        <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="rgba(244, 63, 94, 0.08)" />
                                                                            <path d="M15 9.5c-.8-.8-2-1.2-3-1.2-1.7 0-3 1-3 2.5 0 2.8 6 1.8 6 4.5 0 1.5-1.3 2.7-3 2.7-1.4 0-2.6-.6-3.2-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                        </svg>
                                                                        <span className="text-[7.5px] font-black tracking-normal text-rose-600/90 leading-none">
                                                                            Sundaram
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[5px] font-bold tracking-[0.18em] text-rose-400/80 uppercase scale-95">
                                                                        CLASSIC
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Document Header (Page 1 Only) */}
                                                {showHeader && pIdx === 0 && headerText.trim() && (
                                                    <div 
                                                        className="absolute z-10 leading-tight whitespace-pre-wrap"
                                                        style={{
                                                            top: effectivePageMarginTop,
                                                            left: effectivePageMarginLeft,
                                                            right: effectivePageMarginRight,
                                                            fontFamily: getFontFamilyCss(font),
                                                            fontSize: fontSize * 1.05,
                                                            color: color,
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {headerText}
                                                    </div>
                                                )}

                                                {/* Document Body Lines */}
                                                <div 
                                                    className="w-full h-full relative select-text"
                                                    style={{
                                                        paddingTop: (pIdx === 0 && showHeader && headerText.trim())
                                                            ? effectivePageMarginTop + (headerText.split('\n').length + 1) * paper.lineHeight
                                                            : effectivePageMarginTop,
                                                        paddingBottom: marginBottom,
                                                        paddingLeft: effectivePageMarginLeft,
                                                        paddingRight: effectivePageMarginRight
                                                    }}
                                                >
                                                    {page.lines.map((line, lIdx) => (
                                                        <div 
                                                            key={lIdx} 
                                                            dir={line.dir}
                                                            onDoubleClick={() => startInlineEdit(pIdx, lIdx, line)}
                                                            style={{
                                                                fontFamily: getFontFamilyCss(font), 
                                                                fontSize: effectiveFontSize, 
                                                                color, 
                                                                height: paper.lineHeight, 
                                                                lineHeight: `${paper.lineHeight}px`, 
                                                                transform: `translateY(${baseline}px)`, 
                                                                textAlign: line.dir === 'rtl' ? (textAlign === 'left' ? 'right' : textAlign === 'right' ? 'left' : textAlign) : textAlign, 
                                                                paddingLeft: line.indent ? line.indent * (effectiveFontSize * 0.4) : 0,
                                                            }} 
                                                            className="w-full whitespace-nowrap relative group cursor-text"
                                                        >
                                                            {/* Interactive Left Margin Slot (Empty or Indexed) - Positioned safely past spiral */}
                                                            {effectivePageMarginLeft >= 30 && (
                                                                <div 
                                                                    className="absolute top-0 flex items-center justify-center group/margin cursor-pointer transition-colors z-20"
                                                                    style={{
                                                                        left: `-${effectivePageMarginLeft - (isLeftSpiral ? 48 : 0)}px`,
                                                                        width: `${isLeftSpiral ? (redMarginLeft - 48) : (redMarginLeft - 4)}px`,
                                                                        height: `${paper.lineHeight}px`,
                                                                        overflow: 'hidden',
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (editingMargin?.pIdx === pIdx && editingMargin?.lIdx === lIdx) return;
                                                                        startMarginEdit(pIdx, lIdx, line.marginIndex);
                                                                    }}
                                                                    title={line.marginIndex ? `Margin: ${line.marginIndex} (click to edit)` : 'Click to write Question / Answer # in margin'}
                                                                >
                                                                    {editingMargin?.pIdx === pIdx && editingMargin?.lIdx === lIdx ? (
                                                                        <input
                                                                            ref={marginInputRef}
                                                                            type="text"
                                                                            value={marginInputText}
                                                                            onChange={(e) => setMarginInputText(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    saveMarginEdit(pIdx, lIdx);
                                                                                } else if (e.key === 'Escape') {
                                                                                    e.preventDefault();
                                                                                    cancelMarginEdit();
                                                                                }
                                                                            }}
                                                                            onBlur={() => saveMarginEdit(pIdx, lIdx)}
                                                                            placeholder="Q1."
                                                                            className="w-[90%] text-center text-xs font-bold bg-white/95 text-blue-900 border border-blue-500 rounded px-1 py-0.5 shadow-sm outline-none font-mono"
                                                                            autoFocus
                                                                        />
                                                                    ) : line.marginIndex ? (
                                                                        <span 
                                                                            className="w-full text-center font-bold select-none group-hover/margin:text-blue-700 transition-colors"
                                                                            style={{
                                                                                color: color,
                                                                                fontFamily: getFontFamilyCss(font),
                                                                                fontSize: (line.marginIndex && line.marginIndex.length > 3) 
                                                                                    ? Math.min(fontSize * 0.85, 14) 
                                                                                    : Math.min(fontSize * 0.95, 17),
                                                                                opacity: 0.92,
                                                                                whiteSpace: 'nowrap',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'clip',
                                                                            }}
                                                                        >
                                                                            {line.marginIndex}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="opacity-0 group-hover/margin:opacity-60 text-[10px] text-neutral-400 font-mono select-none px-1 rounded hover:bg-neutral-200/50">
                                                                            + Q.
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Direct On-Paper Inline Input */}
                                                            {editingLine?.pIdx === pIdx && editingLine?.lIdx === lIdx ? (
                                                                <input
                                                                    ref={inlineInputRef}
                                                                    type="text"
                                                                    value={inlineText}
                                                                    onChange={(e) => setInlineText(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            saveInlineEdit(pIdx, lIdx);
                                                                        } else if (e.key === 'Escape') {
                                                                            e.preventDefault();
                                                                            cancelInlineEdit();
                                                                        }
                                                                    }}
                                                                    onBlur={() => saveInlineEdit(pIdx, lIdx)}
                                                                    style={{
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: effectiveFontSize,
                                                                        color,
                                                                        height: `${paper.lineHeight}px`,
                                                                        lineHeight: `${paper.lineHeight}px`,
                                                                    }}
                                                                    className="w-full bg-blue-50/80 border border-dashed border-blue-400 rounded-xs px-1 outline-none text-neutral-900 shadow-inner"
                                                                />
                                                            ) : line.type === 'comparison' && line.leftTokens && line.rightTokens ? (
                                                                <div className="w-full flex items-center h-full relative">
                                                                    {/* Left Column (50%) */}
                                                                    <div className="w-1/2 pr-3 overflow-hidden flex items-center whitespace-nowrap">
                                                                        {line.leftTokens.map((tok, tIdx) => {
                                                                            const totalPages = pages.length;
                                                                            const docProgress = totalPages > 0 ? (pIdx + (page.lines.length > 0 ? lIdx / page.lines.length : 0)) / totalPages : 0;
                                                                            return (
                                                                                <HandwrittenWord 
                                                                                    key={`left-${tIdx}`}
                                                                                    token={tok}
                                                                                    pageIndex={pIdx}
                                                                                    lineIndex={lIdx}
                                                                                    wordIndex={tIdx}
                                                                                    totalLines={page.lines.length}
                                                                                    randomSeed={String(randomSeed)}
                                                                                    fontFamily={font}
                                                                                    fontSize={effectiveFontSize}
                                                                                    color={color}
                                                                                    correctionColor={correctionColor}
                                                                                    jitter={jitter}
                                                                                    charJitter={charJitter}
                                                                                    fatigue={fatigue}
                                                                                    pressure={pressure}
                                                                                    smudge={smudge}
                                                                                    lowInkFade={lowInkFade}
                                                                                    lowInkStart={lowInkStart}
                                                                                    lowInkIntensity={lowInkIntensity}
                                                                                    docProgress={docProgress}
                                                                                    onClick={() => handleWordClick(line.charIndex)}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* Center Pen-Drawn Vertical Divider */}
                                                                    <div 
                                                                        className="absolute left-1/2 -top-0.5 bottom-0 -translate-x-1/2 w-[1.5px] pointer-events-none opacity-60"
                                                                        style={{
                                                                            backgroundColor: color,
                                                                            transform: `rotate(${((lIdx % 3) - 1) * 0.2}deg)`,
                                                                        }}
                                                                    />

                                                                    {/* Right Column (50%) */}
                                                                    <div className="w-1/2 pl-3 overflow-hidden flex items-center whitespace-nowrap">
                                                                        {line.rightTokens.map((tok, tIdx) => {
                                                                            const totalPages = pages.length;
                                                                            const docProgress = totalPages > 0 ? (pIdx + (page.lines.length > 0 ? lIdx / page.lines.length : 0)) / totalPages : 0;
                                                                            return (
                                                                                <HandwrittenWord 
                                                                                    key={`right-${tIdx}`}
                                                                                    token={tok}
                                                                                    pageIndex={pIdx}
                                                                                    lineIndex={lIdx}
                                                                                    wordIndex={tIdx + 100}
                                                                                    totalLines={page.lines.length}
                                                                                    randomSeed={String(randomSeed)}
                                                                                    fontFamily={font}
                                                                                    fontSize={effectiveFontSize}
                                                                                    color={color}
                                                                                    correctionColor={correctionColor}
                                                                                    jitter={jitter}
                                                                                    charJitter={charJitter}
                                                                                    fatigue={fatigue}
                                                                                    pressure={pressure}
                                                                                    smudge={smudge}
                                                                                    lowInkFade={lowInkFade}
                                                                                    lowInkStart={lowInkStart}
                                                                                    lowInkIntensity={lowInkIntensity}
                                                                                    docProgress={docProgress}
                                                                                    onClick={() => handleWordClick(line.charIndex)}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* Subtle edit pencil icon on line hover */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            startInlineEdit(pIdx, lIdx, line);
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-2 text-[10px] text-blue-500 align-middle inline-flex items-center cursor-pointer absolute right-0"
                                                                        title="Edit this line directly on paper"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {line.tokens.map((tok, tIdx) => {
                                                                        const totalPages = pages.length;
                                                                        const docProgress = totalPages > 0 ? (pIdx + (page.lines.length > 0 ? lIdx / page.lines.length : 0)) / totalPages : 0;
                                                                        return (
                                                                            <HandwrittenWord 
                                                                                key={tIdx}
                                                                                token={tok}
                                                                                pageIndex={pIdx}
                                                                                lineIndex={lIdx}
                                                                                wordIndex={tIdx}
                                                                                totalLines={page.lines.length}
                                                                                randomSeed={String(randomSeed)}
                                                                                fontFamily={font}
                                                                                fontSize={effectiveFontSize}
                                                                                color={color}
                                                                                correctionColor={correctionColor}
                                                                                jitter={jitter}
                                                                                charJitter={charJitter}
                                                                                fatigue={fatigue}
                                                                                pressure={pressure}
                                                                                smudge={smudge}
                                                                                lowInkFade={lowInkFade}
                                                                                lowInkStart={lowInkStart}
                                                                                lowInkIntensity={lowInkIntensity}
                                                                                docProgress={docProgress}
                                                                                onClick={() => handleWordClick(line.charIndex)}
                                                                            />
                                                                        );
                                                                    })}
                                                                    {/* Subtle edit pencil icon on line hover */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            startInlineEdit(pIdx, lIdx, line);
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-2 text-[10px] text-blue-500 align-middle inline-flex items-center cursor-pointer"
                                                                        title="Edit this line directly on paper"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Page Number */}
                                                {showPageNumbers && (
                                                    <div 
                                                        className="absolute bottom-5 left-0 right-0 text-center font-sans text-[11px] opacity-40 font-mono tracking-widest pointer-events-none"
                                                        style={{ color }}
                                                    >
                                                        — {pIdx + 1} —
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Floating Multi-Page Thumbnail Navigation Dock */}
                    <ThumbnailBar
                        totalPages={pages.length}
                        activePageIndex={activePageIndex}
                        onSelectPage={handleJumpToPage}
                        paperId={paperMaterial}
                    />
                </main>
            </div>

            {/* ==================== RESET CONFIRMATION MODAL ==================== */}
            {showResetModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-neutral-200/80 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <RotateCcw size={16} />
                                </div>
                                <h3 className="font-bold text-sm text-neutral-900">Reset Document</h3>
                            </div>
                            <button onClick={() => setShowResetModal(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full">
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-xs text-neutral-500 leading-relaxed">
                            Choose how you would like to reset your document:
                        </p>

                        <div className="space-y-2.5 pt-1">
                            <button
                                onClick={handleResetStylesOnly}
                                className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl text-xs font-bold text-left transition-colors flex flex-col gap-0.5"
                            >
                                <span className="font-bold text-neutral-900">Reset Styles Only</span>
                                <span className="text-[10px] text-neutral-500 font-normal">Restores default font, paper, margins, and effects. Keeps your text.</span>
                            </button>

                            <button
                                onClick={handleResetEverything}
                                className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold text-left transition-colors flex flex-col gap-0.5"
                            >
                                <span className="font-bold text-rose-700">Reset Everything (Start Fresh)</span>
                                <span className="text-[10px] text-rose-500 font-normal">Clears all text and resets all settings to default.</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowResetModal(false)}
                            className="w-full py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== MULTI-PAGE EXPORT PREVIEW MODAL ==================== */}
            <ExportModal 
                key={isExportModalOpen ? 'open' : 'closed'}
                isOpen={isExportModalOpen}
                onClose={() => {
                    setIsExportModalOpen(false);
                    if (exportStatus !== 'processing') setExportStatus('idle');
                }}
                onStart={(name, fmt) => executeExport(name, fmt)}
                format={exportFormat}
                onFormatChange={(fmt) => setExportFormat(fmt)}
                progress={progress}
                status={exportStatus}
                initialFileName={headerText || 'handwritten-assignment'}
                pages={pages}
                paper={paper}
                font={font}
                fontSize={fontSize}
                color={color}
                correctionColor={correctionColor}
                baseline={baseline}
                textAlign={textAlign}
                marginTop={marginTop}
                marginBottom={marginBottom}
                marginLeft={marginLeft}
                marginRight={marginRight}
                showHeader={showHeader}
                headerText={headerText}
                showPageNumbers={showPageNumbers}
                jitter={jitter}
                charJitter={charJitter}
                fatigue={fatigue}
                pressure={pressure}
                smudge={smudge}
                phoneShadow={phoneShadow}
                phoneShadowAngle={phoneShadowAngle}
                phoneShadowIntensity={phoneShadowIntensity}
                phoneShadowVariation={phoneShadowVariation}
                lightingMode={lightingMode}
                lightingWarmth={lightingWarmth}
                paperCrease={paperCrease}
                sensorNoise={sensorNoise}
                perspectiveWarp={perspectiveWarp}
                tiltX={tiltX}
                tiltY={tiltY}
                randomTilt={randomTilt}
                smartMarginIndexing={smartMarginIndexing}
                coffeeStain={coffeeStain}
                pageEffectOverrides={pageEffectOverrides}
                showStickyNote={showStickyNote}
                stickyNoteText={stickyNoteText}
                lowInkFade={lowInkFade}
                lowInkStart={lowInkStart}
                lowInkIntensity={lowInkIntensity}
                showNotebookHeaderBox={showNotebookHeaderBox}
                notebookDate={notebookDate}
                spiralBinding={spiralBinding || paper.id === 'youva-spiral'}
                inkBleedThrough={inkBleedThrough}
                inkBleedIntensity={inkBleedIntensity}
                notebookBrand={notebookBrand}
                notebookDayCircle={notebookDayCircle}
                randomSeed={randomSeed}
                wordCount={wordCount}
            />

            {/* Creator Credits Modal */}
            <CreatorModal 
                isOpen={showCreatorModal} 
                onClose={() => setShowCreatorModal(false)} 
            />

            <HistoryModal 
                isOpen={isHistoryOpen} 
                onClose={() => setIsHistoryOpen(false)} 
            />

            {/* Fullscreen / Focus Writing Modal */}
            {isEditorExpanded && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-label="Distraction-Free Focus Editor"
                    className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
                >
                    <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-neutral-200 overflow-hidden ring-1 ring-black/10">
                        {/* Top Toolbar */}
                        <div className="px-5 py-3.5 bg-neutral-50/95 border-b border-neutral-200 flex items-center justify-between gap-4 select-none shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-neutral-900 text-white shadow-xs">
                                    <Sparkles size={16} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                                        Focus Writing Mode
                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-700">
                                            Distraction Free
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                                        <span>{wordCount} words</span>
                                        <span>•</span>
                                        <span>{draftText.length} characters</span>
                                        <span>•</span>
                                        <span className="text-neutral-700 font-semibold">
                                            ~{Math.max(1, Math.ceil(wordCount / 220))} handwritten {Math.ceil(wordCount / 220) === 1 ? 'page' : 'pages'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Font Size Toggle */}
                                <div className="hidden sm:flex items-center bg-neutral-200/60 p-0.5 rounded-lg text-[11px] font-semibold text-neutral-600">
                                    <button
                                        type="button"
                                        onClick={() => setEditorFontSize('sm')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            editorFontSize === 'sm' ? 'bg-white text-neutral-900 shadow-2xs' : 'hover:text-neutral-900'
                                        }`}
                                    >
                                        Compact
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditorFontSize('base')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            editorFontSize === 'base' ? 'bg-white text-neutral-900 shadow-2xs' : 'hover:text-neutral-900'
                                        }`}
                                    >
                                        Medium
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditorFontSize('lg')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            editorFontSize === 'lg' ? 'bg-white text-neutral-900 shadow-2xs' : 'hover:text-neutral-900'
                                        }`}
                                    >
                                        Large
                                    </button>
                                </div>

                                {/* Quick Tools */}
                                <button
                                    type="button"
                                    onClick={handlePasteClipboard}
                                    title="Paste from clipboard"
                                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                >
                                    <Clipboard size={13} />
                                    <span className="hidden md:inline">Paste</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCleanSpacing}
                                    title="Clean extra empty lines"
                                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                >
                                    <Sparkles size={13} className="text-amber-500" />
                                    <span className="hidden md:inline">Clean Spacing</span>
                                </button>

                                {/* Close / Minimize */}
                                <button
                                    type="button"
                                    onClick={() => setIsEditorExpanded(false)}
                                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ml-1"
                                >
                                    <Minimize2 size={13} />
                                    <span>Done</span>
                                    <kbd className="hidden lg:inline ml-1 text-[9px] bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded">Esc</kbd>
                                </button>
                            </div>
                        </div>

                        {/* MS Word-Style Ribbon Toolbar */}
                        <div className="px-5 py-2.5 bg-neutral-100/75 border-b border-neutral-200 flex items-center gap-3 overflow-x-auto custom-scrollbar select-none shrink-0">
                            {/* Group 1: AI & Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-neutral-200">
                                <button
                                    type="button"
                                    onClick={handleCleanAIText}
                                    title="Auto-Clean ChatGPT / Claude dumps (removes chat greetings, formats headings & Q/A)"
                                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                >
                                    <Sparkles size={13} />
                                    <span>Clean AI Text</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePasteClipboard}
                                    title="Paste from clipboard"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                                >
                                    <Clipboard size={12} />
                                    <span>Paste</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCleanSpacing}
                                    title="Clean extra empty lines"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                                >
                                    <span>Clean Space</span>
                                </button>
                            </div>

                            {/* Group 2: Document Structure & Headings */}
                            <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-neutral-200">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Style:</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftText(prev => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + '__TITLE OF ASSIGNMENT__\n\n');
                                    }}
                                    title="Title / Double Underline (__TITLE__)"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-md text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    Title (H1)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftText(prev => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + '__Section Name__\n');
                                    }}
                                    title="Subheading (__Section__)"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-md text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    Section (H2)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftText(prev => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + 'Q1: \nAns: ');
                                    }}
                                    title="Question & Answer block"
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 rounded-md text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    📝 Q&A
                                </button>
                            </div>

                            {/* Group 3: Formatting & Emphasis */}
                            <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-neutral-200">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Font:</span>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('__', '__')}
                                    title="Double Underline (__text__)"
                                    className="w-7 h-7 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-md text-xs font-bold flex items-center justify-center underline underline-offset-2 shadow-2xs cursor-pointer"
                                >
                                    U
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('[[', ']]')}
                                    title="Hand-Drawn Formula Box ([[text]])"
                                    className="px-2 h-7 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-md text-xs font-mono font-bold flex items-center justify-center shadow-2xs cursor-pointer"
                                >
                                    [Box]
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('~~', '~~')}
                                    title="Scribble Strike-Through (~~text~~)"
                                    className="w-7 h-7 bg-white hover:bg-neutral-100 text-rose-600 border border-neutral-200 rounded-md text-xs font-bold flex items-center justify-center line-through shadow-2xs cursor-pointer"
                                >
                                    S
                                </button>
                            </div>

                            {/* Group 4: Highlighters */}
                            <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-neutral-200">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Highlight:</span>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('==', '==')}
                                    title="Yellow Chisel Highlighter (==text==)"
                                    className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-950 rounded-md text-xs font-bold shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500/50" />
                                    <span>Yellow</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('==green:', '==')}
                                    title="Green Chisel Highlighter (==green:text==)"
                                    className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-md text-xs font-bold shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500/50" />
                                    <span>Green</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('==pink:', '==')}
                                    title="Pink Chisel Highlighter (==pink:text==)"
                                    className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-950 rounded-md text-xs font-bold shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-500/50" />
                                    <span>Pink</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFormatToSelection('==blue:', '==')}
                                    title="Blue Chisel Highlighter (==blue:text==)"
                                    className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-md text-xs font-bold shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-500/50" />
                                    <span>Blue</span>
                                </button>
                            </div>

                            {/* Group 5: Inserts */}
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Insert:</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftText(prev => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + '• ');
                                    }}
                                    title="Bullet List Item (•)"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-md text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    • Bullet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftText(prev => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + '1. ');
                                    }}
                                    title="Numbered List Item (1.)"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-md text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    1. Numbered
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sampleCompare = '\n[compare: Parameter | Method A | Method B]\nSpeed | Fast | Moderate\nAccuracy | 98.2% | 85.0%\n[/compare]\n';
                                        setDraftText(prev => prev + (prev.endsWith('\n') || !prev ? '' : '\n') + sampleCompare);
                                    }}
                                    title="2-Column Student Comparison Table"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    ⚖️ Table
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftText(prev => prev + ' → ');
                                    }}
                                    title="Student Handwritten Arrow (→)"
                                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-blue-700 border border-neutral-200 rounded-md text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
                                >
                                    → Arrow
                                </button>
                            </div>
                        </div>

                        {/* Expanded Fullscreen Textarea */}
                        <div className="flex-1 relative flex flex-col bg-white overflow-hidden">
                            <textarea
                                autoFocus
                                value={draftText}
                                onKeyDown={handleKeyDown}
                                onKeyUp={handleTextareaSelect}
                                onClick={handleTextareaSelect}
                                onSelect={handleTextareaSelect}
                                onMouseUp={handleTextareaSelect}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.includes('->')) {
                                        val = val.replace(/(^|\s)->(\s|$)/g, '$1→$2');
                                    }
                                    setDraftText(val);
                                    updateCursorPos(e);
                                }}
                                placeholder="Write your long assignment or notes here in focus mode...&#10;&#10;Supports Tab indentation, smart Enter list continuation, and instant live sync to handwritten paper."
                                className={`flex-1 w-full p-6 bg-transparent border-0 text-neutral-900 ${
                                    editorFontSize === 'sm' ? 'text-sm' : editorFontSize === 'lg' ? 'text-lg' : 'text-base'
                                } leading-relaxed focus:outline-none resize-none font-sans overflow-y-auto custom-scrollbar`}
                            />
                        </div>

                        {/* Bottom Status Bar */}
                        <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-medium select-none shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-2xs">
                                    Line {cursorPos.line}, Column {cursorPos.col}
                                </span>
                                <span className="text-neutral-400">•</span>
                                <span>Tab: 4 spaces indent</span>
                                <span className="text-neutral-400">•</span>
                                <span>Enter: Auto-bullet continuation</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {draftText.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to clear all text?')) {
                                                setDraftText('');
                                            }
                                        }}
                                        className="text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                        <span>Clear</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsEditorExpanded(false)}
                                    className="text-neutral-900 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                    Return to Document & Preview →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MS Word / Notion Style Floating Mini-Toolbar */}
            {floatingToolbar.isOpen && (
                <div
                    className="ms-word-floating-toolbar fixed z-50 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/95 text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none pointer-events-auto"
                    style={{
                        left: `${floatingToolbar.x}px`,
                        top: `${floatingToolbar.y}px`,
                    }}
                >
                    {/* Highlighter color swatches */}
                    <div className="flex items-center gap-1 pr-2 border-r border-white/20">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatToSelection('==', '==')}
                            title="Yellow Highlighter (==text==)"
                            className="w-5 h-5 rounded-full bg-yellow-400 hover:scale-120 active:scale-95 transition-transform shadow-xs cursor-pointer flex items-center justify-center text-neutral-950 text-[10px] font-bold"
                        >
                            Y
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatToSelection('==green:', '==')}
                            title="Green Highlighter (==green:text==)"
                            className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-120 active:scale-95 transition-transform shadow-xs cursor-pointer flex items-center justify-center text-neutral-950 text-[10px] font-bold"
                        >
                            G
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatToSelection('==pink:', '==')}
                            title="Pink Highlighter (==pink:text==)"
                            className="w-5 h-5 rounded-full bg-pink-400 hover:scale-120 active:scale-95 transition-transform shadow-xs cursor-pointer flex items-center justify-center text-neutral-950 text-[10px] font-bold"
                        >
                            P
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatToSelection('==blue:', '==')}
                            title="Blue Highlighter (==blue:text==)"
                            className="w-5 h-5 rounded-full bg-sky-400 hover:scale-120 active:scale-95 transition-transform shadow-xs cursor-pointer flex items-center justify-center text-neutral-950 text-[10px] font-bold"
                        >
                            B
                        </button>
                    </div>

                    {/* Word formatting options */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFormatToSelection('__', '__')}
                        title="Double Underline (__text__)"
                        className="px-2 py-0.5 hover:bg-white/20 rounded-md text-xs font-bold transition-colors cursor-pointer underline underline-offset-2"
                    >
                        U
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFormatToSelection('[[', ']]')}
                        title="Hand-Drawn Formula Box ([[text]])"
                        className="px-2 py-0.5 hover:bg-white/20 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer text-amber-300"
                    >
                        [Box]
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFormatToSelection('~~', '~~')}
                        title="Scribble Strike-Through (~~text~~)"
                        className="px-2 py-0.5 hover:bg-white/20 rounded-md text-xs font-bold transition-colors cursor-pointer line-through text-rose-300"
                    >
                        S
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFormatToSelection('^', '^')}
                        title="Caret Missing Word (^word^)"
                        className="px-1.5 py-0.5 hover:bg-white/20 rounded-md text-xs font-mono transition-colors cursor-pointer text-blue-300"
                    >
                        ^
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFormatToSelection('', '')}
                        title="Clear Formatting from Selection"
                        className="px-1.5 py-0.5 hover:bg-white/20 text-neutral-400 hover:text-white rounded-md text-xs transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}