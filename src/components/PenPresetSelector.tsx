import React from 'react';
import { useStore } from '../lib/store';
import type { PenType } from '../types';
import { PenTool } from 'lucide-react';

export const PenPresetSelector: React.FC = () => {
    const { penType, setPenType, inkColor, setInkColor } = useStore();

    const presets: { id: PenType; label: string; color: string; desc: string }[] = [
        { id: 'ballpoint-blue', label: 'Blue Ballpoint', color: '#1e40af', desc: 'Classic student ballpoint' },
        { id: 'gel-black', label: 'Black Gel Pen', color: '#111827', desc: 'Deep dark ink' },
        { id: 'fountain-blue', label: 'Royal Fountain', color: '#1d4ed8', desc: 'Parker royal blue' },
        { id: 'pencil', label: 'HB #2 Pencil', color: '#4b5563', desc: 'Graphite texture' },
        { id: 'red-pen', label: 'Red Pen', color: '#dc2626', desc: 'Vibrant red ink' },
    ];

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                <PenTool size={12} /> Pen & Ink Preset
            </label>

            {/* Quick Pen Preset Cards */}
            <div className="grid grid-cols-5 gap-1.5">
                {presets.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => setPenType(p.id)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center border ${
                            penType === p.id
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm scale-105'
                                : 'bg-neutral-50 border-black/5 text-neutral-600 hover:bg-neutral-100'
                        }`}
                        title={p.desc}
                    >
                        <div
                            className="w-4 h-4 rounded-full border border-white/40 shadow-xs shrink-0"
                            style={{ backgroundColor: p.color }}
                        />
                        <span className="text-[9px] font-bold leading-tight line-clamp-1">
                            {p.label.split(' ')[0]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Fine Ink Color Picker */}
            <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                    Custom Ink Color
                </span>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={inkColor}
                        onChange={(e) => setInkColor(e.target.value)}
                        className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{inkColor}</span>
                </div>
            </div>
        </div>
    );
};
