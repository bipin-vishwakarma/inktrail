import PageLayout from '../components/layout/PageLayout';
import { Download, FlaskConical, GraduationCap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturesPage() {
    return (
        <PageLayout 
            title="Features & Capabilities" 
            subtitle="Everything students and creators need to produce authentic, physics-accurate handwritten documents."
            description="Explore the advanced capabilities of InkTrail: Lab practical interleaved pages, diagram workspaces, AI humanizer, authentic human errors, smartphone lighting physics, and multi-auth student vaults."
        >
            <div className="space-y-16">
                <section className="prose prose-neutral max-w-none">
                    <p className="lead text-lg text-neutral-600">
                        <strong>InkTrail</strong> is the world's first comprehensive student handwriting simulator. Designed from real university workflows at UPES Dehradun, it blends analog physical imperfections with modern digital speed to eliminate manual assignment fatigue.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Feature 1: Lab Practical Mode */}
                    <div className="p-7 bg-white/70 rounded-3xl border border-blue-200/80 shadow-xs hover:shadow-md transition-all group">
                        <div className="w-13 h-13 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <FlaskConical size={26} />
                        </div>
                        <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md uppercase tracking-wider mb-2">
                            Student Essential
                        </div>
                        <h3 className="text-xl font-bold mb-2.5 text-neutral-900">Lab Notebook Mode</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Interleaves plain diagram sheets and millimeter graph paper with ruled observation pages. Built-in pre-drawn SVG circuits, prism ray refractions, and chemistry titrations.
                        </p>
                    </div>

                    {/* Feature 2: Human Errors & Fatigue */}
                    <div className="p-7 bg-white/70 rounded-3xl border border-black/5 hover:shadow-md transition-all group">
                        <div className="w-13 h-13 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">✂️</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2.5 text-neutral-900">Human Errors & Strikes</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Simulate authentic human mistakes with auto-typos, realistic wavy or dense pen scratch-outs, handwritten caret (<code className="font-mono text-xs bg-black/5 px-1 py-0.5 rounded">^</code>) insertions, and biological writing fatigue.
                        </p>
                    </div>

                    {/* Feature 3: Smartphone Camera Physics */}
                    <div className="p-7 bg-white/70 rounded-3xl border border-black/5 hover:shadow-md transition-all group">
                        <div className="w-13 h-13 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">📸</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2.5 text-neutral-900">Camera & Lighting Physics</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Render realistic overhead smartphone shadows with customizable angle and intensity, warm desk lamp lighting, 3D perspective tilts, sensor ISO noise, and authentic paper creases.
                        </p>
                    </div>

                    {/* Feature 4: Smart Margin Indexing */}
                    <div className="p-7 bg-white/70 rounded-3xl border border-black/5 hover:shadow-md transition-all group">
                        <div className="w-13 h-13 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <BookOpen size={26} />
                        </div>
                        <h3 className="text-xl font-bold mb-2.5 text-neutral-900">Smart Margin Indexing</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Automatically detects question tags (Q1., Q.2), answer labels (Ans:, Sol:), and Roman numerals, positioning them gracefully inside the margin line just like an authentic student notebook.
                        </p>
                    </div>

                    {/* Feature 5: Student Multi-Auth */}
                    <div className="p-7 bg-white/70 rounded-3xl border border-black/5 hover:shadow-md transition-all group">
                        <div className="w-13 h-13 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <GraduationCap size={26} />
                        </div>
                        <h3 className="text-xl font-bold mb-2.5 text-neutral-900">Student ID & Multi-Auth</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Log in with your University Roll No. (UPES / College ID), Google OAuth, GitHub, or Email Magic Link. Stores your assignment drafts and style preferences in local storage.
                        </p>
                    </div>

                    {/* Feature 6: High-Res PDF Export */}
                    <div className="p-7 bg-white/70 rounded-3xl border border-black/5 hover:shadow-md transition-all group">
                        <div className="w-13 h-13 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Download size={26} />
                        </div>
                        <h3 className="text-xl font-bold mb-2.5 text-neutral-900">High-Res Multi-Page PDF</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Export ultra-sharp 2x resolution multi-page PDFs or ZIP archives of individual sheets with preserved 3D camera shadows and crisp vector typography.
                        </p>
                    </div>
                </div>

                <section className="bg-neutral-900 text-white p-10 sm:p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white m-0">Ready to transform your assignments?</h3>
                        <p className="text-neutral-400 max-w-md text-sm m-0">
                            Launch InkTrail Studio now. No credit card required. Free and open source for all students.
                        </p>
                    </div>
                    <Link 
                        to="/editor" 
                        className="px-8 py-4 bg-white text-neutral-900 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg"
                    >
                        Launch InkTrail Studio ➔
                    </Link>
                </section>
            </div>
        </PageLayout>
    );
}
