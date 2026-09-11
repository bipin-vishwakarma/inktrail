import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MoveHorizontal, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const COMPARISON_PRESETS = [
    {
        id: 'physics',
        title: 'Physics Lab Experiment',
        beforeText: `EXPERIMENT 4: VERIFICATION OF OHM'S LAW
Aim: To determine the resistance per unit length of a given wire by plotting a graph between voltage (V) and current (I).

Formula:
V = I * R, where R is the resistance of the conductor in Ohms (Ω).

Observation:
Current reading scales linearly with applied voltage across all 5 test intervals (2V, 4V, 6V, 8V, 10V). Calculated error margin is < 1.2%.`,
        afterText: `Aim: To determine the resistance per unit length of a given wire by plotting a graph between voltage (V) and current (I).

Formula: V = I * R (where R is the resistance in Ohms Ω)

Observation: Current scales linearly with applied voltage across all 5 intervals. Mean resistance calculated: 4.82 Ω.`,
        handwritingFont: 'Caveat, cursive',
        inkColor: '#1e3a8a', // Royal Blue
    },
    {
        id: 'computer',
        title: 'Computer Science Theory',
        beforeText: `QUESTION 1: EXPLAIN PIPELINING HAZARDS IN RISC ARCHITECTURES
Answer:
Pipelining increases CPU instruction throughput by overlapping execution stages (Fetch, Decode, Execute, Memory, Write-Back).

Key Hazards:
1. Structural Hazards: Resource contention for ALU or cache.
2. Data Hazards: Read-After-Write (RAW) dependencies.
3. Control Hazards: Branch prediction penalties and flush stalls.`,
        afterText: `Q1: Explain pipelining hazards in RISC architectures.

Ans: Pipelining increases CPU throughput by overlapping execution stages (IF, ID, EX, MEM, WB).

Key Hazards:
1. Structural Hazards: Memory contention
2. Data Hazards: RAW dependencies resolved via forwarding
3. Control Hazards: Branch delays & instruction flushing`,
        handwritingFont: 'Indie Flower, cursive',
        inkColor: '#0f172a', // Fountain Black
    },
    {
        id: 'chemistry',
        title: 'Chemistry Titration',
        beforeText: `PROCEDURE: TITRATION OF STANDARD OXALIC ACID
1. Wash all glass apparatus thoroughly with distilled water.
2. Pipette 20.0 mL of standard 0.05 M oxalic acid into the titration conical flask.
3. Add one test tube of 2N dilute sulfuric acid to prevent precipitation of MnO2.
4. Heat the contents up to 60°C - 70°C before titrating against potassium permanganate.`,
        afterText: `Procedure: Titration of Oxalic Acid

1. Wash all apparatus with distilled water.
2. Pipette 20.0 mL of 0.05 M oxalic acid into flask.
3. Add one test tube dilute H2SO4 to acidify.
4. Heat to 60°C and titrate against KMnO4 until permanent light pink endpoint is observed.`,
        handwritingFont: 'Cedarville Cursive, cursive',
        inkColor: '#0369a1', // Gel Blue
    },
];

