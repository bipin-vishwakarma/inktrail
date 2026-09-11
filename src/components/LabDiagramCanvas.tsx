import React, { useRef, useState, useCallback } from 'react';
import { 
    Upload, 
    Image as ImageIcon, 
    Trash2, 
    Sparkles, 
    Clipboard, 
    ZoomIn, 
    ZoomOut, 
    Maximize2,
    PenTool,
    Pencil,
    Eraser,
    RotateCcw,
    Check,
    Edit3
} from 'lucide-react';
import type { PageDiagram, PaperMaterial } from '../types';
import { getFontFamilyCss } from '../utils/humanErrorEngine';

interface LabDiagramCanvasProps {
    pageIndex: number;
    diagram?: PageDiagram;
    onUpdateDiagram: (diagram: PageDiagram | null) => void;
    paperMaterial: PaperMaterial;
    font: string;
    inkColor: string;
}

// Built-in Laboratory Diagram Templates (Clean, scalable SVGs for quick student experiments)
const PRESET_DIAGRAMS = [
    {
        id: 'circuit',
        name: "Ohm's Law Circuit",
        category: 'Physics / EE',
        caption: "Figure 1: Circuit diagram for verification of Ohm's Law and resistance measurement.",
        svg: `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" stroke="#1e293b" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Outer Loop -->
            <path d="M 60 80 L 160 80" />
            <!-- Battery -->
            <line x1="160" y1="65" x2="160" y2="95" stroke-width="3" />
            <line x1="172" y1="72" x2="172" y2="88" stroke-width="4.5" />
            <line x1="184" y1="65" x2="184" y2="95" stroke-width="3" />
            <line x1="196" y1="72" x2="196" y2="88" stroke-width="4.5" />
            <text x="178" y="55" font-family="sans-serif" font-size="13" font-weight="bold" fill="#2563eb" text-anchor="middle">E (Battery)</text>
            <path d="M 196 80 L 300 80" />
            <!-- Key / Switch -->
            <path d="M 300 80 L 325 65" stroke-width="3" />
            <circle cx="300" cy="80" r="4" fill="#1e293b" />
            <circle cx="340" cy="80" r="4" fill="#1e293b" />
            <text x="320" y="52" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Key (K)</text>
            <path d="M 340 80 L 440 80 L 440 180" />
            <!-- Rheostat -->
            <path d="M 440 180 L 415 180" />
            <path d="M 415 180 L 405 170 L 395 190 L 385 170 L 375 190 L 365 170 L 355 190 L 345 180" />
            <path d="M 345 180 L 300 180" />
            <!-- Rheostat Slider Arrow -->
            <path d="M 380 145 L 380 170 M 375 163 L 380 170 L 385 163" stroke="#dc2626" stroke-width="2.5" />
            <text x="380" y="135" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">Rh (Variable)</text>
            <path d="M 300 180 L 260 180" />
            <!-- Ammeter (Series) -->
            <circle cx="230" cy="180" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" />
            <text x="230" y="186" font-family="sans-serif" font-size="16" font-weight="black" fill="#1e293b" text-anchor="middle">A</text>
            <path d="M 208 180 L 140 180" />
            <!-- Unknown Resistor R -->
            <path d="M 140 180 L 132 170 L 124 190 L 116 170 L 108 190 L 100 170 L 92 190 L 84 180" stroke="#2563eb" stroke-width="3" />
            <text x="112" y="155" font-family="sans-serif" font-size="13" font-weight="bold" fill="#2563eb" text-anchor="middle">R (Wire)</text>
            <path d="M 84 180 L 60 180 L 60 80" />
            <!-- Voltmeter (Parallel Across R) -->
            <path d="M 140 180 L 140 245 L 132 245" />
            <path d="M 84 180 L 84 245 L 92 245" />
            <circle cx="112" cy="245" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" />
            <text x="112" y="251" font-family="sans-serif" font-size="15" font-weight="black" fill="#1e293b" text-anchor="middle">V</text>
            <text x="112" y="280" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Voltmeter</text>
        </svg>`
    },
    {
        id: 'prism',
        name: 'Prism Ray Refraction',
        category: 'Optics / Physics',
        caption: 'Figure 1: Refraction of monochromatic ray through glass prism with angle of minimum deviation (δm).',
        svg: `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" stroke="#1e293b" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Triangular Prism -->
            <polygon points="250,50 100,270 400,270" stroke="#0284c7" stroke-width="3" fill="rgba(186, 230, 253, 0.25)" />
            <text x="250" y="40" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0369a1" text-anchor="middle">A (Apex Angle)</text>
            <!-- Normal 1 -->
            <line x1="120" y1="130" x2="240" y2="210" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="5 4" />
            <text x="110" y="125" font-family="sans-serif" font-size="11" fill="#64748b">N₁</text>
            <!-- Incident Ray -->
            <line x1="40" y1="210" x2="165" y2="160" stroke="#ef4444" stroke-width="2.8" />
            <!-- Arrow on Incident -->
            <polygon points="105,180 115,176 112,185" fill="#ef4444" />
            <text x="65" y="195" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ef4444">Incident Ray</text>
            <!-- Refracted Ray inside Prism -->
            <line x1="165" y1="160" x2="335" y2="160" stroke="#ef4444" stroke-width="2.8" />
            <!-- Arrow inside -->
            <polygon points="245,156 257,160 245,164" fill="#ef4444" />
            <!-- Normal 2 -->
            <line x1="380" y1="130" x2="260" y2="210" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="5 4" />
            <text x="390" y="125" font-family="sans-serif" font-size="11" fill="#64748b">N₂</text>
            <!-- Emergent Ray -->
            <line x1="335" y1="160" x2="460" y2="210" stroke="#ef4444" stroke-width="2.8" />
            <!-- Arrow on Emergent -->
            <polygon points="390,178 402,184 395,190" fill="#ef4444" />
            <text x="440" y="235" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ef4444">Emergent Ray</text>
            <!-- Deviation Extension lines -->
            <line x1="165" y1="160" x2="290" y2="110" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 3" />
            <line x1="290" y1="110" x2="335" y2="160" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 3" />
            <text x="295" y="100" font-family="sans-serif" font-size="13" font-weight="black" fill="#b45309">δ (Deviation)</text>
        </svg>`
    },
    {
        id: 'graph',
        name: 'V-I Characteristic Graph',
        category: 'Measurement / Lab',
        caption: 'Figure 1: Linear V vs I relationship demonstrating constant slope resistance R = ΔV / ΔI.',
        svg: `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" stroke="#1e293b" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Grid Lines -->
            <defs>
                <pattern id="labgrid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" stroke-width="1" />
                </pattern>
            </defs>
            <rect x="70" y="30" width="380" height="240" fill="url(#labgrid)" stroke="#cbd5e1" stroke-width="1.5" />
            <!-- X Axis -->
            <line x1="70" y1="270" x2="465" y2="270" stroke="#0f172a" stroke-width="3" />
            <polygon points="465,266 475,270 465,274" fill="#0f172a" />
            <text x="260" y="302" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Current I (mA) ➔</text>
            <!-- Y Axis -->
            <line x1="70" y1="270" x2="70" y2="20" stroke="#0f172a" stroke-width="3" />
            <polygon points="66,20 70,10 74,20" fill="#0f172a" />
            <text x="28" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle" transform="rotate(-90 28 150)">Potential V (Volts) ➔</text>
            <!-- Characteristic Curve / Line -->
            <line x1="70" y1="270" x2="410" y2="50" stroke="#2563eb" stroke-width="3.5" />
            <!-- Experimental Data Points -->
            <circle cx="138" cy="226" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="206" cy="182" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="274" cy="138" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="342" cy="94" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
            <!-- Slope Triangle -->
            <path d="M 206 182 L 342 182 L 342 94" stroke="#059669" stroke-width="2" stroke-dasharray="5 3" />
            <text x="274" y="200" font-family="sans-serif" font-size="11" font-weight="bold" fill="#059669" text-anchor="middle">ΔI</text>
            <text x="360" y="138" font-family="sans-serif" font-size="11" font-weight="bold" fill="#059669">ΔV</text>
            <text x="320" y="40" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb">Slope = R = ΔV / ΔI</text>
        </svg>`
    },
    {
        id: 'titration',
        name: 'Chemical Titration Apparatus',
        category: 'Chemistry / Lab',
        caption: 'Figure 1: Acid-base titration setup with burette, stopcock, conical flask, and phenolphthalein indicator.',
        svg: `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" stroke="#1e293b" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Stand Base -->
            <rect x="221" y="90" width="14" height="110" fill="rgba(244, 63, 94, 0.25)" />
            <!-- Stopcock Valve -->
            <polygon points="214,204 242,204 228,212" fill="#0f172a" />
            <line x1="228" y1="212" x2="228" y2="226" stroke="#2563eb" stroke-width="2.5" />
            <!-- Conical Flask -->
            <path d="M 218 240 L 218 248 L 195 285 L 261 285 L 238 248 L 238 240 Z" fill="rgba(224, 231, 255, 0.4)" stroke="#0f172a" stroke-width="2.5" />
            <!-- Conical Flask Liquid -->
            <path d="M 203 272 L 195 285 L 261 285 L 253 272 Z" fill="rgba(147, 197, 253, 0.5)" />
            <!-- Droplet -->
            <circle cx="228" cy="233" r="2" fill="#f43f5e" />
            <!-- Labels -->
            <text x="270" y="80" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb">Burette (0.1M NaOH)</text>
            <text x="280" y="270" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Conical Flask (Oxalic Acid)</text>
        </svg>`
    }
];

