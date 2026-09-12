import PageLayout from '../components/layout/PageLayout';
import { Heart, Sparkles, Shield, FlaskConical, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <PageLayout 
            title="About Text2Handwriting" 
            subtitle="Bridging analog nostalgia and hyper-realistic handwriting simulation for students and creators worldwide."
            description="Discover the story behind Text2Handwriting. Born from authentic student coursework challenges, built with human error algorithms, authentic lab practical notebooks, and local-first privacy."
        >
            <div className="space-y-12">
                <section>
                    <h3 className="flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={24} />
                        Our Vision & Origins
                    </h3>
                    <p>
                        In an era dominated by sterile digital fonts and repetitive typing, the irreplaceable warmth and character of handwritten work was getting lost. <strong>Text2Handwriting</strong> was created by <strong>Bipin Vishwakarma</strong>, a passionate student engineer and creator, to bridge the divide between analog authenticity and digital speed.
                    </p>
                    <p>
                        What started as a tool to solve the grueling physical fatigue of writing 40-page university assignments and practical lab manuals has evolved into the most comprehensive handwriting realism simulator on the internet.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/70 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-xs">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Heart className="text-rose-500" size={24} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Human Imperfection Engine</h4>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Simulates authentic micro-jitters, natural baseline drifts, pen fatigue, auto-strikeouts with messy wavy lines, and ink drying smudges.
                        </p>
                    </div>

                    <div className="p-6 bg-white/70 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-xs">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FlaskConical className="text-blue-600" size={24} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Lab Practical Notebooks</h4>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Interleaves plain diagram sheets and millimeter graph paper with ruled theory pages, complete with circuit schematics and chemical titration presets.
                        </p>
                    </div>

                    <div className="p-6 bg-white/70 rounded-2xl border border-black/5 hover:border-black/10 transition-all group shadow-xs">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Shield className="text-emerald-600" size={24} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">100% Local-First Privacy</h4>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Zero cloud storage of your private documents. All font vectorization, shadows, and PDF rendering occur directly in your browser.
                        </p>
                    </div>
                </div>

                {/* Student Founder Story */}
                <section className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 border border-blue-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-500/20 shadow-md">
                        <img 
                            src="https://avatars.githubusercontent.com/u/151464007?v=4" 
                            alt="Bipin Vishwakarma" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://github.com/bipin-vishwakarma.png';
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-blue-600" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">Built by Students, for Students</span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 m-0">The Text2Handwriting Student Initiative</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed m-0">
                            Crafted with passion by <strong>Bipin Vishwakarma</strong>. Text2Handwriting is dedicated to helping engineering, science, and humanities students balance demanding academic coursework with modern assistive productivity tooling.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <a href="https://github.com/bipin-vishwakarma" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors" title="GitHub Profile">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                            </a>
                            <a href="https://linkedin.com/in/bipin-vishwakarma" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-blue-600 transition-colors" title="LinkedIn Profile">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                        </div>
                    </div>
                </section>

                <section className="bg-neutral-900 text-white p-8 sm:p-10 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-white mt-0 text-xl font-bold">Experience the Studio Today</h3>
                        <p className="text-neutral-300 text-sm max-w-lg m-0">
                            Convert your notes, try alternating lab notebook pages, upload circuit schematics, and export high-resolution PDFs in seconds.
                        </p>
                    </div>
                    <Link
                        to="/editor"
                        className="px-6 py-3 bg-white text-neutral-900 hover:bg-neutral-100 rounded-full font-bold text-sm shrink-0 transition-transform active:scale-95 shadow-md"
                    >
                        Launch Text2Handwriting Studio ➔
                    </Link>
                </section>
            </div>
        </PageLayout>
    );
}
