import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, ImageIcon, X, Loader2, Play, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useRef } from 'react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { HandwrittenWord } from '../HandwrittenWord';
import { CameraOverlay } from '../CameraOverlay';
import { getFontFamilyCss } from '../../utils/humanErrorEngine';
import type { LightingMode, PaperCrease, PageEffectOverrides } from '../../types';

interface DocumentLine {
    tokens: any[];
    text: string;
    type: 'text' | 'bullet' | 'number' | 'empty' | string;
    indent: number;
    charIndex: number;
    dir?: 'ltr' | 'rtl';
    marginIndex?: string;
}

interface DocumentPage {
    lines: DocumentLine[];
    index: number;
}

interface PaperDefinition {
    id: string;
    name: string;
    css: string;
    lineHeight: number;
    hasRedMargin: boolean;
    style: React.CSSProperties;
}

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (name: string, format: 'pdf' | 'zip') => void;
    format: 'pdf' | 'zip';
    onFormatChange?: (format: 'pdf' | 'zip') => void;
    progress: number;
    status: 'idle' | 'processing' | 'complete' | 'error';
    initialFileName: string;

    // Document Data for Multi-Page Scrollable Preview
    pages?: DocumentPage[];
    paper?: PaperDefinition;
    font?: string;
    fontSize?: number;
    color?: string;
    baseline?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    showHeader?: boolean;
    headerText?: string;
    showPageNumbers?: boolean;
    jitter?: number;
    charJitter?: number;
    fatigue?: number;
    pressure?: number;
    smudge?: number;
    phoneShadow?: boolean;
    phoneShadowAngle?: number;
    phoneShadowIntensity?: number;
    lightingMode?: LightingMode;
    lightingWarmth?: number;
    paperCrease?: PaperCrease;
    sensorNoise?: number;
    perspectiveWarp?: boolean;
    tiltX?: number;
    tiltY?: number;
    randomTilt?: boolean;
    smartMarginIndexing?: boolean;
    coffeeStain?: boolean;
    pageEffectOverrides?: Record<number, PageEffectOverrides>;
    showCoffeeStain?: boolean;
    showStickyNote?: boolean;
    stickyNoteText?: string;
    marginNote?: string;
    randomSeed?: number;
    wordCount?: number;
}

