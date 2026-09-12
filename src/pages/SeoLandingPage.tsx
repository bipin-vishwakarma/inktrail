import { Helmet } from 'react-helmet-async';
import { ArrowRight, PenTool, Sparkles, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SeoLandingPageProps {
    seoTitle: string;
    seoDescription: string;
    h1: string;
    subtitle: string;
    keyword: string;
}

export default function SeoLandingPage({ seoTitle, seoDescription, h1, subtitle, keyword }: SeoLandingPageProps) {
    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
            </Helmet>
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8 text-center bg-white relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white -z-10" />
                
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8 border border-indigo-100">
                        <Sparkles className="w-4 h-4" />
                        <span>#1 {keyword} Tool</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                        {h1}
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/editor"
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <PenTool className="w-5 h-5" />
                            Start Writing Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-shadow hover:shadow-lg">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                <PenTool className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">54+ Handwriting Styles</h3>
                            <p className="text-slate-600 leading-relaxed">Choose from dozens of highly realistic, organic handwriting fonts to match your exact personal style.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-shadow hover:shadow-lg">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <FileText className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Margins</h3>
                            <p className="text-slate-600 leading-relaxed">Our powerful engine automatically aligns your text perfectly with ruled notebook paper lines.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-shadow hover:shadow-lg">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Download as PDF</h3>
                            <p className="text-slate-600 leading-relaxed">Export your final handwritten document as a high-resolution, unwatermarked PDF instantly.</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
