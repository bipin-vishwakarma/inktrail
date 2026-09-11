import React, { useState } from 'react';
import { Layers, Sparkles, BookOpen } from 'lucide-react';

export const SpiralNotebook3D: React.FC = () => {
    const [notebookStyle, setNotebookStyle] = useState<'spiral' | 'lab' | 'graph'>('spiral');
    const [isInteracting, setIsInteracting] = useState(false);

    // Number of metallic twin-wire loops
    const loopCount = 20;

    return (
        <div className="w-full max-w-5xl mx-auto my-16 select-none">
            {/* Heading & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
                        <BookOpen size={12} className="text-amber-700" />
                        <span>Authentic Stationery Details</span>
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 tracking-tight">
                        Authentic Indian Spiral Registers & Lab Manuals
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Realistic twin-wire metallic coils, punched margin holes, and 3D paper depth.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-100/90 p-1.5 rounded-2xl border border-neutral-200">
                    {[
                        { id: 'spiral' as const, label: '3D Spiral Ruled' },
                        { id: 'lab' as const, label: 'Lab Practical (Facing Sheets)' },
                        { id: 'graph' as const, label: 'Millimeter Graph' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setNotebookStyle(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                notebookStyle === tab.id
                                    ? 'bg-neutral-900 text-white shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3D Perspective Stage */}
            <div
                className="relative w-full py-12 flex items-center justify-center overflow-hidden"
                style={{ perspective: '1400px' }}
                onMouseEnter={() => setIsInteracting(true)}
                onMouseLeave={() => setIsInteracting(false)}
            >
                {/* Ambient Floor Shadow */}
                <div
                    className="absolute bottom-6 w-[85%] h-12 bg-black/15 blur-2xl rounded-[100%] transition-transform duration-500"
                    style={{
                        transform: isInteracting ? 'scale(1.05) translateY(4px)' : 'scale(1)',
                    }}
                />

                {/* 3D Notebook Body */}
                <div
                    className="relative w-full max-w-3xl min-h-[440px] sm:min-h-[480px] bg-[#fcfbf7] rounded-r-3xl rounded-l-lg border-y border-r border-stone-300 shadow-2xl transition-transform duration-500 ease-out flex"
                    style={{
                        transform: isInteracting
                            ? 'rotateX(4deg) rotateY(-3deg) rotateZ(-0.5deg) translateY(-8px)'
                            : 'rotateX(8deg) rotateY(-6deg) rotateZ(-1deg)',
                        transformStyle: 'preserve-3d',
                        boxShadow: '16px 24px 50px -10px rgba(0,0,0,0.18), 0 10px 20px -5px rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Layered Under-Pages (Creates 3D Multi-Sheet Depth Stack) */}
                    <div
                        className="absolute inset-0 bg-[#f7f4ed] rounded-r-3xl rounded-l-lg -z-10 translate-x-1.5 translate-y-1.5 border border-stone-300 pointer-events-none"
                    />
                    <div
                        className="absolute inset-0 bg-[#eeebe2] rounded-r-3xl rounded-l-lg -z-20 translate-x-3 translate-y-3 border border-stone-300/80 pointer-events-none"
                    />

                    {/* ================= LEFT MARGIN & TWIN-WIRE COILS ================= */}
                    <div className="relative w-14 sm:w-16 bg-[#faf8f2] border-r border-stone-300/80 flex flex-col justify-between py-5 shrink-0 select-none">
                        {/* Punched Holes & 3D Metallic Coils */}
                        <div className="absolute top-4 bottom-4 left-3 right-0 flex flex-col justify-between pointer-events-none">
                            {Array.from({ length: loopCount }).map((_, i) => (
                                <div key={i} className="relative flex items-center">
                                    {/* Punched hole cutout shadow */}
                                    <div className="w-3.5 h-3.5 rounded-full bg-stone-800/80 border border-stone-600 shadow-inner" />

                                    {/* 3D Twin-Wire Metallic Ring */}
                                    <div
                                        className="absolute -left-4 w-7 h-3 rounded-full border-2 border-slate-400 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 shadow-md"
                                        style={{
                                            transform: 'rotate(-14deg)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ================= MAIN NOTEBOOK SHEET CONTENT ================= */}
                    <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden bg-white/95 rounded-r-3xl">
                        {/* Ruled lines pattern or Graph pattern */}
                        {notebookStyle === 'graph' ? (
                            <div
                                className="absolute inset-0 pointer-events-none opacity-30"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
                                    backgroundSize: '16px 16px',
                                }}
                            />
                        ) : (
                            <div
                                className="absolute inset-0 pointer-events-none opacity-40"
                                style={{
                                    backgroundImage: 'linear-gradient(to bottom, transparent 31px, #93c5fd 32px)',
                                    backgroundSize: '100% 32px',
                                }}
                            />
                        )}

                        {/* Red Vertical Left Margin */}
                        <div className="absolute top-0 bottom-0 left-10 w-[2px] bg-rose-400 opacity-60 pointer-events-none" />

                        {/* Top Margin Header */}
                        <div className="relative z-10 pl-8 pb-4 flex items-center justify-between border-b border-rose-200/60 text-xs font-mono text-neutral-400">
                            <div>
                                <span className="font-bold text-neutral-700">PAGE NO:</span> 04
                            </div>
                            <div>
                                <span className="font-bold text-neutral-700">DATE:</span> 12 / 09 / 2026
                            </div>
                        </div>

                        {/* Realistic Written Assignment Text */}
                        <div className="relative z-10 pl-8 pt-3 max-w-xl">
                            <h4
                                style={{
                                    fontFamily: 'Playfair Display, serif',
                                    color: '#0f172a',
                                }}
                                className="text-xl sm:text-2xl font-bold tracking-tight mb-2"
                            >
                                {notebookStyle === 'lab'
                                    ? 'Experiment 06: Centripetal Force Verification'
                                    : notebookStyle === 'graph'
                                    ? 'Engineering Calculus & Fourier Series'
                                    : 'Thermal Dynamics & Entropy Equilibrium'}
                            </h4>

                            <div
                                style={{
                                    fontFamily: 'Caveat, cursive',
                                    color: '#1e3a8a',
                                    lineHeight: '32px',
                                }}
                                className="text-lg sm:text-2xl leading-[32px] space-y-1 select-none"
                            >
                                <p>
                                    Aim: To determine the mechanical work done during an isothermal expansion of an ideal gas.
                                </p>
                                <p>
                                    Formula: W = n * R * T * ln(V₂ / V₁)
                                </p>
                                <p>
                                    Observation: Pressure decreases hyperbolically as system volume expands from 2.0L to 6.5L under constant reservoir temperature.
                                </p>
                            </div>

                            {/* Simulated handwritten strike-out flaw */}
                            <div className="mt-2 text-rose-800 font-mono text-[11px] flex items-center gap-2 bg-rose-50/80 px-2.5 py-1 rounded-lg w-fit border border-rose-200/60">
                                <Sparkles size={11} className="text-rose-500" />
                                <span>Human error: Natural crossed-out line & correction caret inserted</span>
                            </div>
                        </div>

                        {/* Bottom Footer Details */}
                        <div className="relative z-10 pl-8 pt-6 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                            <span className="flex items-center gap-1">
                                <Layers size={12} className="text-indigo-600" />
                                <span>Classmate 180-GSM Smooth Grain</span>
                            </span>
                            <span className="font-bold text-emerald-600">
                                4K Vector Print Ready
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpiralNotebook3D;
