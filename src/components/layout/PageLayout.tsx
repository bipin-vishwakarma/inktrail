
import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    description?: string;
    maxWidth?: string;
    children: ReactNode;
}

export default function PageLayout({ title, subtitle, description, maxWidth = 'max-w-3xl', children }: PageLayoutProps) {
    useEffect(() => {
        document.title = title + ' | Text2Handwriting - Text to Handwriting';
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description || subtitle || "Transform digital text into realistic, organic handwriting instantly.");
        }

        // Canonical Tag
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        const path = window.location.pathname === '/' ? '' : window.location.pathname;
        canonical.setAttribute('href', window.location.origin + path);
    }, [title, subtitle, description]);

    return (
        <div className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-[#FAF8F5] text-stone-900 selection:bg-violet-200 selection:text-violet-900">
             
             {/* Decorative Background */}
             <div className="pointer-events-none -z-10 absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />
             </div>

             <div className={`${maxWidth} mx-auto px-5 sm:px-6 relative z-10`}>
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-stone-950 mb-4 tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-base sm:text-lg text-stone-600 font-serif italic max-w-xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 prose prose-stone prose-base max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 prose-headings:tracking-tight prose-p:text-stone-600 prose-p:leading-relaxed prose-a:text-violet-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-li:text-stone-600"
                >
                    {children}
                </motion.div>
             </div>
        </div>
    );
}