export const LabDiagramCanvas: React.FC<LabDiagramCanvasProps> = ({
    pageIndex,
    diagram,
    onUpdateDiagram,
    font,
    inkColor
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isHovered, setIsHovered] = useState(false);
    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [captionDraft, setCaptionDraft] = useState<string | null>(null);
    const activeCaption = captionDraft ?? (diagram?.caption || `Figure ${pageIndex + 1}: Experimental Schematics`);

    // Interactive Student Freehand Sketch Canvas States
    const [isSketchMode, setIsSketchMode] = useState(false);
    const [sketchTool, setSketchTool] = useState<'pen' | 'pencil' | 'eraser'>('pen');
    const [sketchColor, setSketchColor] = useState('#0f172a');
    const [sketchWidth, setSketchWidth] = useState<number>(2.5);
    const [isDrawing, setIsDrawing] = useState(false);

    // Handle File Upload (PNG/JPG/SVG)
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                onUpdateDiagram({
                    image: dataUrl,
                    caption: activeCaption || `Figure ${pageIndex + 1}: Experimental Schematic`,
                    fit: 'contain',
                    scale: 1.0,
                });
                setIsSketchMode(false);
            }
        };
        reader.readAsDataURL(file);
    }, [pageIndex, activeCaption, onUpdateDiagram]);

    // Handle Direct Clipboard Paste (Ctrl+V)
    const handlePasteClipboard = useCallback(async () => {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageType = item.types.find(t => t.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUrl = e.target?.result as string;
                        if (dataUrl) {
                            onUpdateDiagram({
                                image: dataUrl,
                                caption: activeCaption || `Figure ${pageIndex + 1}: Experimental Setup`,
                                fit: 'contain',
                                scale: 1.0,
                            });
                            setIsSketchMode(false);
                        }
                    };
                    reader.readAsDataURL(blob);
                    return;
                }
            }
        } catch (err) {
            console.warn('Direct clipboard image paste not permitted:', err);
        }
    }, [pageIndex, activeCaption, onUpdateDiagram]);

    // Handle Preset SVG Insert
    const handlePresetSelect = (preset: typeof PRESET_DIAGRAMS[0]) => {
        const svgBase64 = 'data:image/svg+xml;utf8,' + encodeURIComponent(preset.svg);
        setCaptionDraft(null);
        onUpdateDiagram({
            image: svgBase64,
            caption: preset.caption,
            fit: 'contain',
            scale: 1.0,
        });
        setIsSketchMode(false);
    };

    // Zoom & Fit Controls
    const handleScale = (delta: number) => {
        if (!diagram) return;
        const currentScale = diagram.scale || 1.0;
        const newScale = Math.max(0.6, Math.min(1.5, Math.round((currentScale + delta) * 10) / 10));
        onUpdateDiagram({
            ...diagram,
            scale: newScale,
        });
    };

    const handleToggleFit = () => {
        if (!diagram) return;
        onUpdateDiagram({
            ...diagram,
            fit: diagram.fit === 'cover' ? 'contain' : 'cover',
        });
    };

    // Freehand Sketch Canvas Event Handlers
    const initSketchCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        if (diagram?.image) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
            };
            img.src = diagram.image;
        } else {
            ctx.clearRect(0, 0, rect.width, rect.height);
        }
    };

    const startSketchMode = () => {
        setIsSketchMode(true);
        setTimeout(() => {
            initSketchCanvas();
        }, 50);
    };

    const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.setPointerCapture(e.pointerId);
        setIsDrawing(true);

        const { x, y } = getCanvasCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);

        if (sketchTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = sketchWidth * 5;
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else if (sketchTool === 'pencil') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.85;
            ctx.lineWidth = sketchWidth * 0.9;
            ctx.strokeStyle = sketchColor;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = sketchWidth;
            ctx.strokeStyle = sketchColor;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCanvasCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch {
                // Ignore capture release
            }
        }
        setIsDrawing(false);
    };

    const clearSketchCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const saveSketchToDiagram = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        onUpdateDiagram({
            image: dataUrl,
            caption: activeCaption || `Figure ${pageIndex + 1}: Hand-Drawn Practical Schematic`,
            fit: 'contain',
            scale: 1.0,
        });
        setIsSketchMode(false);
    };

    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center relative p-8 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
            />

            {/* Top Lab Header Strip (Visible in editor, filtered on export) */}
            <div 
                className="w-full flex items-center justify-between pb-2 border-b border-neutral-300/70 text-neutral-400 font-mono text-[10px] uppercase tracking-wider export-ignore"
                data-export-ignore
            >
                <span className="flex items-center gap-1.5 font-bold text-neutral-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                    Practical Record • Diagram Sheet (P.{pageIndex + 1})
                </span>
                <span>Lab Notebook Mode</span>
            </div>

            {/* MAIN CONTENT ZONE: Sketch Mode OR Diagram Display OR Empty Dropzone */}
            {isSketchMode ? (
                // Interactive Freehand Drawing Workspace
                <div className="w-full h-full flex flex-col items-center justify-between relative py-2">
                    {/* Sketch Toolbar */}
                    <div 
                        className="w-full flex flex-wrap items-center justify-between gap-2 p-2 bg-neutral-900 text-white rounded-2xl shadow-xl z-20 export-ignore"
                        data-export-ignore
                    >
                        {/* Tool Selector */}
                        <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setSketchTool('pen')}
                                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                    sketchTool === 'pen' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Fountain / Ballpoint Pen"
                            >
                                <PenTool size={13} />
                                <span className="text-[11px]">Pen</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSketchTool('pencil')}
                                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                    sketchTool === 'pencil' ? 'bg-neutral-700 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Graphite Pencil"
                            >
                                <Pencil size={13} />
                                <span className="text-[11px]">Pencil</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSketchTool('eraser')}
                                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                    sketchTool === 'eraser' ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Eraser"
                            >
                                <Eraser size={13} />
                                <span className="text-[11px]">Eraser</span>
                            </button>
                        </div>

                        {/* Color Palette (Disabled during eraser) */}
                        {sketchTool !== 'eraser' && (
                            <div className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1 rounded-xl">
                                {[
                                    { hex: '#0f172a', title: 'Black Gel' },
                                    { hex: '#2563eb', title: 'Blue Ink' },
                                    { hex: '#475569', title: 'Pencil Lead' },
                                    { hex: '#dc2626', title: 'Red Pen' },
                                    { hex: '#16a34a', title: 'Green Ink' },
                                ].map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        onClick={() => setSketchColor(c.hex)}
                                        className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                                            sketchColor === c.hex ? 'scale-125 border-white shadow-xs' : 'border-neutral-600 hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.title}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Line Width */}
                        <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl">
                            {[
                                { w: 1.8, label: 'Fine' },
                                { w: 3.2, label: 'Med' },
                                { w: 6.0, label: 'Bold' }
                            ].map(item => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => setSketchWidth(item.w)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                        sketchWidth === item.w ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Actions: Clear, Cancel, Save */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={clearSketchCanvas}
                                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Clear Sketch"
                            >
                                <RotateCcw size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSketchMode(false)}
                                className="px-2.5 py-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={saveSketchToDiagram}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                            >
                                <Check size={13} />
                                <span>Save Drawing</span>
                            </button>
                        </div>
                    </div>

                    {/* Canvas Drawing Area */}
                    <div className="flex-1 w-full flex items-center justify-center p-2 relative">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-[580px] rounded-2xl bg-white/90 shadow-sm border border-neutral-300 touch-none cursor-crosshair"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        />
                    </div>
                </div>
            ) : diagram?.image ? (
                // Diagram Display View (Uploaded, Preset or Drawn)
                <div className="w-full h-full flex flex-col items-center justify-between relative">
                    {/* Diagram Illustration Container */}
                    <div className="flex-1 w-full flex items-center justify-center p-4 relative overflow-hidden group">
                        <div 
                            className="max-w-full max-h-[680px] w-full h-full flex items-center justify-center transition-transform duration-200"
                            style={{
                                transform: `scale(${diagram.scale || 1.0})`,
                            }}
                        >
                            <img 
                                src={diagram.image} 
                                alt={diagram.caption || "Lab schematic"} 
                                className={`max-w-full max-h-[640px] rounded-lg shadow-sm border border-neutral-300/80 bg-white/95 p-3 ${
                                    diagram.fit === 'cover' ? 'object-cover' : 'object-contain'
                                }`}
                            />
                        </div>

                        {/* Floating Control Bar for Existing Diagram (Export Shielded) */}
                        <div 
                            className={`absolute top-6 right-6 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg rounded-xl p-1.5 transition-opacity export-ignore hover-control-bar ${
                                isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-30'
                            }`}
                            data-export-ignore
                        >
                            {/* Annotate / Sketch Tool */}
                            <button
                                type="button"
                                onClick={startSketchMode}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-indigo-600 hover:text-indigo-900 transition-colors cursor-pointer"
                                title="Annotate / Draw on Diagram"
                            >
                                <Edit3 size={13} />
                            </button>

                            <div className="h-3 w-px bg-neutral-200 mx-0.5" />

                            <button
                                type="button"
                                onClick={() => handleScale(-0.1)}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                                title="Zoom Out Diagram"
                            >
                                <ZoomOut size={13} />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-neutral-600 px-1">
                                {Math.round((diagram.scale || 1.0) * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => handleScale(0.1)}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                                title="Zoom In Diagram"
                            >
                                <ZoomIn size={13} />
                            </button>

                            <div className="h-3 w-px bg-neutral-200 mx-0.5" />

                            <button
                                type="button"
                                onClick={handleToggleFit}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                                title={diagram.fit === 'cover' ? 'Switch to Contain' : 'Switch to Fill/Cover'}
                            >
                                <Maximize2 size={13} />
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-blue-600 transition-colors cursor-pointer"
                                title="Replace Diagram"
                            >
                                <Upload size={13} />
                            </button>

                            <button
                                type="button"
                                onClick={() => onUpdateDiagram(null)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                                title="Remove Diagram"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Caption Area (Authentic Student Label in Handwriting or Clean Font) */}
                    <div className="w-full pt-3 border-t border-neutral-300/70 text-center">
                        {isEditingCaption ? (
                            <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
                                <input
                                    type="text"
                                    value={activeCaption}
                                    onChange={(e) => setCaptionDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingCaption(false);
                                            onUpdateDiagram({ ...diagram, caption: activeCaption });
                                            setCaptionDraft(null);
                                        }
                                    }}
                                    onBlur={() => {
                                        setIsEditingCaption(false);
                                        onUpdateDiagram({ ...diagram, caption: activeCaption });
                                        setCaptionDraft(null);
                                    }}
                                    autoFocus
                                    className="w-full px-3 py-1 text-xs border border-blue-400 rounded-lg bg-white shadow-xs focus:outline-none font-sans"
                                />
                            </div>
                        ) : (
                            <p 
                                onClick={() => {
                                    setCaptionDraft(diagram.caption || activeCaption);
                                    setIsEditingCaption(true);
                                }}
                                className="text-sm font-semibold cursor-pointer hover:text-blue-600 transition-colors inline-block px-3 py-1 rounded-md hover:bg-neutral-100/60"
                                style={{
                                    fontFamily: getFontFamilyCss(font),
                                    color: inkColor,
                                }}
                                title="Click to edit diagram caption"
                            >
                                {diagram.caption || activeCaption}
                            </p>
                        )}
                        <p 
                            className="text-[10px] text-neutral-400 mt-0.5 font-mono export-ignore"
                            data-export-ignore
                        >
                            Click caption to edit • High-resolution PDF export included
                        </p>
                    </div>
                </div>
            ) : (
                // Blank Page Dropzone, Sketch Trigger & Templates
                // Marked with export-ignore so exporting an empty sheet yields clean white/grid paper!
                <div 
                    className="w-full max-w-xl flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl border-2 border-dashed border-neutral-300 bg-white/70 hover:bg-white/95 hover:border-blue-400 transition-all shadow-xs export-ignore"
                    data-export-ignore
                >
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-200/70 flex items-center justify-center text-purple-600 mb-4 shadow-xs">
                        <ImageIcon size={26} />
                    </div>

                    <h3 className="text-base font-extrabold text-neutral-900">
                        Lab Diagram & Schematics Sheet
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-md leading-relaxed">
                        This facing page is dedicated for student circuit diagrams, optics ray tracings, flowcharts, or observation graphs.
                    </p>

                    {/* Main Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
                        >
                            <Upload size={14} />
                            <span>Upload Your Diagram</span>
                        </button>

                        <button
                            type="button"
                            onClick={startSketchMode}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
                            title="Open interactive freehand drawing canvas"
                        >
                            <PenTool size={14} />
                            <span>✏️ Draw / Sketch Diagram</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePasteClipboard}
                            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer"
                            title="Paste image directly from clipboard (Ctrl + V)"
                        >
                            <Clipboard size={14} className="text-indigo-600" />
                            <span>Paste (Ctrl+V)</span>
                        </button>
                    </div>

                    {/* Quick Student Preset Templates */}
                    <div className="w-full mt-6 pt-5 border-t border-neutral-200/70">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-neutral-500 mb-3">
                            <Sparkles size={12} className="text-amber-500" />
                            <span>Or insert standard experiment diagram:</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PRESET_DIAGRAMS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handlePresetSelect(preset)}
                                    className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left group flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <span className="text-[9px] font-mono font-bold text-purple-600 block uppercase">
                                            {preset.category}
                                        </span>
                                        <span className="text-xs font-bold text-neutral-800 group-hover:text-purple-900 block mt-0.5 leading-tight">
                                            {preset.name}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-neutral-400 group-hover:text-purple-600 font-bold mt-2 inline-flex items-center gap-0.5">
                                        + Use Template
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
