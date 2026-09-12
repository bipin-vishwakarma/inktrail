import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, ChevronDown, Cloud, GraduationCap, User } from 'lucide-react';
import HistoryModal from './modals/HistoryModal';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const history = useStore(state => state.history);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Not signed in — hide the user menu so we just see 'Open Studio'
    if (!user) {
        return null;
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
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                    {(user.given_name || user.name)?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-neutral-800 max-w-[90px] truncate block leading-tight">
                        {user.given_name || user.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold leading-none block">
                        Free · Cloud Sync
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
                        <div className="p-4 bg-gradient-to-br from-neutral-50 to-indigo-50/30 border-b border-neutral-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                    {(user.given_name || user.name)?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-extrabold text-neutral-900 truncate">{user.name}</p>
                                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] font-bold">
                                <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                    <GraduationCap size={11} />
                                    <span className="truncate max-w-[120px]">{user.collegeName || 'Student Scholar'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    <Cloud size={10} />
                                    <span>Cloud Active</span>
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-1.5 space-y-0.5">
                            {/* Account page */}
                            <button
                                type="button"
                                onClick={() => { navigate('/account'); setIsOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600">
                                    <User size={13} />
                                </div>
                                <span>My Account</span>
                                <span className="ml-auto text-[9px] text-neutral-400 font-normal">Profile · Upgrade</span>
                            </button>

                            {/* History Vault */}
                            <button
                                type="button"
                                onClick={() => { setIsHistoryOpen(true); setIsOpen(false); }}
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


                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-neutral-100 p-1.5">
                            <button
                                type="button"
                                onClick={() => { logout(); setIsOpen(false); }}
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
