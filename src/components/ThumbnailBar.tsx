import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Layers } from 'lucide-react';

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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 select-none transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-md border border-neutral-200/90 shadow-2xl shadow-neutral-950/10 rounded-2xl p-1.5 flex items-center gap-2 text-xs">
                {/* Collapsed Pill View */}
                {isCollapsed ? (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 rounded-xl transition-all cursor-pointer font-bold text-xs"
                        title="Expand thumbnail preview bar"
                    >
                        <Layers size={13} className="text-blue-600" />
                        <span>Page {activePageIndex + 1} of {totalPages}</span>
                        <ChevronsUpDown size={12} className="text-neutral-400" />
                    </button>
                ) : (
                    <>
                        {/* Collapse Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                            title="Minimize thumbnail dock"
                        >
                            <ChevronsUpDown size={13} />
                        </button>

                        {/* Previous Page Button */}
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={activePageIndex === 0}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                activePageIndex === 0
                                    ? 'text-neutral-300 cursor-not-allowed'
                                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                            }`}
                            title="Previous page"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        {/* Thumbnail Strip */}
                        <div className="flex items-center gap-2 max-w-[55vw] sm:max-w-[70vw] overflow-x-auto py-1 px-1 custom-scrollbar">
                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const isActive = activePageIndex === idx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => onSelectPage(idx)}
                                        className={`group relative flex flex-col items-center cursor-pointer transition-all duration-200 focus:outline-none ${
                                            isActive ? 'scale-105' : 'opacity-70 hover:opacity-100 hover:scale-102'
                                        }`}
                                        title={`Jump to Page ${idx + 1}`}
                                    >
                                        {/* Mini Sheet Card */}
                                        <div
                                            className={`w-9 h-12.5 rounded-md bg-white border transition-all shadow-xs relative overflow-hidden flex flex-col justify-between p-1 ${
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
                                                {idx + 1}
                                            </div>
                                        </div>

                                        {/* Active Dot Indicator */}
                                        {isActive && (
                                            <span className="w-1 h-1 rounded-full bg-blue-600 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Page Button */}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={activePageIndex === totalPages - 1}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                activePageIndex === totalPages - 1
                                    ? 'text-neutral-300 cursor-not-allowed'
                                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                            }`}
                            title="Next page"
                        >
                            <ChevronRight size={15} />
                        </button>

                        {/* Page Counter Label */}
                        <div className="pl-1 pr-2 border-l border-neutral-200/80 text-[10px] font-bold text-neutral-500 font-mono tracking-tight whitespace-nowrap">
                            {activePageIndex + 1} / {totalPages}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