export default function ExportModal({ 
    isOpen, 
    onClose, 
    onStart, 
    format, 
    onFormatChange,
    progress, 
    status, 
    initialFileName,
    pages = [],
    paper = { id: 'college', name: 'College Ruled', css: 'bg-white', lineHeight: 32, hasRedMargin: true, style: {} },
    font = 'Handwriting 1',
    fontSize = 24,
    color = '#1e40af',
    baseline = 6,
    textAlign = 'left',
    marginTop = 50,
    marginBottom = 50,
    marginLeft = 90,
    marginRight = 50,
    showHeader = false,
    headerText = '',
    showPageNumbers = true,
    jitter = 1.0,
    charJitter = 0.5,
    fatigue = 0.3,
    pressure = 1.0,
    smudge = 0,
    phoneShadow = false,
    phoneShadowAngle = 120,
    phoneShadowIntensity = 0.3,
    lightingMode = 'warm-lamp' as LightingMode,
    lightingWarmth = 0.25,
    paperCrease = 'none' as PaperCrease,
    sensorNoise = 0.05,
    perspectiveWarp = false,
    tiltX = 0,
    tiltY = 0,
    randomTilt = false,
    smartMarginIndexing = true,
    coffeeStain = false,
    pageEffectOverrides = {},
    showCoffeeStain = false,
    showStickyNote = false,
    stickyNoteText = '',
    marginNote = '',
    randomSeed = 0,
    wordCount = 0,
}: ExportModalProps) {
    const [fileName, setFileName] = useState(initialFileName);
    const [activeFormat, setActiveFormat] = useState<'pdf' | 'zip'>(format);
    const [previewScale, setPreviewScale] = useState(0.62);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useScrollLock(isOpen);

    const handleFormatSwitch = (newFormat: 'pdf' | 'zip') => {
        setActiveFormat(newFormat);
        if (onFormatChange) onFormatChange(newFormat);
    };

    const getStatusMessage = () => {
        if (status === 'complete') return 'Your document is ready!';
        if (status === 'error') return 'Export failed. Please try again.';
        if (status === 'idle') return activeFormat === 'pdf' ? 'Ready to compile multi-page PDF' : 'Ready to archive high-res images';
        if (progress < 30) return activeFormat === 'pdf' ? 'Rendering document pages...' : 'Capturing canvases...';
        if (progress < 60) return activeFormat === 'pdf' ? 'Simulating high-DPI ink...' : 'Optimizing pixel quality...';
        if (progress < 90) return activeFormat === 'pdf' ? 'Compiling PDF document...' : 'Packaging ZIP archive...';
        return 'Finalizing export...';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md">
                    {/* BACKDROP */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={() => status !== 'processing' && onClose()}
                    />

                    {/* MODAL CONTAINER */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 15 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-6xl h-[92vh] relative flex flex-col border border-neutral-200/80 z-10"
                    >
                        {/* TOP BAR with macOS dots */}
                        <div className="h-14 px-6 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3.5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div className="h-4 w-px bg-neutral-200" />
                                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                    <span>Export Document Preview</span>
                                    <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                        {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                                    </span>
                                </h2>
                            </div>

                            {/* Center Preview Zoom Controls */}
                            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 text-xs">
                                <button 
                                    onClick={() => setPreviewScale(s => Math.max(0.4, s - 0.1))} 
                                    title="Zoom Out Preview"
                                    className="p-1 hover:bg-white rounded text-neutral-600 transition-colors"
                                >
                                    <ZoomOut size={13} />
                                </button>
                                <span className="font-mono font-bold text-neutral-700 min-w-[38px] text-center">
                                    {Math.round(previewScale * 100)}%
                                </span>
                                <button 
                                    onClick={() => setPreviewScale(s => Math.min(1.0, s + 0.1))} 
                                    title="Zoom In Preview"
                                    className="p-1 hover:bg-white rounded text-neutral-600 transition-colors"
                                >
                                    <ZoomIn size={13} />
                                </button>
                                <button 
                                    onClick={() => setPreviewScale(0.62)} 
                                    title="Reset to Normal Preview Fit"
                                    className="px-2 py-0.5 text-[10px] font-bold text-neutral-600 hover:text-neutral-900 hover:bg-white rounded transition-colors"
                                >
                                    Fit
                                </button>
                            </div>

                            {/* Close Button */}
                            {status !== 'processing' ? (
                                <button 
                                    onClick={onClose}
                                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <X size={18} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Exporting...</span>
                                </div>
                            )}
                        </div>

                        {/* MAIN SPLIT WORKSPACE */}
                        <div className="flex-1 flex overflow-hidden">
                            
                            {/* 1. SCROLLABLE MULTI-PAGE PREVIEW GALLERY (Left / Center) */}
                            <div 
                                ref={scrollContainerRef}
                                className="flex-1 overflow-y-auto bg-[#F2F4F7] p-6 sm:p-8 flex flex-col items-center gap-8 relative custom-scrollbar"
                            >
                                {/* Blueprint grid background */}
                                <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

                                {pages.map((page, pIdx) => {
                                    const pageOverrides = pageEffectOverrides[pIdx] || {};
                                    const effectiveCoffeeStain = pageOverrides.coffeeStain !== undefined ? pageOverrides.coffeeStain : (coffeeStain || showCoffeeStain);
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
                                    const effectiveShadow = pageOverrides.phoneShadow !== undefined ? pageOverrides.phoneShadow : phoneShadow;
                                    const effectiveShadowIntensity = pageOverrides.phoneShadowIntensity !== undefined ? pageOverrides.phoneShadowIntensity : phoneShadowIntensity;
                                    const effectiveShadowAngle = pageOverrides.phoneShadowAngle !== undefined ? pageOverrides.phoneShadowAngle : phoneShadowAngle;
                                    const effectiveNoise = pageOverrides.sensorNoise !== undefined ? pageOverrides.sensorNoise : sensorNoise;

                                    return (
                                        <div 
                                            key={pIdx} 
                                            className="relative flex flex-col items-center shrink-0 transition-all"
                                            style={{
                                                width: 800 * previewScale,
                                                height: 1131 * previewScale,
                                            }}
                                        >
                                            {/* Page Label Badge */}
                                            <div className="absolute -top-6 left-2 flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                                <span>Page {pIdx + 1} of {pages.length}</span>
                                            </div>

                                            {/* Rendered A4 Sheet at Preview Scale */}
                                            <div 
                                                className="absolute top-0 left-0 w-[800px] h-[1131px] bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] rounded-xs overflow-hidden origin-top-left"
                                                style={{
                                                    transform: effectivePerspective 
                                                        ? `scale(${previewScale}) perspective(1000px) rotateX(${pageTiltX}deg) rotateY(${pageTiltY}deg)` 
                                                        : `scale(${previewScale})`,
                                                    transformOrigin: 'top left',
                                                }}
                                            >
                                            <div className={`w-full h-full relative ${paper.css}`} style={paper.style}>
                                                
                                                {/* Red Margin Line */}
                                                {paper.hasRedMargin && (
                                                    <div className="absolute top-0 bottom-0 left-[65px] w-[2px] bg-rose-400 opacity-60 pointer-events-none z-10" />
                                                )}

                                                {/* Physical Camera & Environment Overlay */}
                                                <CameraOverlay
                                                    phoneShadow={effectiveShadow}
                                                    phoneShadowAngle={effectiveShadowAngle}
                                                    phoneShadowIntensity={effectiveShadowIntensity}
                                                    lightingMode={effectiveLighting}
                                                    lightingWarmth={effectiveWarmth}
                                                    paperCrease={effectiveCrease}
                                                    sensorNoise={effectiveNoise}
                                                    coffeeStain={effectiveCoffeeStain}
                                                />

                                                {/* Margin Annotation */}
                                                {marginNote && pIdx === 0 && (
                                                    <div 
                                                        className="absolute left-4 top-1/3 -rotate-90 origin-left z-20 pointer-events-none"
                                                        style={{ fontFamily: getFontFamilyCss(font), color: color, opacity: 0.55, fontSize: fontSize * 0.6 }}
                                                    >
                                                        {marginNote}
                                                    </div>
                                                )}

                                                {/* Sticky Note */}
                                                {showStickyNote && pIdx === 0 && (
                                                    <div 
                                                        className="absolute top-6 right-6 w-36 h-36 bg-amber-200 text-amber-950 p-4 shadow-xl rotate-3 z-30 font-sans text-xs font-semibold leading-snug rounded-xs border border-amber-300 pointer-events-none"
                                                    >
                                                        <div className="w-12 h-3 bg-amber-300/60 -top-1.5 left-1/2 -translate-x-1/2 absolute rounded-xs" />
                                                        {stickyNoteText}
                                                    </div>
                                                )}

                                                {/* Document Header (Page 1) */}
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

                                                {/* Handwritten Lines */}
                                                <div 
                                                    className="w-full h-full relative select-none"
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
                                                            className="w-full whitespace-nowrap relative"
                                                        >
                                                            {(smartMarginIndexing || line.marginIndex) && line.marginIndex && (
                                                                <span 
                                                                    className="absolute text-center font-bold select-none pointer-events-none"
                                                                    style={{
                                                                        left: `-${marginLeft}px`,
                                                                        width: `${Math.min(65, marginLeft)}px`,
                                                                        textAlign: 'center',
                                                                        color: color,
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: fontSize * 0.95,
                                                                        opacity: 0.88,
                                                                    }}
                                                                >
                                                                    {line.marginIndex}
                                                                </span>
                                                            )}
                                                            {line.tokens.map((tok, tIdx) => (
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
                                                                />
                                                            ))}
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
                                    );
                                })}
                            </div>

                            {/* 2. EXPORT CONTROLS SIDEBAR (Right) */}
                            <div className="w-80 sm:w-92 bg-white border-l border-neutral-100 flex flex-col shrink-0 p-6 sm:p-7 justify-between overflow-y-auto">
                                <div className="space-y-6">
                                    
                                    {/* Format Selector Tabs */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2.5 block">
                                            Export Format
                                        </label>
                                        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200/70">
                                            <button 
                                                type="button"
                                                onClick={() => handleFormatSwitch('pdf')}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                                    activeFormat === 'pdf' 
                                                        ? 'bg-white text-neutral-900 shadow-sm' 
                                                        : 'text-neutral-500 hover:text-neutral-800'
                                                }`}
                                            >
                                                <FileText size={15} />
                                                <span>PDF Doc</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleFormatSwitch('zip')}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                                    activeFormat === 'zip' 
                                                        ? 'bg-white text-neutral-900 shadow-sm' 
                                                        : 'text-neutral-500 hover:text-neutral-800'
                                                }`}
                                            >
                                                <ImageIcon size={15} />
                                                <span>Images ZIP</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Name Input */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">
                                            Document Name
                                        </label>
                                        <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all">
                                            <input 
                                                type="text" 
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                                className="bg-transparent border-none focus:outline-none text-xs font-bold text-neutral-900 flex-1"
                                                placeholder="handwritten-document"
                                            />
                                            <span className="text-neutral-400 text-xs font-mono font-bold">.{activeFormat}</span>
                                        </div>
                                    </div>

                                    {/* Document Summary Card */}
                                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70 space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                                            Document Stats
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                                                <div className="text-[10px] text-neutral-400 font-bold uppercase">Total Pages</div>
                                                <div className="text-sm font-black text-neutral-900">{pages.length}</div>
                                            </div>
                                            <div className="p-2.5 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                                                <div className="text-[10px] text-neutral-400 font-bold uppercase">Word Count</div>
                                                <div className="text-sm font-black text-neutral-900">{wordCount}</div>
                                            </div>
                                            <div className="p-2.5 bg-white rounded-xl border border-neutral-100 shadow-2xs col-span-2">
                                                <div className="text-[10px] text-neutral-400 font-bold uppercase">Paper Material</div>
                                                <div className="text-xs font-bold text-neutral-800 truncate">{paper.name}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Export Quality Tag */}
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>Full 2X Ultra-HD DPI Capture</span>
                                    </div>
                                </div>

                                {/* BOTTOM ACTION AREA */}
                                <div className="space-y-3 pt-6 border-t border-neutral-100">
                                    {/* Status Message */}
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-neutral-500">
                                            {getStatusMessage()}
                                        </p>
                                    </div>

                                    {/* Animated Progress Bar when Processing */}
                                    {status === 'processing' && (
                                        <div className="space-y-1.5">
                                            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-neutral-900 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                                                <span>Exporting</span>
                                                <span className="font-bold text-neutral-800">{progress}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Button States */}
                                    {status === 'idle' || status === 'error' ? (
                                        <button
                                            onClick={() => onStart(fileName, activeFormat)}
                                            className="w-full py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20 active:scale-[0.98]"
                                        >
                                            <Play size={16} fill="white" />
                                            <span>Download {activeFormat.toUpperCase()}</span>
                                        </button>
                                    ) : status === 'complete' ? (
                                        <button
                                            onClick={onClose}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                                        >
                                            <CheckCircle2 size={18} />
                                            <span>Export Complete — Close</span>
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-4 bg-neutral-100 text-neutral-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                        >
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Generating Document...</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
