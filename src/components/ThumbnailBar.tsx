import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsRight, Layers } from 'lucide-react';

interface ThumbnailBarProps {
    totalPages: number;
    activePageIndex: number;
    onSelectPage: (index: number) => void;
    paperId?: string;
}

export const ThumbnailBar: React.FC<ThumbnailBarProps> = ({
    totalPages,
    activePageIndex,
    onSelectPage,
    paperId = 'college',
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (totalPages <= 0) return null;

    const handlePrev = () => {
        if (activePageIndex > 0) {
            onSelectPage(activePageIndex - 1);
        }
    };

    const handleNext = () => {
        if (activePageIndex < totalPages - 1) {
            onSelectPage(activePageIndex + 1);
        }
    };

    return (
        <aside 
            aria-label="Page thumbnail navigation"
            className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 select-none transition-all duration-300"
        >
            <div className="bg-white/92 backdrop-blur-md border border-neutral-200/90 shadow-2xl shadow-neutral-950/10 rounded-2xl p-2 flex flex-col items-center gap-2 text-xs">
                {/* Collapsed View: Compact Vertical Pill */}
                {isCollapsed ? (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="flex flex-col items-center gap-1.5 py-2 px-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/90 rounded-xl transition-all cursor-pointer font-bold text-[10px]"
                        title="Expand thumbnail sidebar"
                    >
                        <Layers size={14} className="text-blue-600" />
                        <span className="font-mono">{activePageIndex + 1}/{totalPages}</span>
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Pages</span>
                    </button>
                ) : (
                    <>
                        {/* Header: Collapse Button & Page Count */}
                        <div className="w-full flex items-center justify-between gap-1.5 pb-1.5 border-b border-neutral-200/70 px-0.5">
                            <div className="flex items-center gap-1 text-[10px] font-black text-neutral-600 font-mono">
                                <Layers size={12} className="text-blue-600" />
                                <span>{activePageIndex + 1}/{totalPages}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCollapsed(true)}
                                className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="Collapse thumbnail sidebar"
                            >
                                <ChevronsRight size={13} />
                            </button>
                        </div>

                        {/* Previous Page (Up) */}
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={activePageIndex === 0}
                            className={`p-1 rounded-lg transition-all cursor-pointer ${
                                activePageIndex === 0
                                    ? 'text-neutral-300 cursor-not-allowed'
                                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                            }`}
                            title="Previous page (Up)"
                        >
                            <ChevronUp size={15} />
                        </button>

                        {/* Vertical Thumbnail Strip */}
                        <div className="flex flex-col items-center gap-2.5 max-h-[55vh] overflow-y-auto py-1 px-1 custom-scrollbar">
                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const isActive = activePageIndex === idx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => onSelectPage(idx)}
                                        className={`group relative flex items-center cursor-pointer transition-all duration-200 focus:outline-none ${
                                            isActive ? 'scale-105' : 'opacity-70 hover:opacity-100 hover:scale-102'
                                        }`}
                                        title={`Jump to Page ${idx + 1}`}
                                    >
                                        {/* Mini Sheet Card */}
                                        <div
                                            className={`w-10 h-14 rounded-md bg-white border transition-all shadow-xs relative overflow-hidden flex flex-col justify-between p-1 ${
                                                isActive
                                                    ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-blue-500/20 shadow-md'
                                                    : 'border-neutral-200 group-hover:border-neutral-400'
                                            }`}
                                        >
                                            {/* Red margin line simulation if ruled */}
                                            {paperId === 'college' && (
                                                <div className="absolute top-0 bottom-0 left-2 w-[0.5px] bg-rose-300 pointer-events-none" />
                                            )}

                                            {/* Mini Horizontal Ruling Lines */}
                                            <div className="space-y-1 mt-0.5 opacity-60">
                                                <div className="h-[0.5px] bg-neutral-300 w-full" />
                                                <div className="h-[0.5px] bg-neutral-300 w-full" />
                                                <div className="h-[0.5px] bg-neutral-300 w-full" />
                                                <div className="h-[0.5px] bg-neutral-300 w-full" />
                                                <div className="h-[0.5px] bg-neutral-300 w-4/5" />
                                            </div>

                                            {/* Mini Page Number Label */}
                                            <div
                                                className={`text-[8px] font-black text-center leading-none ${
                                                    isActive ? 'text-blue-600 font-bold' : 'text-neutral-400'
                                                }`}
                                            >
                                                P.{idx + 1}
                                            </div>
                                        </div>

                                        {/* Active Pip Indicator on Left of Card */}
                                        {isActive && (
                                            <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-3.5 rounded-full bg-blue-600" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Page (Down) */}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={activePageIndex === totalPages - 1}
                            className={`p-1 rounded-lg transition-all cursor-pointer ${
                                activePageIndex === totalPages - 1
                                    ? 'text-neutral-300 cursor-not-allowed'
                                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                            }`}
                            title="Next page (Down)"
                        >
                            <ChevronDown size={15} />
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
};
