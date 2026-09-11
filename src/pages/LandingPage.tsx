import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    Sparkles, ArrowRight, BookOpen, Zap, 
    ChevronDown, Camera, Flame, MousePointerClick,
    FlaskConical, Eye, PenTool, ShieldCheck
} from 'lucide-react';
import InkTrailLogo from '../components/common/InkTrailLogo';
import NotebookHero3D from '../components/landing/NotebookHero3D';
import BeforeAfterSlider from '../components/landing/BeforeAfterSlider';
import TiltCard from '../components/landing/TiltCard';
import { useStore } from '../lib/store';
import type { PaperMaterial } from '../types';

// Interactive Sandbox Presets
const SANDBOX_PRESETS = [
    {
        title: "Physics Lab Record",
        subject: "Physics",
        text: "Aim: To verify Ohm's Law and determine the unknown resistance of a metallic conductor.\nFormula: V = I × R (where R is the slope of the V-I characteristic curve).\nObservation: Current increases linearly with voltage across all 5 trial steps (2V to 10V). Mean measured resistance R = 4.82 Ω with < 0.8% standard deviation.",
        font: "Caveat, cursive",
        ink: "#1e3a8a", // Royal Blue
    },
    {
        title: "Computer Science Assignment",
        subject: "CS & Engineering",
        text: "Question 2: Explain Pipelining and Data Hazards in RISC-V Architecture.\nAnswer: Pipelining overlaps instruction execution across five stages: IF, ID, EX, MEM, and WB. Data hazards occur when instructions depend on the result of a previous uncompleted instruction. These are resolved using data forwarding or pipeline stalls.",
        font: "Indie Flower, cursive",
        ink: "#0f172a", // Ballpoint Black
    },
    {
        title: "Chemistry Observation",
        subject: "Chemistry",
        text: "Procedure: Pipette out 20.0 mL of standard 0.05 M oxalic acid into a conical flask. Add one test tube of dilute H2SO4 to acidify. Heat the mixture gently to 60°C and titrate against potassium permanganate solution until a permanent pale pink color is observed.",
        font: "Cedarville Cursive, cursive",
        ink: "#0284c7", // Gel Pen Blue
    },
    {
        title: "Calculus Theorem",
        subject: "Mathematics",
        text: "Theorem: The Fundamental Theorem of Calculus links differentiation and integration.\nPart 1: If f is continuous on [a,b], then g(x) = ∫[a,x] f(t) dt is continuous on [a,b] and differentiable on (a,b), with g'(x) = f(x).\nPart 2: ∫[a,b] f(x) dx = F(b) - F(a), where F'(x) = f(x).",
        font: "Playfair Display, serif",
        ink: "#4c1d95", // Deep Violet
    }
];

// Curated Paper Textures
const PAPER_SHOWCASE: {
    id: PaperMaterial;
    name: string;
    desc: string;
    lines: 'ruled' | 'lab' | 'graph' | 'parchment' | 'dotted' | 'ruled-yellow';
    badge: string;
}[] = [
    {
        id: 'ruled',
        name: 'Classmate 30-Line Ruled',
        desc: 'Standard Indian student ruled notebook with pink margin line.',
        lines: 'ruled',
        badge: 'Most Popular',
    },
    {
        id: 'youva-spiral',
        name: 'Dual-Page Practical Record',
        desc: 'Facing blank diagram sheet on left, ruled theory notes on right.',
        lines: 'lab',
        badge: 'Lab Mode',
    },
    {
        id: 'graph',
        name: 'Millimeter Engineering Graph',
        desc: 'Precision cyan grid for circuit diagrams, Fourier plots & math.',
        lines: 'graph',
        badge: 'Engineering',
    },
    {
        id: 'vintage',
        name: 'Vintage 180-GSM Parchment',
        desc: 'Warm textured grain for historical essays and humanities assignments.',
        lines: 'parchment',
        badge: 'Textured',
    },
    {
        id: 'dotted',
        name: 'Dotted Bullet Journal',
        desc: 'Subtle 5mm dot grid for neat sketches, formulas & flowcharts.',
        lines: 'dotted',
        badge: 'Minimal',
    },
    {
        id: 'college',
        name: 'Legal Examination Pad',
        desc: 'Canary yellow ruled sheets with wide left margin for annotations.',
        lines: 'ruled-yellow',
        badge: 'Exam Mode',
    }
];

