import PageLayout from '../components/layout/PageLayout';
import { Heart, Sparkles, Shield, FlaskConical, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <PageLayout 
            title="About InkTrail" 
            subtitle="Bridging analog nostalgia and hyper-realistic handwriting simulation for students and creators worldwide."
            description="Discover the story behind InkTrail. Born from authentic student coursework challenges, built with human error algorithms, authentic lab practical notebooks, and local-first privacy."
        >
            <div className="space-y-12">
                <section>
                    <h3 className="flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={24} />
                        Our Vision & Origins
                    </h3>
                    <p>
                        In an era dominated by sterile digital fonts and repetitive typing, the irreplaceable warmth and character of handwritten work was getting lost. <strong>InkTrail</strong> was created by <strong>Bipin Vishwakarma</strong>, a passionate student engineer and creator, to bridge the divide between analog authenticity and digital speed.
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
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 ring-2 ring-blue-500/20 shadow-md">
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
                        <h3 className="text-lg font-bold text-neutral-900 m-0">The InkTrail Student Initiative</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed m-0">
                            Crafted with passion by <strong>Bipin Vishwakarma</strong>. InkTrail is dedicated to helping engineering, science, and humanities students balance demanding academic coursework with modern assistive productivity tooling.
                        </p>
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
                        Launch InkTrail Studio ➔
                    </Link>
                </section>
            </div>
        </PageLayout>
    );
}
