import { useState, useMemo, useDeferredValue, useEffect, useRef, useCallback } from 'react';

import { 
    FileText, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify, 
    Download, Clock, 
    ZoomIn, ZoomOut, Palette,
    RotateCcw, Camera, Scissors, X, Dices
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
import { parseWordToken, measureWordWidth, getFontFamilyCss, clearWidthCache, type WordToken } from '../utils/humanErrorEngine';
import { computePagePhoneShadow } from '../utils/cameraShadowEngine';
import type { StrikeStyle } from '../types';

// --- PIPELINE TYPES ---
interface LineData {
    tokens: WordToken[];
    text: string;
    type: 'text' | 'bullet' | 'number' | 'empty';
    indent: number;
    dir?: 'ltr' | 'rtl';
    charIndex: number;
    marginIndex?: string;
    startChar: number;
    endChar: number;
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

    for (let pIndex = 0; pIndex < rawParagraphs.length; pIndex++) {
        const paragraph = rawParagraphs[pIndex];
        const paraStartOffset = globalCharOffset;
        const paraEndOffset = globalCharOffset + paragraph.length;
        globalCharOffset += paragraph.length + 1; // +1 for newline

        // Empty line handling
        if (paragraph.trim().length === 0) {
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

        // Smart Margin Indexing Engine:
        // Detects Question numbers (Q1., Q.1, Question 1:), Answer tags (Ans:, Answer:),
        // Item bullets, and Roman numerals ((i), i., 1., (a))
        let marginMarker: string | undefined = undefined;
        let indentLevel = 0;
        let lineType: 'text' | 'bullet' | 'number' = 'text';
        let bodyText = paragraph;

        if (smartMarginIndexing) {
            const marginMatch = paragraph.match(
                /^(\s*)(Q(?:uestion|ues|ue)?\.?\s*\d+[\.\:\)]?|Ans(?:wer)?[\.\:\-]?|Sol(?:ution)?[\.\:\-]?|A\d+[\.\:\)]?|\(\s*[a-zA-Z0-9ivxlcdm]+\s*\)|\d+[\.\)]|[ivxlcdm]+[\.\)]|[a-zA-Z][\.\)])\s*(.*)$/i
            );
            if (marginMatch) {
                marginMarker = marginMatch[2].trim();
                bodyText = marginMatch[3] || '';
                lineType = 'number';
            }
        }

        if (!marginMarker) {
            const bulletMatch = paragraph.match(/^(\s*)([-*•])\s+(.*)$/);
            const numberMatch = paragraph.match(/^(\s*)(\d+[\.\)])\s+(.*)$/);

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
        const rawWords = bodyText.split(/\s+/).filter(Boolean);

        // Pre-parse tokens through Human Error Engine
        const tokens: WordToken[] = rawWords.flatMap((word, wIdx) => 
            parseWordToken(word, wIdx, 0, pIndex, seed, typoRate, strikeStyle, autoCaret)
        );

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
    { name: 'Handwriting 1', label: 'Student 1 (Clean Pen)' },
    { name: 'Handwriting 2', label: 'Student 2 (Casual Slant)' },
    { name: 'Handwriting 3', label: 'Student 3 (Neat Ballpoint)' },
    { name: 'Handwriting 4', label: 'Student 4 (Fluid Cursive)' },
    { name: 'Handwriting 5', label: 'Student 5 (Fast Flow)' },
    { name: 'Handwriting 6', label: 'Student 6 (Compact Print)' },
    { name: 'Handwriting 7', label: 'Student 7 (Loose Homework)' },
    { name: 'Handwriting 8', label: 'Student 8 (Fine Nib)' },
    { name: 'Handwriting 9', label: 'Student 9 (Quick Notes)' },
    { name: 'Handwriting 10', label: 'Student 10 (Forward Lean)' },
    { name: 'Handwriting 11', label: 'Student 11 (Natural Cursive)' },
    { name: 'Handwriting 12', label: 'Student 12 (Rounded Junior)' },
    { name: 'Handwriting 13', label: 'Student 13 (Micro Gel)' },
    { name: 'Handwriting 14', label: 'Student 14 (Expressive)' },
    { name: 'Hindi Handwriting', label: 'Hindi Devnagari Hand' },
    { name: 'Caveat', label: 'Caveat (Casual)' },
    { name: 'Homemade Apple', label: 'Homemade Apple (Messy)' },
    { name: 'Indie Flower', label: 'Indie Flower (Cute)' },
    { name: 'Patrick Hand', label: 'Patrick Hand (Print)' },
    { name: 'Shadows Into Light', label: 'Shadows (Quick)' },
    { name: 'Kalam', label: 'Kalam (Marker)' },
    { name: 'Gloria Hallelujah', label: 'Gloria (Bold)' },
    { name: 'Reenie Beanie', label: 'Reenie Beanie (Fine)' },
];

