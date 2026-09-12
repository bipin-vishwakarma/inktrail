import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ExternalLink } from 'lucide-react';
import Text2HandwritingLogo from '../common/Text2HandwritingLogo';
import { useStore } from '../../lib/store';
import UserMenu from '../UserMenu';

export default function Navbar() {
    const isNavbarVisible = useStore(state => state.isNavbarVisible);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const location = useLocation();

    // Scroll-spy targets on landing page — ordered to match DOM
    const scrollLinks: { name: string; sectionId: string }[] = [
        { name: 'How It Works', sectionId: 'how-it-works' },
        { name: 'Paper Vault', sectionId: 'paper-vault' },
        { name: 'Features', sectionId: 'features' },
        { name: 'FAQ', sectionId: 'faq' },
    ];

    // Always-route links (page navigation)
    const pageLinks: { name: string; path: string }[] = [
        { name: 'Pricing', path: '/pricing' },
        { name: 'About', path: '/about' },
    ];

    const isOnLanding = location.pathname === '/';

    // Scroll spy when on landing page
    useEffect(() => {
        if (!isOnLanding) return;

        const handleScroll = () => {
            const sectionIds = ['how-it-works', 'paper-vault', 'features', 'faq'];
            const scrollPos = window.scrollY + 220;
            for (const id of sectionIds) {
                const el = document.getElementById(id);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        setActiveSection(id);
                        return;
                    }
                }
            }
            if (window.scrollY < 350) {
                setActiveSection('');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOnLanding]);

    const handleScrollLinkClick = (e: React.MouseEvent, sectionId: string) => {
        if (isOnLanding) {
            e.preventDefault();
            const elem = document.getElementById(sectionId);
            if (elem) {
                elem.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `#${sectionId}`);
                setActiveSection(sectionId);
            }
        }
        // If not on landing, let React Router navigate to `/#sectionId` naturally
    };

    const isScrollLinkActive = (sectionId: string) =>
        isOnLanding && activeSection === sectionId;

    const isPageLinkActive = (path: string) =>
        location.pathname === path;

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
                <div className="w-full max-w-5xl glass rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex justify-between items-center pointer-events-auto ring-1 ring-black/5 shadow-lg shadow-black/5">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group relative shrink-0">
                        <Text2HandwritingLogo size={32} />
                        <span className="text-lg sm:text-xl font-display font-black text-neutral-900 tracking-tight">Text2Handwriting.</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1 bg-neutral-100/70 p-1 rounded-full border border-neutral-200/50">
                        {/* Scroll links — scroll on landing, route to `/#section` elsewhere */}
                        {scrollLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={isOnLanding ? `#${link.sectionId}` : `/#${link.sectionId}`}
                                onClick={(e) => handleScrollLinkClick(e, link.sectionId)}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isScrollLinkActive(link.sectionId)
                                        ? 'bg-white text-neutral-950 shadow-xs'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                                }`}
                            >
                                <span>{link.name}</span>
                            </Link>
                        ))}

                        {/* Separator */}
                        <span className="w-px h-4 bg-neutral-200/80 mx-0.5" />

                        {/* Page route links */}
                        {pageLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isPageLinkActive(link.path)
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



                        <div className="hidden sm:block">
                            <UserMenu />
                        </div>

                        <Link
                            to="/editor"
                            className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 hover:scale-103 active:scale-97 transition-all flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <Sparkles size={13} className="text-yellow-300" />
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
                            {/* Scroll links */}
                            {scrollLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={isOnLanding ? `#${link.sectionId}` : `/#${link.sectionId}`}
                                    onClick={(e) => {
                                        setMobileMenuOpen(false);
                                        handleScrollLinkClick(e, link.sectionId);
                                    }}
                                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                        isScrollLinkActive(link.sectionId)
                                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                            : 'bg-neutral-50 border-neutral-200/70 text-neutral-700 hover:bg-neutral-100'
                                    }`}
                                >
                                    <span>{link.name}</span>
                                </Link>
                            ))}

                            {/* Page links */}
                            {pageLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                                        isPageLinkActive(link.path)
                                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                            : 'bg-neutral-50 border-neutral-200/70 text-neutral-700 hover:bg-neutral-100'
                                    }`}
                                >
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </div>



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
                                href="https://github.com/bipin-vishwakarma/text2handwriting"
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