export const BeforeAfterSlider: React.FC = () => {
    const [sliderPos, setSliderPos] = useState(50);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const preset = COMPARISON_PRESETS[selectedPreset];

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
        setSliderPos(pct);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            updatePosition(e.clientX);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !e.touches[0]) return;
            updatePosition(e.touches[0].clientX);
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, updatePosition]);

    return (
        <div className="w-full max-w-5xl mx-auto my-12 select-none">
            {/* Header & Preset Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-black tracking-wide uppercase mb-1.5">
                        <Sparkles size={12} className="text-violet-600" />
                        <span>Side-by-Side Comparison</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-display text-neutral-900 tracking-tight">
                        Mechanical Type vs. InkTrail Handwriting
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Drag the center slider to inspect authentic baseline jitter, pen ink bleeding, and margin lines.
                    </p>
                </div>

                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/80 self-stretch sm:self-auto overflow-x-auto">
                    {COMPARISON_PRESETS.map((p, idx) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPreset(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                selectedPreset === idx
                                    ? 'bg-white text-neutral-950 shadow-xs border border-black/5'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            {p.title.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comparison Canvas Card */}
            <div
                ref={containerRef}
                className="relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-300 ring-1 ring-black/5 cursor-ew-resize select-none bg-stone-100"
                onMouseDown={(e) => {
                    updatePosition(e.clientX);
                    setIsDragging(true);
                }}
                onTouchStart={(e) => {
                    if (e.touches[0]) updatePosition(e.touches[0].clientX);
                    setIsDragging(true);
                }}
            >
                {/* 1. RIGHT SIDE / BACKGROUND: REALISTIC HANDWRITTEN NOTEBOOK */}
                <div className="absolute inset-0 bg-[#fffdfa] overflow-hidden flex flex-col justify-between p-6 sm:p-10">
                    {/* Ruled lines pattern */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-45"
                        style={{
                            backgroundImage: 'linear-gradient(to bottom, transparent 31px, #93c5fd 32px)',
                            backgroundSize: '100% 32px',
                        }}
                    />

                    {/* Red left margin line */}
                    <div className="absolute top-0 bottom-0 left-12 sm:left-16 w-[1.5px] bg-red-400 opacity-60 pointer-events-none" />

                    {/* Badge */}
                    <div className="relative z-10 self-end">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black shadow-xs">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            InkTrail Organic Handwriting
                        </span>
                    </div>

                    {/* Handwritten Content */}
                    <div className="relative z-10 pl-8 sm:pl-12 max-w-xl">
                        <div
                            style={{
                                fontFamily: preset.handwritingFont,
                                color: preset.inkColor,
                                lineHeight: '32px',
                                transform: 'rotate(-0.25deg)',
                            }}
                            className="text-lg sm:text-2xl font-normal whitespace-pre-wrap select-none leading-[32px] tracking-wide"
                        >
                            {preset.afterText}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-[10px] sm:text-xs text-neutral-400 font-mono">
                        <span>Classmate 30-Line Ruled Register</span>
                        <span className="hidden sm:inline">Organic micro-jitter: Active</span>
                    </div>
                </div>

                {/* 2. LEFT SIDE / FOREGROUND CLIP: STERILE DIGITAL TYPED TEXT */}
                <div
                    className="absolute inset-y-0 left-0 bg-white border-r border-neutral-300 overflow-hidden flex flex-col justify-between p-6 sm:p-10 shadow-lg"
                    style={{ width: `${sliderPos}%` }}
                >
                    {/* Badge */}
                    <div className="relative z-10 self-start">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-600 text-[11px] font-black shadow-xs">
                            <FileText size={12} />
                            Sterile Computer Typed Text
                        </span>
                    </div>

                    {/* Digital Rigid Content */}
                    <div className="relative z-10 font-mono text-xs sm:text-sm text-neutral-800 max-w-xl whitespace-pre-wrap leading-relaxed select-none">
                        {preset.beforeText}
                    </div>

                    <div className="relative z-10 text-[10px] sm:text-xs text-neutral-400 font-mono">
                        <span>Raw Digital Font (Times New Roman / Courier)</span>
                    </div>
                </div>

                {/* 3. CENTER DRAGGABLE SPLITTER BAR */}
                <div
                    className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center -translate-x-1/2"
                    style={{ left: `${sliderPos}%` }}
                >
                    {/* Vertical Divider Line */}
                    <div className="w-[3px] h-full bg-gradient-to-b from-violet-500 via-indigo-600 to-cyan-500 shadow-md" />

                    {/* Floating 3D Circular Handle */}
                    <div
                        className={`absolute w-10 h-10 rounded-full bg-white text-neutral-900 border-2 border-violet-600 shadow-xl flex items-center justify-center transition-transform pointer-events-auto cursor-grab active:cursor-grabbing ${
                            isDragging ? 'scale-115 ring-4 ring-violet-500/30' : 'hover:scale-108'
                        }`}
                    >
                        <MoveHorizontal size={18} className="text-violet-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterSlider;