const PAPERS = [
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

    // Actively load the handwriting font via FontFaceSet API and trigger precise re-measurement
    useEffect(() => {
        let active = true;
        const fontCss = getFontFamilyCss(font);
        if (typeof document !== 'undefined' && document.fonts) {
            document.fonts.load(`${fontSize}px ${fontCss}`).then(() => {
                if (active) {
                    clearWidthCache();
                    setFontLoadedVersion(v => v + 1);
                }
            }).catch(() => {});
        }
        return () => { active = false; };
    }, [font, fontSize]);

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
        const bodyHeight = 1131 - marginTop - marginBottom;
        const linesPerPage = Math.max(1, Math.floor(bodyHeight / paper.lineHeight));
        const maxLineWidth = Math.max(200, (800 - marginLeft - marginRight) - 16);
        
        // Calculate header lines to reduce page 1 capacity
        const headerLineCount = showHeader && headerText.trim() ? headerText.split('\n').length : 0;
        const page1Lines = Math.max(1, linesPerPage - (headerLineCount > 0 ? headerLineCount + 1 : 0)); 

        const rawLines = buildDocumentLines(
            deferredText, 
            maxLineWidth,
            font,
            fontSize,
            String(randomSeed), 
            autoTypoRate, 
            strikeStyle, 
            autoCaret,
            smartMarginIndexing
        );
        return paginateLines(rawLines, linesPerPage, page1Lines);
    }, [deferredText, fontSize, font, fontLoadedVersion, paper.lineHeight, marginTop, marginBottom, marginLeft, marginRight, showHeader, headerText, randomSeed, autoTypoRate, strikeStyle, autoCaret, smartMarginIndexing]);

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
                            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                                {/* Heading Option */}
                                <div className="shrink-0 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                            Document Heading
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                                            <input 
                                                type="checkbox" 
                                                checked={showHeader} 
                                                onChange={e => setPageOptions({ showHeader: e.target.checked })} 
                                                className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                            />
                                            <span>Show Heading</span>
                                        </label>
                                    </div>
                                    {showHeader && (
                                        <textarea
                                            value={headerText}
                                            onChange={e => setPageOptions({ headerText: e.target.value })}
                                            placeholder="Assignment Title / Roll No / Subject..."
                                            className="w-full h-18 p-3 rounded-xl bg-white border border-neutral-200 text-neutral-900 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all resize-none font-sans font-medium"
                                        />
                                    )}
                                </div>

                                {/* Main Text Source - Instant 0ms Typing */}
                                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                                    <div className="flex items-center justify-between shrink-0">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                            Your Text Content
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-neutral-400 font-mono font-semibold">
                                                {wordCount} words • {draftText.length} chars
                                            </span>
                                            {draftText.length > 0 && (
                                                <button
                                                    onClick={() => setDraftText('')}
                                                    title="Clear All Text"
                                                    className="text-[10px] font-bold text-neutral-400 hover:text-rose-600 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <textarea
                                        ref={sourceRef}
                                        value={draftText}
                                        onChange={(e) => setDraftText(e.target.value)}
                                        placeholder="Start typing your text here...&#10;&#10;It transforms instantly into realistic human handwriting on the right."
                                        className="flex-1 w-full min-h-[220px] p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all resize-none font-sans overflow-y-auto custom-scrollbar"
                                    />
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
                                                
                                                {/* Red Margin Line */}
                                                {paper.hasRedMargin && (
                                                    <div className="absolute top-0 bottom-0 left-[65px] w-[2px] bg-rose-400 opacity-60 pointer-events-none z-10" />
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

                                                {/* Document Header (Page 1 Only) */}
                                                {showHeader && pIdx === 0 && headerText.trim() && (
                                                    <div 
                                                        className="absolute z-10 leading-tight whitespace-pre-wrap"
                                                        style={{
                                                            top: marginTop,
                                                            left: marginLeft,
                                                            right: marginRight,
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
                                                            ? marginTop + (headerText.split('\n').length + 1) * paper.lineHeight
                                                            : marginTop,
                                                        paddingBottom: marginBottom,
                                                        paddingLeft: marginLeft,
                                                        paddingRight: marginRight
                                                    }}
                                                >
                                                    {page.lines.map((line, lIdx) => (
                                                        <div 
                                                            key={lIdx} 
                                                            dir={line.dir}
                                                            onDoubleClick={() => startInlineEdit(pIdx, lIdx, line)}
                                                            style={{
                                                                fontFamily: getFontFamilyCss(font), 
                                                                fontSize, 
                                                                color, 
                                                                height: paper.lineHeight, 
                                                                lineHeight: `${paper.lineHeight}px`, 
                                                                transform: `translateY(${baseline}px)`, 
                                                                textAlign: line.dir === 'rtl' ? (textAlign === 'left' ? 'right' : textAlign === 'right' ? 'left' : textAlign) : textAlign, 
                                                                paddingLeft: line.indent ? line.indent * (fontSize * 0.4) : 0,
                                                            }} 
                                                            className="w-full whitespace-nowrap relative group cursor-text"
                                                        >
                                                            {/* Interactive Left Margin Slot (Empty or Indexed) */}
                                                            {marginLeft >= 40 && (
                                                                <div 
                                                                    className="absolute top-0 flex items-center justify-center group/margin cursor-pointer transition-colors z-20"
                                                                    style={{
                                                                        left: `-${marginLeft}px`,
                                                                        width: `${Math.min(65, marginLeft)}px`,
                                                                        height: `${paper.lineHeight}px`,
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
                                                                                fontSize: fontSize * 0.95,
                                                                                opacity: 0.92,
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
                                                                        fontSize,
                                                                        color,
                                                                        height: `${paper.lineHeight}px`,
                                                                        lineHeight: `${paper.lineHeight}px`,
                                                                    }}
                                                                    className="w-full bg-blue-50/80 border border-dashed border-blue-400 rounded-xs px-1 outline-none text-neutral-900 shadow-inner"
                                                                />
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
                                                                                fontSize={fontSize}
                                                                                color={color}
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
        </div>
    );
}