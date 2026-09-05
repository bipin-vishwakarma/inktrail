import React from 'react';
import { useStore } from '../lib/store';
import type { StrikeStyle } from '../types';
import { Scissors, HelpCircle, Droplet } from 'lucide-react';

export const HumanErrorsControls: React.FC = () => {
    const {
        autoTypoRate, setAutoTypoRate,
        strikeStyle, setStrikeStyle,
        autoCaret, setAutoCaret,
        charJitter, setCharJitter,
        fatigue, setFatigue,
        lowInkFade, setLowInkFade,
        lowInkStart, setLowInkStart,
        lowInkIntensity, setLowInkIntensity,
    } = useStore();

    const strikeOptions: { id: StrikeStyle; label: string; icon: string }[] = [
        { id: 'dense', label: 'Blackout', icon: '⬛' },
        { id: 'coil', label: 'Coil Spring', icon: '➰' },
        { id: 'wavy', label: 'Wavy', icon: '〰️' },
        { id: 'zigzag', label: 'Zigzag', icon: '⚡' },
        { id: 'single', label: 'Single', icon: '➖' },
        { id: 'double', label: 'Double', icon: '═' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <Scissors size={12} /> Human Errors & Strikes
                </label>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    Realistic
                </span>
            </div>

            {/* Auto-Typo Frequency */}
            <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5">
                    <span>Simulated Typo Rate</span>
                    <span className="text-neutral-900 font-black">{autoTypoRate === 0 ? 'Off (0%)' : `${autoTypoRate}%`}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={autoTypoRate}
                    onChange={(e) => setAutoTypoRate(Number(e.target.value))}
                    className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                />
                <p className="text-[9px] text-neutral-400 mt-1">
                    Randomly makes realistic spelling slips & scribbles them out like a human writer.
                </p>
            </div>

            {/* Strike Style Selector */}
            <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5 block">
                    Pen Scratch Style
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1.5 rounded-xl">
                    {strikeOptions.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setStrikeStyle(opt.id)}
                            className={`py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                                strikeStyle === opt.id
                                    ? 'bg-white text-neutral-900 shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
                            }`}
                        >
                            <span className="text-sm">{opt.icon}</span>
                            <span className="truncate text-[10px]">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Caret Correction Mode Toggle */}
            <label className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100/70 transition-colors">
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-neutral-700">Caret Correction (^)</span>
                    <span className="text-[9px] text-neutral-400">Writes fix above line with pen caret</span>
                </div>
                <input
                    type="checkbox"
                    checked={autoCaret}
                    onChange={(e) => setAutoCaret(e.target.checked)}
                    className="w-4 h-4 rounded border-black/10 text-neutral-900 focus:ring-0"
                />
            </label>

            {/* Character Micro-Jitter */}
            <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5">
                    <span>Per-Letter Jitter</span>
                    <span className="text-neutral-900 font-black">{charJitter}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="3.5"
                    step="0.5"
                    value={charJitter}
                    onChange={(e) => setCharJitter(Number(e.target.value))}
                    className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                />
            </div>

            {/* Writer's Fatigue / Sag */}
            <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5">
                    <span>Writer's Fatigue (Line Sag)</span>
                    <span className="text-neutral-900 font-black">{fatigue}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.5"
                    value={fatigue}
                    onChange={(e) => setFatigue(Number(e.target.value))}
                    className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                />
                <p className="text-[9px] text-neutral-400 mt-1">
                    Gradually increases line slant and wobble towards the bottom of the page.
                </p>
            </div>

            {/* Ballpoint Pen Low-Ink & Drying Simulation */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200/70 rounded-2xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Droplet size={13} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-neutral-800 block">Low-Ink Fading & Rail-Track Skips</span>
                            <span className="text-[9px] text-neutral-500">Ballpoint runs low on ink with dry fiber stutters</span>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={lowInkFade}
                        onChange={(e) => setLowInkFade(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                    />
                </label>

                {lowInkFade && (
                    <div className="space-y-3 pt-2.5 border-t border-black/5">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                                <span>Drying Begins At</span>
                                <span className="text-neutral-900 font-black">{lowInkStart}% of document</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                step="5"
                                value={lowInkStart}
                                onChange={(e) => setLowInkStart(Number(e.target.value))}
                                className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                            />
                            <p className="text-[9px] text-neutral-400 mt-1">
                                Pen begins starving for ink past this point in your document.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                                <span>Fading & Skip Intensity</span>
                                <span className="text-neutral-900 font-black">{Math.round(lowInkIntensity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.2"
                                max="1.0"
                                step="0.05"
                                value={lowInkIntensity}
                                onChange={(e) => setLowInkIntensity(Number(e.target.value))}
                                className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                            />
                            <p className="text-[9px] text-neutral-400 mt-1">
                                Severity of stroke lightening and microscopic rail-track skips.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Syntax Tip Box */}
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-100/80 rounded-xl text-[10px] text-indigo-950 space-y-1">
                <div className="flex items-center gap-1 font-bold text-indigo-900">
                    <HelpCircle size={11} />
                    <span>Manual Scratch Markup</span>
                </div>
                <p className="leading-tight text-neutral-600">
                    • Type <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[9px]">~~wrong~~</code> to scratch out a word.
                </p>
                <p className="leading-tight text-neutral-600">
                    • Type <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[9px]">~~bad~~^good</code> for caret correction!
                </p>
            </div>
        </div>
    );
};