// Frequently Asked Questions
const FAQ_ITEMS = [
    {
        q: "Will my professor or instructor know this is computer-generated?",
        a: "InkTrail is engineered specifically to eliminate mechanical font uniformity. Every single letter has natural stroke-width variations, micro-slant baseline jitter, realistic pen ink bleeding, and deliberate handwritten scratch-outs. When printed on physical A4 paper, it looks indistinguishable from real handwriting."
    },
    {
        q: "Is InkTrail really 100% free during the public beta?",
        a: "Yes! Every single feature — unlimited 4K PDF exports, metallic spiral coils, all 15+ student paper types, and the interactive lab diagram canvas — is completely free. There are zero paywalls and zero credit card requirements."
    },
    {
        q: "How does the Lab Notebook / Mixed Page mode work?",
        a: "In Lab Notebook mode, facing pages are automatically paired: the left page is blank (or millimeter graph) for circuit schematics, biology diagrams, and graphs, while the right page is lined for procedure, theory, and observations. Both are exported together in sequence."
    },
    {
        q: "Are my assignments and private notes stored on external servers?",
        a: "By default, InkTrail processes all text-to-handwriting generation and PDF exports 100% locally in your browser memory. Your text never leaves your device unless you opt into Supabase Cloud Sync."
    },
    {
        q: "Can I use custom fonts or add my own handwriting?",
        a: "Yes! InkTrail comes preloaded with over 30 authentic Indian and international student handwriting styles (from neat cursive to rushed ballpoint scribble), and supports uploading custom TTF/WOFF font files."
    }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const setText = useStore(state => state.setText);
    const setPaperMaterial = useStore(state => state.setPaperMaterial);

    // Parallax Scroll Tracking
    const { scrollYProgress } = useScroll();
    const yHeroNotebook = useTransform(scrollYProgress, [0, 0.4], [0, 80]);
    const yHeroContent = useTransform(scrollYProgress, [0, 0.4], [0, -25]);
    const yFloatingCard1 = useTransform(scrollYProgress, [0, 0.4], [0, -120]);
    const yFloatingCard2 = useTransform(scrollYProgress, [0, 0.4], [0, -170]);
    const rotateCard1 = useTransform(scrollYProgress, [0, 0.4], [-3, 10]);
    const rotateCard2 = useTransform(scrollYProgress, [0, 0.4], [4, -12]);
    const yBgBlooms = useTransform(scrollYProgress, [0, 1], [0, 200]);

    // Subtle Interactive Mouse Parallax in Hero
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
        setMouseOffset({ x, y });
    };

    // Interactive Sandbox State
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [sandboxText, setSandboxText] = useState(SANDBOX_PRESETS[0].text);
    const [activeInk, setActiveInk] = useState(SANDBOX_PRESETS[0].ink);
    const [activeFont, setActiveFont] = useState(SANDBOX_PRESETS[0].font);
    const [activeJitter, setActiveJitter] = useState(true);
    const [activeMargin, setActiveMargin] = useState(true);

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleLoadPreset = (idx: number) => {
        setSelectedPreset(idx);
        setSandboxText(SANDBOX_PRESETS[idx].text);
        setActiveInk(SANDBOX_PRESETS[idx].ink);
        setActiveFont(SANDBOX_PRESETS[idx].font);
    };

    const handleTransferToStudio = () => {
        setText(sandboxText);
        navigate('/editor');
    };

    const handleSelectPaperAndLaunch = (paperId: PaperMaterial) => {
        setPaperMaterial(paperId);
        navigate('/editor');
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] text-stone-900 selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden font-sans relative">

            {/* Architectural Warm Paper Dot Grid */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-40 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 0.8px, transparent 0.8px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Parallax Ambient Light Blooms */}
            <motion.div 
                style={{ y: yBgBlooms }} 
                className="pointer-events-none -z-10 absolute inset-0 overflow-hidden"
            >
                <div className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1100px] h-[550px] bg-gradient-to-tr from-violet-200/25 via-indigo-100/30 to-amber-100/35 rounded-full blur-[140px]" />
                <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-100/30 rounded-full blur-[120px]" />
            </motion.div>

            {/* =========================================================
                1. TOP STATUS TICKER (Clean & Confident)
            ========================================================= */}
            <div className="relative z-40 bg-gradient-to-r from-violet-50/90 via-indigo-50/80 to-purple-50/90 border-b border-violet-200/60 backdrop-blur-md text-stone-800 py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="tracking-wide">
                    <b className="text-violet-950 font-extrabold uppercase">InkTrail 2.4:</b> Turn typed assignments into authentic handwritten pages in seconds · <b className="text-emerald-700">100% Free for Students</b>.
                </span>
                <Link to="/editor" className="hidden sm:inline-flex items-center gap-1 ml-2 text-violet-700 hover:text-violet-950 underline font-bold transition-colors">
                    <span>Open Studio</span>
                    <ArrowRight size={13} />
                </Link>
            </div>

            {/* =========================================================
                2. IMMERSIVE HERO STAGE (Open Dual-Page Spiral & Parallax)
            ========================================================= */}
            <section 
                onMouseMove={handleHeroMouseMove}
                className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
                    
                    {/* Left Column: Dramatic Editorial Copy with Parallax */}
                    <motion.div 
                        style={{ y: yHeroContent }}
                        className="lg:col-span-5 text-left space-y-6 z-10"
                    >
                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-200/90 backdrop-blur-xl text-xs font-mono text-violet-700 shadow-xs"
                        >
                            <InkTrailLogo size={18} />
                            <span className="font-bold tracking-wider uppercase">Assignment Studio</span>
                            <span className="text-stone-300">|</span>
                            <span className="text-stone-800 font-sans font-bold flex items-center gap-1">
                                <ShieldCheck size={13} className="text-emerald-600" />
                                Zero Watermarks
                            </span>
                        </motion.div>

                        {/* Grand Display Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-6xl lg:text-6.5xl font-black tracking-tight leading-[1.05] text-stone-950 font-display"
                        >
                            Turn Typed Text Into{' '}
                            <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent italic font-serif">
                                Real Handwriting.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-normal"
                        >
                            Stop wasting hours copying lab records and assignments by hand. Paste your text, choose authentic Indian student ruled registers, and download print-ready 4K PDFs in seconds.
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
                        >
                            <Link
                                to="/editor"
                                className="px-7 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-violet-600/25 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                            >
                                <Sparkles size={18} className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                                <span>Launch Studio (100% Free)</span>
                                <ArrowRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a
                                href="#live-sandbox"
                                className="px-6 py-4 bg-white hover:bg-stone-50 border border-stone-300/90 text-stone-800 rounded-2xl font-bold text-sm sm:text-base shadow-xs hover:border-stone-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <MousePointerClick size={18} className="text-violet-600" />
                                <span>Try Interactive Sandbox</span>
                            </a>
                        </motion.div>

                        {/* Live Ink Swatch Micro-Widget */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-4 flex items-center gap-3 border-t border-stone-200/80 text-xs text-stone-500"
                        >
                            <span className="font-mono text-[11px] uppercase tracking-wider text-stone-600 font-bold">Authentic Ink:</span>
                            <div className="flex items-center gap-2">
                                {[
                                    { name: 'Royal Blue', color: '#1e3a8a' },
                                    { name: 'Ballpoint Black', color: '#0f172a' },
                                    { name: 'Gel Cyan', color: '#0284c7' },
                                    { name: 'Walnut Sepia', color: '#4c1d95' }
                                ].map(ink => (
                                    <button
                                        key={ink.name}
                                        type="button"
                                        onClick={() => setActiveInk(ink.color)}
                                        className={`w-5 h-5 rounded-full border border-stone-300 transition-all hover:scale-125 focus:outline-none cursor-pointer ${
                                            activeInk === ink.color ? 'ring-2 ring-violet-500 ring-offset-2 scale-110' : ''
                                        }`}
                                        style={{ backgroundColor: ink.color }}
                                        title={ink.name}
                                    />
                                ))}
                            </div>
                            <span className="text-[11px] text-emerald-700 font-mono ml-auto font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                4K Vector Ready
                            </span>
                        </motion.div>

                        {/* Verified Credibility Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                            <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs">
                                <p className="text-lg font-black text-stone-900">200+</p>
                                <p className="text-[11px] text-stone-500 font-semibold">Universities</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs">
                                <p className="text-lg font-black text-emerald-600">0%</p>
                                <p className="text-[11px] text-stone-500 font-semibold">AI Watermark</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs">
                                <p className="text-lg font-black text-violet-700">15+</p>
                                <p className="text-[11px] text-stone-500 font-semibold">Paper Formats</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Uncaged Open Dual-Page Spiral Notebook with Parallax Floating Notes */}
                    <div className="lg:col-span-7 relative flex items-center justify-center">
                        
                        {/* Parallax Floating Note 1: Yellow Post-it Scrap */}
                        <motion.div
                            style={{ y: yFloatingCard1, rotate: rotateCard1 }}
                            animate={{ x: mouseOffset.x * -0.6, y: mouseOffset.y * -0.6 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="hidden sm:flex absolute -top-2 right-4 lg:right-8 z-30 items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FEF08A] text-amber-950 font-display font-bold text-xs shadow-xl shadow-amber-900/10 border border-yellow-300 select-none pointer-events-none"
                        >
                            <span className="text-emerald-700 font-black">✓</span>
                            <span>Lab Record #04 · Verified (10/10)</span>
                        </motion.div>

                        {/* Parallax Floating Note 2: Circuit Formula Badge */}
                        <motion.div
                            style={{ y: yFloatingCard2, rotate: rotateCard2 }}
                            animate={{ x: mouseOffset.x * 0.5, y: mouseOffset.y * 0.5 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="hidden md:flex absolute top-10 -left-2 lg:left-2 z-30 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-stone-800 font-mono text-xs shadow-lg border border-stone-200/90 select-none pointer-events-none"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span>V = I · R &nbsp;(Slope = 4.82 Ω)</span>
                        </motion.div>

                        {/* Parallax Floating Note 3: Dual-page practical label */}
                        <motion.div
                            animate={{ x: mouseOffset.x * -0.4, y: mouseOffset.y * -0.4 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="hidden lg:flex absolute bottom-4 left-6 z-30 items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-stone-700 text-xs shadow-md border border-stone-200/90 select-none pointer-events-none font-medium"
                        >
                            <span className="text-violet-600 font-bold">●</span>
                            <span>Facing Diagram & Write-up</span>
                        </motion.div>

                        {/* Uncaged 3D Notebook Canvas (No Box Frame, Free Floating) */}
                        <motion.div 
                            style={{ y: yHeroNotebook }}
                            className="w-full relative cursor-grab active:cursor-grabbing"
                        >
                            <NotebookHero3D />
                        </motion.div>
                    </div>

                </div>
            </section>

            {/* =========================================================
                3. BEFORE/AFTER COMPARISON SECTION
            ========================================================= */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto relative">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Eye size={12} className="text-violet-600" />
                        <span>The Realism Difference</span>
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-display">
                        Compare Handwriting in Real-Time
                    </h2>
                    <p className="text-stone-600 text-sm mt-2">
                        Slide horizontally to inspect how organic ink flow, line pressure, and natural slant variations compare to rigid computer fonts.
                    </p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl border border-stone-200/90 p-3 sm:p-6 bg-white shadow-xl shadow-stone-200/50"
                >
                    <BeforeAfterSlider />
                </motion.div>
            </section>

            {/* =========================================================
                4. LIVE INTERACTIVE STUDIO SANDBOX
            ========================================================= */}
            <section id="live-sandbox" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
                <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-xl shadow-stone-200/50"
                >
                    {/* Sandbox Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-stone-200/80">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-mono font-bold mb-2">
                                <PenTool size={13} className="text-violet-600" />
                                <span>Interactive Sandbox</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                                Test Your Own Text Right Here
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-600 mt-1">
                                Type or pick an assignment preset below to watch InkTrail render authentic handwriting in real time.
                            </p>
                        </div>

                        {/* Preset Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {SANDBOX_PRESETS.map((preset, idx) => (
                                <button
                                    key={preset.title}
                                    type="button"
                                    onClick={() => handleLoadPreset(idx)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedPreset === idx
                                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                                    }`}
                                >
                                    {preset.subject}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sandbox Split Interface */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
                        
                        {/* Left: Input Textarea & Controls */}
                        <div className="lg:col-span-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2 font-mono">
                                    Input Text (Type or Paste)
                                </label>
                                <textarea
                                    value={sandboxText}
                                    onChange={(e) => setSandboxText(e.target.value)}
                                    rows={8}
                                    className="w-full p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 focus:border-violet-500 focus:bg-white focus:outline-none text-stone-900 text-xs font-mono leading-relaxed resize-none shadow-inner"
                                    placeholder="Type anything here..."
                                />
                            </div>

                            {/* Control Toggles */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveJitter(!activeJitter)}
                                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                        activeJitter 
                                            ? 'bg-violet-50 border-violet-300 text-violet-800' 
                                            : 'bg-stone-100 border-stone-200 text-stone-500'
                                    }`}
                                >
                                    <span>Motor Jitter</span>
                                    <span className={`w-2 h-2 rounded-full ${activeJitter ? 'bg-violet-600' : 'bg-stone-400'}`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveMargin(!activeMargin)}
                                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                        activeMargin 
                                            ? 'bg-cyan-50 border-cyan-300 text-cyan-800' 
                                            : 'bg-stone-100 border-stone-200 text-stone-500'
                                    }`}
                                >
                                    <span>Margin Rules</span>
                                    <span className={`w-2 h-2 rounded-full ${activeMargin ? 'bg-cyan-600' : 'bg-stone-400'}`} />
                                </button>
                            </div>

                            {/* CTAs */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleTransferToStudio}
                                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                                >
                                    <Sparkles size={15} className="text-yellow-300" />
                                    <span>Transfer to Full Studio & Export PDF</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Real-time Paper Canvas Preview */}
                        <div className="lg:col-span-7">
                            <div className="relative rounded-2xl bg-[#fdfbf7] p-8 sm:p-10 shadow-md min-h-[380px] sm:min-h-[420px] text-neutral-900 overflow-hidden border border-stone-300">
                                
                                {/* Margin double red line */}
                                {activeMargin && (
                                    <>
                                        <div className="absolute top-0 bottom-0 left-12 sm:left-16 w-[2px] bg-red-400 opacity-60 pointer-events-none" />
                                        <div className="absolute top-0 bottom-0 left-[51px] sm:left-[67px] w-[1px] bg-red-300 opacity-40 pointer-events-none" />
                                    </>
                                )}

                                {/* Blue ruled lines */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-40"
                                    style={{
                                        backgroundImage: 'linear-gradient(to bottom, transparent 31px, #93c5fd 32px)',
                                        backgroundSize: '100% 32px',
                                    }}
                                />

                                {/* Top Date & Page header */}
                                <div className="relative z-10 flex items-center justify-between pl-8 pb-3 border-b border-rose-200/60 text-[11px] font-mono text-neutral-400 mb-4">
                                    <span>PAGE: 01</span>
                                    <span>DATE: 12 / 09 / 2026</span>
                                </div>

                                {/* Handwritten text render */}
                                <div
                                    style={{
                                        fontFamily: activeFont,
                                        color: activeInk,
                                        lineHeight: '32px',
                                        transform: activeJitter ? 'rotate(-0.25deg)' : 'none',
                                    }}
                                    className="relative z-10 pl-8 text-lg sm:text-xl font-normal whitespace-pre-wrap leading-[32px] select-none"
                                >
                                    {sandboxText}
                                </div>

                                {/* Simulated ink stamp bottom watermark */}
                                <div className="relative z-10 pl-8 pt-8 flex items-center justify-between text-[10px] text-neutral-400 font-mono border-t border-neutral-200/50 mt-6">
                                    <span>Classmate 180-GSM Ruled Paper</span>
                                    <span className="text-emerald-700 font-bold">Organic Micro-Jitter Active</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </section>

            {/* =========================================================
                5. CURATED STUDENT PAPER TEXTURES (Bento Matrix)
            ========================================================= */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <BookOpen size={12} className="text-violet-600" />
                        <span>The Paper Vault</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-display">
                        15+ Authentic Student Registers
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base mt-2">
                        From standard Indian university ruled sheets to dual-page lab records and millimeter engineering graph papers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PAPER_SHOWCASE.map((paper) => (
                        <TiltCard key={paper.id} className="h-full">
                            <div className="h-full p-6 rounded-3xl bg-white hover:bg-stone-50/50 border border-stone-200/90 hover:border-violet-400/60 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-200">
                                            {paper.badge}
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 group-hover:text-white group-hover:bg-violet-600 transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>

                                    {/* Paper Pattern Preview Swatch */}
                                    <div className="h-24 w-full rounded-2xl border border-stone-200/80 mb-4 overflow-hidden relative shadow-2xs">
                                        {paper.lines === 'ruled' && (
                                            <div className="w-full h-full bg-[#fdfbf7] p-3">
                                                <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-red-400 opacity-60" />
                                                <div
                                                    className="w-full h-full opacity-40"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to bottom, transparent 15px, #93c5fd 16px)',
                                                        backgroundSize: '100% 16px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {paper.lines === 'lab' && (
                                            <div className="w-full h-full grid grid-cols-2 divide-x divide-stone-200 bg-[#fdfbf7]">
                                                <div className="p-2 flex items-center justify-center bg-stone-50/50">
                                                    <span className="text-[9px] font-mono text-stone-400 font-bold">BLANK DIAGRAM</span>
                                                </div>
                                                <div
                                                    className="w-full h-full opacity-40 p-2"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to bottom, transparent 11px, #93c5fd 12px)',
                                                        backgroundSize: '100% 12px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {paper.lines === 'graph' && (
                                            <div
                                                className="w-full h-full bg-[#f0f9ff] opacity-75"
                                                style={{
                                                    backgroundImage: 'linear-gradient(to right, #bae6fd 1px, transparent 1px), linear-gradient(to bottom, #bae6fd 1px, transparent 1px)',
                                                    backgroundSize: '12px 12px',
                                                }}
                                            />
                                        )}
                                        {paper.lines === 'parchment' && (
                                            <div className="w-full h-full bg-[#fef3c7]/40 border-stone-200 flex items-center justify-center">
                                                <span className="text-[10px] font-serif text-amber-800/60 italic font-semibold">180 GSM Warm Parchment</span>
                                            </div>
                                        )}
                                        {paper.lines === 'dotted' && (
                                            <div
                                                className="w-full h-full bg-[#fafaf9]"
                                                style={{
                                                    backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)',
                                                    backgroundSize: '12px 12px',
                                                }}
                                            />
                                        )}
                                        {paper.lines === 'ruled-yellow' && (
                                            <div className="w-full h-full bg-[#fef9c3]/60 p-3">
                                                <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-red-400 opacity-60" />
                                                <div
                                                    className="w-full h-full opacity-40"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to bottom, transparent 15px, #d97706 16px)',
                                                        backgroundSize: '100% 16px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="text-lg font-bold text-stone-900 mb-1.5">{paper.name}</h4>
                                    <p className="text-xs text-stone-600 leading-relaxed">{paper.desc}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPaperAndLaunch(paper.id)}
                                        className="text-xs font-bold text-violet-700 group-hover:text-violet-800 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Open in Studio</span>
                                        <ArrowRight size={12} />
                                    </button>
                                    <span className="text-[10px] font-mono text-stone-400">Vector Print Ready</span>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* =========================================================
                6. AUTHENTICITY FEATURES BENTO GRID
            ========================================================= */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Zap size={12} className="text-amber-600" />
                        <span>Core Capabilities</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-display">
                        Crafted for Real Paper Authenticity
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base mt-2">
                        Every small detail of physical pens and paper, recreated with care.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Card 1: Smartphone Camera Perspective */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6">
                                <Camera size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Smartphone Perspective & Cast Shadows</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Simulates taking a photo with a mobile camera. Adds subtle corner tilt, lens depth, and authentic phone silhouette cast shadows.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-indigo-600 font-semibold">
                            Natural optical depth
                        </div>
                    </div>

                    {/* Card 2: Lab Notebook Diagram Canvas */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-6">
                                <FlaskConical size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Lab Record & Diagram Workbench</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Facing-sheet mode with integrated drawing canvas. Sketch circuit diagrams, chemical apparatus, and charts directly onto blank pages before PDF compilation.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-cyan-600 font-semibold">
                            Dual-page practical mode
                        </div>
                    </div>

                    {/* Card 3: Natural Human Inconsistency */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-6">
                                <Flame size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Natural Human Inconsistency</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Real handwriting has personality. InkTrail adds realistic baseline drift, pen pressure variations, and natural ink absorption that looks completely organic.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-purple-600 font-semibold">
                            Organic pen physics
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================================
                7. FREQUENTLY ASKED QUESTIONS (Accordion)
            ========================================================= */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-display">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-stone-600 text-sm mt-2">
                        Everything you need to know about InkTrail, authenticity, and student export rights.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {FAQ_ITEMS.map((item, idx) => (
                        <div
                            key={item.q}
                            className="rounded-2xl border border-stone-200/90 bg-white shadow-2xs overflow-hidden transition-colors"
                        >
                            <button
                                type="button"
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-stone-900 text-base cursor-pointer hover:bg-stone-50/60"
                            >
                                <span>{item.q}</span>
                                <ChevronDown
                                    size={18}
                                    className={`text-stone-400 transition-transform ${openFaq === idx ? 'rotate-180 text-violet-600' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-5 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
                                            {item.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================================
                8. CALL-TO-ACTION PORTAL
            ========================================================= */}
            <section className="py-20 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-950 via-slate-900 to-indigo-950 border border-stone-800 p-10 sm:p-16 text-center shadow-2xl text-white">
                    <div className="absolute inset-0 bg-radial-[circle_at_50%_0%_rgba(139,92,246,0.25)_0%,transparent_70%] pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold font-mono">
                            <Sparkles size={13} className="text-amber-400" />
                            <span>ZERO COST · PUBLIC BETA</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                            Start Creating Handwritten Assignments in Seconds.
                        </h2>

                        <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                            No download, no credit card. Join students at over 200+ universities saving hours every week.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/editor"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-stone-950 hover:bg-stone-100 rounded-2xl font-bold text-base shadow-xl hover:scale-103 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles size={18} className="text-violet-600" />
                                <span>Open Studio Now — It's Free</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
