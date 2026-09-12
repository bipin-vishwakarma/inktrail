import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from '../common/CookieConsent';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingModal from '../modals/OnboardingModal';

export default function RootLayout() {
    const location = useLocation();
    const isStudioRoute = location.pathname === '/editor';

    return (
        <>
            {isStudioRoute ? (
                <div className="w-screen h-screen overflow-hidden bg-[#F3F4F6]">
                    <Outlet />
                </div>
            ) : (
                <div className="min-h-screen flex flex-col relative isolate">
                    {/* Global Atmospheric Background */}
                    <div className="mesh-gradient" />
                    <div className="ambient-bg-global" />
                    
                    <Navbar />
                    <main className="flex-1 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <Footer />
                    <CookieConsent />
                </div>
            )}

            {/* Global Interactive Student Onboarding Tour Modal */}
            <OnboardingModal />
        </>
    );
}
