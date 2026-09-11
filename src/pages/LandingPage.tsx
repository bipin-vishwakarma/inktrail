import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, BookOpen, Zap, 
    ChevronDown, Camera, Flame, MousePointerClick,
    FlaskConical, Eye, PenTool
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
// Curated Paper Textures
const PAPER_SHOWCASE: {
    id: PaperMaterial;
    name: string;
    desc: string;
    color: string;
    lines: string;
    badge: string;
}[] = [
    {
        id: 'ruled',
        name: 'Classmate 30-Line Ruled',
        desc: 'Standard Indian student ruled notebook with pink margin line.',
        color: 'from-blue-50 to-indigo-50/50',
        lines: 'ruled',
        badge: 'Most Popular',
    },
    {
        id: 'youva-spiral',
        name: 'Dual-Page Practical Record',
        desc: 'Facing blank diagram sheet on left, ruled theory notes on right.',
        color: 'from-violet-50 to-purple-50/50',
        lines: 'lab',
        badge: 'Lab Mode',
    },
    {
        id: 'graph',
        name: 'Millimeter Engineering Graph',
        desc: 'Precision cyan grid for circuit diagrams, Fourier plots & math.',
        color: 'from-cyan-50 to-sky-50/50',
        lines: 'graph',
        badge: 'Engineering',
    },
    {
        id: 'vintage',
        name: 'Vintage 180-GSM Parchment',
        desc: 'Warm textured grain for historical essays and humanities assignments.',
        color: 'from-amber-50 to-orange-50/50',
        lines: 'parchment',
        badge: 'Textured',
    },
    {
        id: 'dotted',
        name: 'Dotted Bullet Journal',
        desc: 'Subtle 5mm dot grid for neat sketches, formulas & flowcharts.',
        color: 'from-stone-50 to-neutral-50',
        lines: 'dotted',
        badge: 'Minimal',
    },
    {
        id: 'college',
        name: 'Legal Examination Pad',
        desc: 'Canary yellow ruled sheets with wide left margin for annotations.',
        color: 'from-yellow-50 to-amber-50/40',
        lines: 'ruled-yellow',
        badge: 'Exam Mode',
    }
];

