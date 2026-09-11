import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ExternalLink } from 'lucide-react';
import InkTrailLogo from '../common/InkTrailLogo';
import { useStore } from '../../lib/store';
import UserMenu from '../UserMenu';

export default function Navbar() {
    const isNavbarVisible = useStore(state => state.isNavbarVisible);
    const openOnboarding = useStore(state => state.openOnboarding);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks: { name: string; path: string; badge?: string }[] = [
        { name: 'Features', path: '/features' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'FAQ', path: '/faq' },
        { name: 'About', path: '/about' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                    y: isNavbarVisible ? 0 : -120,
                    opacity: isNavbarVisible ? 1 : 0,
                    scale: isNavbarVisible ? 1 : 0.95
                }}
                transition={{ 
                    duration: 0.5, 
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.3 }
                }}
                className="fixed top-3 sm:top-6 left-0 right-0 z-50 px-3 sm:px-6 flex justify-center pointer-events-none"
            >
                <div className="w-full max-w-4xl glass rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex justify-between items-center pointer-events-auto ring-1 ring-black/5 shadow-lg shadow-black/5">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group relative shrink-0">
                        <InkTrailLogo size={32} />
                        <span className="text-lg sm:text-xl font-display font-black text-neutral-900 tracking-tight">InkTrail.</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1 bg-neutral-100/70 p-1 rounded-full border border-neutral-200/50">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                                    isActive(link.path)
                                        ? 'bg-white text-neutral-950 shadow-xs'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                                }`}
                            >
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions & Account */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={openOnboarding}
                            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-all cursor-pointer"
                            title="Interactive Student Onboarding Tour"
                        >
                            <Sparkles size={12} className="text-amber-500" />
                            <span>Tour</span>
                        </button>

                        <Link
                            to="/account"
                            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-amber-500/30 text-[11px] font-black text-amber-800 hover:scale-105 transition-all shadow-2xs"
                            title="InkTrail is 100% Free during Beta!"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>100% Free Beta 🔥</span>
                        </Link>

                        <div className="hidden sm:block">
                            <UserMenu />
                        </div>

                        <Link
                            to="/editor"
                            className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-neutral-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-neutral-900/15 hover:bg-black hover:scale-103 active:scale-97 transition-all flex items-center gap-1.5"
                        >
                            <Sparkles size={13} className="text-amber-400" />
                            <span>Open Studio</span>
                        </Link>

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-1.5 text-neutral-700 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
                            title="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-4 top-20 z-40 md:hidden bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-3xl p-5 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                                Navigation
                            </span>
                            <UserMenu />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border ${
                                        isActive(link.path)
                                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                            : 'bg-neutral-50 border-neutral-200/70 text-neutral-700 hover:bg-neutral-100'
                                    }`}
                                >
                                    <span>{link.name}</span>
                                    {link.badge && (
                                        <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-md text-[9px]">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                openOnboarding();
                            }}
                            className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                            <Sparkles size={13} className="text-amber-600" />
                            <span>Quick Student Tour & Slides</span>
                        </button>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-medium text-neutral-500">
                            <Link to="/disclaimer" onClick={() => setMobileMenuOpen(false)} className="hover:text-neutral-900">
                                Disclaimer
                            </Link>
                            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-neutral-900">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-neutral-900">
                                Terms
                            </Link>
                            <a
                                href="https://github.com/bipin-vishwakarma/inktrail"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-neutral-900"
                            >
                                <span>GitHub</span>
                                <ExternalLink size={10} />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
