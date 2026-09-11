import PageLayout from '../components/layout/PageLayout';
import { MousePointer2, Settings2, Share2, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
    return (
        <PageLayout 
            title="How It Works" 
            subtitle="Four straightforward steps to generate realistic student notes, lab manuals, and assignments."
            description="Learn how to use InkTrail's text-to-handwriting engine: Import documents, customize realistic penmanship & lab diagrams, and export multi-page PDFs instantly."
        >
            <div className="space-y-16">
                <section className="prose prose-neutral max-w-none">
                    <p className="lead text-lg text-neutral-600">
                        <strong>InkTrail</strong> simplifies the entire workflow of turning digital lecture notes, lab records, and typed essays into authentic handwritten paper sheets ready for printing or submission.
                    </p>
                </section>

                <div className="grid grid-cols-1 gap-10">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8 bg-white/70 rounded-3xl border border-black/5 hover:border-black/10 transition-all shadow-xs">
                        <div className="w-16 h-16 bg-neutral-900 text-white rounded-3xl flex items-center justify-center shrink-0 text-2xl font-black shadow-lg shadow-neutral-900/10">1</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-xs">
                                <MousePointer2 size={14} />
                                Step One
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 m-0">Write, Paste, or Import Documents</h3>
                            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed m-0">
                                Type directly with live pagination, paste text with auto-AI preamble cleaner, or drag & drop files (.docx, .pdf, .md, .txt, .rtf). Automatic Smart Margin Indexing formats your question numbers (Q1., Sol:) automatically.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8 bg-white/70 rounded-3xl border border-black/5 hover:border-black/10 transition-all shadow-xs">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shrink-0 text-2xl font-black shadow-lg shadow-indigo-600/10">2</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-xs">
                                <Settings2 size={14} />
                                Step Two
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 m-0">Customize Penmanship & Human Imperfections</h3>
                            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed m-0">
                                Choose from authentic student handwriting styles, gel pens, ballpoints, or fountain inks. Dial in natural micro-jitter, baseline drifts, realistic auto-typos with wavy scratch-out lines, and low-ink fading.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8 bg-white/70 rounded-3xl border border-blue-200/80 shadow-xs">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shrink-0 text-2xl font-black shadow-lg shadow-blue-600/10">3</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-600 font-black tracking-widest uppercase text-xs">
                                <FlaskConical size={14} />
                                Step Three
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 m-0">Enable Lab Practical Mode & Schematics</h3>
                            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed m-0">
                                Interleave plain white diagram pages or millimeter graph sheets with ruled theory pages. Drop in circuit diagrams, prism ray optics, or titration apparatus from built-in student SVG templates, or paste your own images with handwritten captions.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8 bg-white/70 rounded-3xl border border-black/5 hover:border-black/10 transition-all shadow-xs">
                        <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center shrink-0 text-2xl font-black shadow-lg shadow-emerald-600/10">4</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-600 font-black tracking-widest uppercase text-xs">
                                <Share2 size={14} />
                                Step Four
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 m-0">Apply Camera Physics & Export High-Res PDF</h3>
                            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed m-0">
                                Toggle smartphone overhead shadows, warm desk lamp lighting, and paper fold creases. When satisfied, export a razor-sharp 2x resolution multi-page PDF or individual high-DPI images with one click.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="bg-neutral-900 text-white p-10 sm:p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white m-0">Ready to build your first notebook?</h3>
                        <p className="text-neutral-400 max-w-md text-sm m-0">
                            Jump straight into the studio and experience the full simulation in real-time.
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
