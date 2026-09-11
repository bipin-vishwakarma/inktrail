import { useState, useRef, useEffect } from 'react';
import { LogOut, Clock, ChevronDown, Sparkles, Cloud, GraduationCap } from 'lucide-react';
import HistoryModal from './modals/HistoryModal';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';

interface UserMenuProps {
    onOpenTour?: () => void;
}

export default function UserMenu({ onOpenTour }: UserMenuProps) {
    const { user, logout, setAuthModalOpen } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const history = useStore(state => state.history);
    const openOnboarding = useStore(state => state.openOnboarding);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!user) {
        return (
            <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                title="Sign in with Student ID or Google account"
            >
                <GraduationCap size={13} className="text-blue-400" />
                <span>Student Sign In</span>
            </button>
        );
    }

    const docCount = user.savedDocsCount || Math.max(1, history.length);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all bg-white shadow-2xs cursor-pointer"
                title={`${user.name} (${user.collegeName || 'Student'})`}
            >
                <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-neutral-200"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`;
                    }}
                />
                <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-neutral-800 max-w-[90px] truncate block leading-tight">
                        {user.given_name || user.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold leading-none block">
                        Free Cloud Sync
                    </span>
                </div>
                <ChevronDown size={13} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200/90 overflow-hidden z-50 text-neutral-800 select-none"
                    >
                        {/* User Info Header */}
                        <div className="p-4 bg-linear-to-br from-neutral-50 to-indigo-50/30 border-b border-neutral-100">
                            <div className="flex items-center gap-3 mb-2">
                                <img 
                                    src={user.picture} 
                                    alt={user.name} 
                                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-neutral-200"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-extrabold text-neutral-900 truncate">{user.name}</p>
                                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            
                            {/* Student Badge & Cloud Status */}
                            <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] font-bold">
                                <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                    <GraduationCap size={11} />
                                    <span className="truncate max-w-[120px]">{user.collegeName || 'UPES Dehradun'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    <Cloud size={10} />
                                    <span>Cloud Active</span>
                                </span>
                            </div>
                        </div>
                        
                        {/* Actions List */}
                        <div className="p-1.5 space-y-0.5">
                            {/* Documents Vault */}
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsHistoryOpen(true);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600">
                                        <Clock size={13} />
                                    </div>
                                    <span>History Vault</span>
                                </div>
                                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                    {docCount} docs
                                </span>
                            </button>

                            {/* Tour / Quick Guide */}
                            <button 
                                type="button"
                                onClick={() => {
                                    if (onOpenTour) {
                                        onOpenTour();
                                    } else {
                                        openOnboarding();
                                    }
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                    <Sparkles size={13} />
                                </div>
                                <span>Quick Tour & Slides</span>
                            </button>

                            {/* Switch Account */}
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setAuthModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                    <GraduationCap size={13} />
                                </div>
                                <span>Switch Student Profile</span>
                            </button>
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-neutral-100 p-1.5">
                            <button 
                                type="button"
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                                    <LogOut size={13} />
                                </div>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        </div>
    );
}