// Frequently Asked Questions
const FAQ_ITEMS = [
    {
        q: "Will my professor or instructor know this is computer-generated?",
        a: "InkTrail is engineered specifically to eliminate mechanical font uniformity. Every single letter has algorithmic stroke-width variations, micro-slant baseline jitter, realistic pen ink bleeding, and deliberate handwritten scratch-outs. When printed on physical A4 paper, it looks indistinguishable from real handwriting."
    },
    {
        q: "Is InkTrail really 100% free during the public beta?",
        a: "Yes! Every single feature — unlimited 4K PDF exports, 3D metallic spiral coils, all 15+ student paper types, and the interactive lab diagram canvas — is completely free. There are zero paywalls and zero credit card requirements."
    },
    {
        q: "How does the Lab Notebook / Mixed Page mode work?",
        a: "In Lab Notebook mode, facing pages are automatically paired: the left page is blank (or millimeter graph) for circuit schematics, biology diagrams, and graphs, while the right page is lined for procedure, theory, and observations. Both are exported together in sequence."
    },
    {
        q: "Are my assignments and private notes stored on external servers?",
        a: "By default, InkTrail processes all text-to-handwriting generation and PDF exports 100% locally in your browser memory using client-side WebGL and canvas rendering. Your text never leaves your device unless you opt into Supabase Cloud Sync."
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
        <div className="min-h-screen bg-[#090A10] text-neutral-100 selection:bg-violet-500/30 overflow-x-hidden font-sans">

            {/* =========================================================
                1. TOP STATUS TICKER (Awwwards-style Luminous Banner)
            ========================================================= */}
            <div className="relative z-50 bg-gradient-to-r from-violet-900/90 via-indigo-900/90 to-purple-950/90 border-b border-white/10 backdrop-blur-md text-white py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide">
                    <b className="text-emerald-300 font-extrabold uppercase">InkTrail Studio v2.4 Live:</b> Real Three.js 3D physics, authentic motor jitter & lab diagrams are <b>100% Free for Students</b>.
                </span>
                <Link to="/editor" className="hidden sm:inline-flex items-center gap-1 ml-2 text-violet-300 hover:text-white underline font-bold transition-colors">
                    <span>Open Studio</span>
                    <ArrowRight size={13} />
                </Link>
            </div>

            {/* =========================================================
                2. HERO STAGE (Cinematic 3D WebGL Realm)
            ========================================================= */}
            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
                {/* Volumetric Radial Light Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[1000px] h-[550px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/20 to-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
                <div className="absolute top-1/3 right-4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                    
                    {/* Left Column: Dramatic Editorial Copy */}
                    <div className="lg:col-span-6 text-left space-y-6 z-10">
                        {/* Technical Telemetry Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl text-xs font-mono text-violet-300 shadow-xl"
                        >
                            <InkTrailLogo size={16} />
                            <span className="font-bold tracking-wider uppercase">3D Physics Simulation Engine</span>
                            <span className="text-white/30">|</span>
                            <span className="text-white/80 font-sans font-bold">Zero Watermarks</span>
                        </motion.div>

                        {/* Grand Display Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white"
                        >
                            Turn Typed Text Into{' '}
                            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent italic font-serif">
                                Real Handwriting.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl font-normal"
                        >
                            Stop wasting hours manually copying lab records and assignments. Paste your text, choose authentic Indian student ruled registers, and download print-ready 4K PDFs in seconds.
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
                                className="px-7 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-violet-600/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                            >
                                <Sparkles size={18} className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                                <span>Launch Studio (100% Free)</span>
                                <ArrowRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a
                                href="#live-sandbox"
                                className="px-6 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-200 rounded-2xl font-bold text-sm sm:text-base backdrop-blur-md hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <MousePointerClick size={18} className="text-violet-400" />
                                <span>Try Interactive Sandbox</span>
                            </a>
                        </motion.div>

                        {/* Live Ink Swatch Micro-Widget */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-4 flex items-center gap-3 border-t border-white/10 text-xs text-neutral-400"
                        >
                            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">Authentic Ink:</span>
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
                                        className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 focus:outline-none"
                                        style={{ backgroundColor: ink.color }}
                                        title={ink.name}
                                    />
                                ))}
                            </div>
                            <span className="text-[11px] text-emerald-400 font-mono ml-auto">
                                ● 4K Vector Ready
                            </span>
                        </motion.div>

                        {/* Verified Credibility Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-lg font-black text-white">200+</p>
                                <p className="text-[10px] text-neutral-400 font-medium">Universities</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-lg font-black text-emerald-400">0%</p>
                                <p className="text-[10px] text-neutral-400 font-medium">AI Watermark</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-lg font-black text-violet-400">15+</p>
                                <p className="text-[10px] text-neutral-400 font-medium">Paper Formats</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Three.js Interactive 3D Notebook Canvas */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl shadow-violet-950/40">
                            {/* Three.js Realtime Canvas */}
                            <NotebookHero3D />
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================================
                3. HYPERFRAME BEFORE/AFTER COMPARISON SECTION
            ========================================================= */}
            <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Eye size={12} className="text-violet-400" />
                        <span>HyperFrame Comparison Engine</span>
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        See The Human Touch in Real-Time
                    </h2>
                    <p className="text-neutral-400 text-sm mt-2">
                        Slide horizontally to inspect the difference between sterile mechanical fonts and InkTrail's organic ink bleeding, line pressure, and margin alignment.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 p-2 sm:p-4 bg-neutral-900/60 backdrop-blur-xl shadow-2xl">
                    <BeforeAfterSlider />
                </div>
            </section>

            {/* =========================================================
                4. LIVE INTERACTIVE STUDIO SANDBOX
            ========================================================= */}
            <section id="live-sandbox" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl shadow-violet-950/30">
                    
                    {/* Sandbox Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-2">
                                <PenTool size={13} className="text-cyan-400" />
                                <span>Live Interactive Handwriting Studio</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white">
                                Test Your Own Text Right Here
                            </h3>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
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
                                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                                            : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1] border border-white/5'
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
                                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2 font-mono">
                                    Input Text (Type or Paste)
                                </label>
                                <textarea
                                    value={sandboxText}
                                    onChange={(e) => setSandboxText(e.target.value)}
                                    rows={8}
                                    className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 focus:border-violet-500 focus:outline-none text-white text-xs font-mono leading-relaxed resize-none shadow-inner"
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
                                            ? 'bg-violet-600/20 border-violet-500/50 text-violet-200' 
                                            : 'bg-white/[0.03] border-white/5 text-neutral-400'
                                    }`}
                                >
                                    <span>Motor Jitter</span>
                                    <span className={`w-2 h-2 rounded-full ${activeJitter ? 'bg-violet-400' : 'bg-neutral-600'}`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveMargin(!activeMargin)}
                                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                        activeMargin 
                                            ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200' 
                                            : 'bg-white/[0.03] border-white/5 text-neutral-400'
                                    }`}
                                >
                                    <span>Margin Rules</span>
                                    <span className={`w-2 h-2 rounded-full ${activeMargin ? 'bg-cyan-400' : 'bg-neutral-600'}`} />
                                </button>
                            </div>

                            {/* CTAs */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleTransferToStudio}
                                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                                >
                                    <Sparkles size={15} className="text-yellow-300" />
                                    <span>Transfer to Full Studio & Export PDF</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Real-time Paper Canvas Preview */}
                        <div className="lg:col-span-7">
                            <div className="relative rounded-2xl bg-[#fdfbf7] p-8 sm:p-10 shadow-2xl min-h-[380px] sm:min-h-[420px] text-neutral-900 overflow-hidden border border-stone-300">
                                
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
                                    <span className="text-emerald-600 font-bold">100% Organic Micro-Jitter</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================
                5. CURATED STUDENT PAPER TEXTURES (Bento Matrix)
            ========================================================= */}
            <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <BookOpen size={12} className="text-violet-400" />
                        <span>The University Vault</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        15+ Authentic Student Papers
                    </h2>
                    <p className="text-neutral-400 text-sm sm:text-base mt-2">
                        From standard Indian university ruled sheets to dual-page lab records and millimeter graph papers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PAPER_SHOWCASE.map((paper) => (
                        <TiltCard key={paper.id} className="h-full">
                            <div className="h-full p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[11px] font-bold border border-violet-500/30">
                                            {paper.badge}
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-violet-600 transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-1.5">{paper.name}</h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{paper.desc}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPaperAndLaunch(paper.id)}
                                        className="text-xs font-bold text-violet-400 group-hover:text-violet-300 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Open in Studio</span>
                                        <ArrowRight size={12} />
                                    </button>
                                    <span className="text-[10px] font-mono text-neutral-500">Vector Print Ready</span>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* =========================================================
                6. AWWWARDS FEATURE BENTO GRID
            ========================================================= */}
            <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Zap size={12} className="text-amber-400" />
                        <span>Architectural Features</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        Engineered for Flawless Realism
                    </h2>
                    <p className="text-neutral-400 text-sm sm:text-base mt-2">
                        Every small detail of physical paper and human handwriting, recreated mathematically.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Card 1: 3D Camera Physics */}
                    <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                                <Camera size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Smartphone Perspective & Cast Shadows</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                Simulates taking a real photo with a mobile camera. Adds subtle corner tilt, lens barrel curvature, and genuine smartphone silhouette cast shadows.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-indigo-400">
                            Depth-of-field simulation
                        </div>
                    </div>

                    {/* Card 2: Lab Notebook Diagram Canvas */}
                    <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                                <FlaskConical size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Lab Record & Diagram Workbench</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                Facing-sheet mode with integrated drawing canvas. Sketch circuit diagrams, chemical apparatus, and charts directly onto the blank page before PDF compilation.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-cyan-400">
                            Dual-page practical mode
                        </div>
                    </div>

                    {/* Card 3: Human Error Engine */}
                    <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                                <Flame size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Natural Human Flaws Engine</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                Real humans make mistakes. InkTrail injects realistic strike-throughs, caret additions, baseline drifts, and ink bleeding that bypasses mechanical inspection.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-purple-400">
                            Authentic flaw synthesis
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================================
                7. FREQUENTLY ASKED QUESTIONS (Accordion)
            ========================================================= */}
            <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-neutral-400 text-sm mt-2">
                        Everything you need to know about InkTrail, authenticity, and student export rights.
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, idx) => (
                        <div
                            key={item.q}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors"
                        >
                            <button
                                type="button"
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-base cursor-pointer hover:bg-white/[0.02]"
                            >
                                <span>{item.q}</span>
                                <ChevronDown
                                    size={18}
                                    className={`text-neutral-400 transition-transform ${openFaq === idx ? 'rotate-180 text-violet-400' : ''}`}
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
                                        <p className="px-5 pb-5 text-neutral-400 text-sm leading-relaxed border-t border-white/5 pt-3">
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
                8. GRAND FINALE CALL-TO-ACTION PORTAL
            ========================================================= */}
            <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-950/80 via-indigo-950/80 to-purple-950/90 border border-violet-500/30 p-10 sm:p-16 text-center shadow-2xl">
                    <div className="absolute inset-0 bg-radial-[circle_at_50%_0%_rgba(139,92,246,0.3)_0%,transparent_70%] pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold font-mono">
                            <Sparkles size={13} className="text-yellow-400" />
                            <span>ZERO COST · PUBLIC BETA PASS</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Start Creating Handwritten Assignments in Seconds.
                        </h2>

                        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                            No download, no credit card. Join students at over 200+ universities saving hours every week.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/editor"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-950 hover:bg-neutral-100 rounded-2xl font-bold text-base shadow-xl hover:scale-103 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
