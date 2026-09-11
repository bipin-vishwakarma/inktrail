import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, Check,
    BookOpen,
    Zap, ChevronDown, Camera,
    FileText, GraduationCap, Flame, MousePointerClick,
    FlaskConical
} from 'lucide-react';

// Preset sample texts for interactive hero sandbox
const SAMPLE_PROMPTS = [
    {
        title: "Physics Lab",
        text: "Aim: To verify Ohm's Law and determine the unknown resistance of a metallic wire.\nFormula: V = I * R\nObservation: As voltage increases steadily from 2V to 10V, current scales in direct proportion.",
        font: "Caveat, cursive",
        paper: "bg-[#fdfbf7] border-b border-blue-200",
        color: "#1e3a8a" // Royal Blue Ink
    },
    {
        title: "Assignment Theory",
        text: "Newton's Second Law states that the acceleration of an object is directly dependent upon two variables: the net force acting upon the object and the mass of the object.",
        font: "Indie Flower, cursive",
        paper: "bg-[#fffdfa] border-b border-indigo-200",
        color: "#0f172a" // Ballpoint Black
    },
    {
        title: "Chemistry Practical",
        text: "Procedure: Pipette out 20ml of oxalic acid into a conical flask. Add one test tube of dilute H2SO4. Heat the solution to 60°C and titrate against KMnO4 until permanent pale pink.",
        font: "Cedarville Cursive, cursive",
        paper: "bg-[#fbf9f4] border-b border-cyan-200",
        color: "#0369a1" // Gel Pen Blue
    }
];

export default function LandingPage() {
    const navigate = useNavigate();

    // Interactive Hero State
    const [selectedSample, setSelectedSample] = useState(0);
    const [customText, setCustomText] = useState(SAMPLE_PROMPTS[0].text);
    const [activeInk, setActiveInk] = useState('#1e3a8a');
    const [activeJitter, setActiveJitter] = useState(true);
    const [faqOpen, setFaqOpen] = useState<number | null>(0);

    const activeSample = SAMPLE_PROMPTS[selectedSample];

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50 text-neutral-900 selection:bg-violet-500/20 overflow-x-hidden">

            {/* =========================================================
                1. TOP ANNOUNCEMENT TICKER (High Converting Beta Banner)
            ========================================================= */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white py-2 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 relative z-50">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                </span>
                <span>🔥 Public Beta Live: All Pro features, 3D spirals & lab diagram modes are <b>100% FREE</b> for students!</span>
                <Link to="/editor" className="underline font-bold hover:text-yellow-200 transition-colors ml-1 hidden sm:inline">
                    Try it now →
                </Link>
            </div>

            {/* =========================================================
                2. HERO SECTION
            ========================================================= */}
            <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto">
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-violet-200/40 via-indigo-100/30 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs sm:text-sm font-bold shadow-xs mb-6"
                    >
                        <GraduationCap size={16} className="text-violet-600" />
                        <span>Built for University Students · UPES Dehradun</span>
                        <span className="w-1 h-1 rounded-full bg-violet-400" />
                        <span className="text-violet-900 font-extrabold">Zero Watermarks</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-neutral-950 leading-[1.08] mb-6"
                    >
                        Turn Typed Text into <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent italic font-serif">
                            Real Handwriting.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-base sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-8 font-normal"
                    >
                        Stop copying lab manuals and assignments by hand. Paste your notes, choose authentic Indian student ruled sheets, and download high-res PDFs in seconds.
                    </motion.p>

                    {/* Primary CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
                    >
                        <Link
                            to="/editor"
                            className="w-full sm:w-auto px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-2xl font-bold text-base shadow-xl shadow-neutral-900/15 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 group"
                        >
                            <Sparkles size={18} className="text-yellow-400 group-hover:rotate-12 transition-transform" />
                            <span>Launch Studio (100% Free)</span>
                            <ArrowRight size={18} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <a
                            href="#live-demo"
                            className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-stone-50 border border-neutral-200 text-neutral-800 rounded-2xl font-bold text-base shadow-sm hover:border-neutral-300 transition-all flex items-center justify-center gap-2"
                        >
                            <MousePointerClick size={18} className="text-violet-600" />
                            <span>Interactive Preview</span>
                        </a>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-neutral-500 font-medium"
                    >
                        <span className="flex items-center gap-1.5">
                            <Check size={14} className="text-emerald-500 stroke-[3]" /> No Credit Card Required
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Check size={14} className="text-emerald-500 stroke-[3]" /> 15+ Ruled & Spiral Papers
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Check size={14} className="text-emerald-500 stroke-[3]" /> Direct 4K Multi-Page PDF
                        </span>
                    </motion.div>
                </div>

                {/* =========================================================
                    3. LIVE INTERACTIVE SANDBOX (Experience it right here)
                ========================================================= */}
                <div id="live-demo" className="scroll-mt-24 max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl border border-neutral-200/80 ring-1 ring-black/5 relative overflow-hidden">
                        
                        {/* Interactive Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-100">
                            <div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-violet-600 block mb-1">
                                    Interactive Sandbox
                                </span>
                                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                                    Test Live Handwriting Engine
                                </h2>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {SAMPLE_PROMPTS.map((p, idx) => (
                                    <button
                                        key={p.title}
                                        onClick={() => {
                                            setSelectedSample(idx);
                                            setCustomText(p.text);
                                            setActiveInk(p.color);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            selectedSample === idx
                                                ? 'bg-violet-600 text-white shadow-sm'
                                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                        }`}
                                    >
                                        {p.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sandbox Grid: Left input, Right handwritten notebook */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                            
                            {/* Left: Input Textarea */}
                            <div className="lg:col-span-5 flex flex-col justify-between">
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                                        Type or edit text:
                                    </label>
                                    <textarea
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        rows={6}
                                        className="w-full p-4 rounded-2xl border-2 border-neutral-200 focus:border-violet-500 focus:outline-none font-mono text-xs sm:text-sm text-neutral-800 bg-neutral-50/50 resize-none transition-all leading-relaxed"
                                        placeholder="Type something here to see it handwritten..."
                                    />
                                </div>

                                {/* Ink Color & Jitter Toggles */}
                                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-neutral-600">Ink:</span>
                                        {[
                                            { color: '#1e3a8a', label: 'Royal Blue' },
                                            { color: '#0f172a', label: 'Black' },
                                            { color: '#0369a1', label: 'Gel Blue' },
                                            { color: '#dc2626', label: 'Red Pen' },
                                        ].map(c => (
                                            <button
                                                key={c.color}
                                                onClick={() => setActiveInk(c.color)}
                                                style={{ backgroundColor: c.color }}
                                                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                                                    activeInk === c.color ? 'scale-125 border-neutral-900 shadow-xs' : 'border-white hover:scale-110'
                                                }`}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setActiveJitter(!activeJitter)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            activeJitter ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-500'
                                        }`}
                                    >
                                        {activeJitter ? '✨ Natural Jitter: ON' : 'Jitter: OFF'}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Realistic Notebook Sheet Simulation */}
                            <div className="lg:col-span-7">
                                <div className="relative rounded-2xl bg-amber-50/30 border border-stone-300 shadow-inner overflow-hidden p-6 sm:p-8 min-h-[280px] sm:min-h-[340px] flex flex-col justify-between">
                                    {/* Notebook Ruled Lines Background */}
                                    <div 
                                        className="absolute inset-0 pointer-events-none opacity-40"
                                        style={{
                                            backgroundImage: 'linear-gradient(to bottom, transparent 31px, #93c5fd 32px)',
                                            backgroundSize: '100% 32px'
                                        }}
                                    />
                                    {/* Red Left Margin Line */}
                                    <div className="absolute top-0 bottom-0 left-10 sm:left-14 w-0.5 bg-red-400 opacity-60 pointer-events-none" />

                                    {/* Rendered Handwritten Content */}
                                    <div className="relative z-10 pl-6 sm:pl-10">
                                        <div 
                                            style={{ 
                                                fontFamily: activeSample.font, 
                                                color: activeInk,
                                                lineHeight: '32px',
                                                transform: activeJitter ? 'rotate(-0.3deg)' : 'none'
                                            }}
                                            className="text-lg sm:text-2xl font-normal whitespace-pre-wrap select-none transition-all duration-200"
                                        >
                                            {customText || 'Type in the box to watch handwritten text flow naturally...'}
                                        </div>
                                    </div>

                                    {/* Bottom action inside preview */}
                                    <div className="relative z-10 pt-6 mt-6 border-t border-neutral-200/60 flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-neutral-400">
                                            Page 1 of 1 · Simulated A4 Sheet
                                        </span>
                                        <button
                                            onClick={() => navigate('/editor')}
                                            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs hover:scale-103 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Open Full Studio</span>
                                            <ArrowRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================
                4. CORE DIFFERENTIATING FEATURES (Bento Grid)
            ========================================================= */}
            <section className="py-20 bg-stone-100/60 border-y border-stone-200/80 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-black tracking-widest uppercase text-violet-600 mb-2 block">
                            Why Indian Students Rely on InkTrail
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black font-display text-neutral-950">
                            Engineered to Fool the Strictest Professors.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Feature 1: Lab Notebook Mode */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 font-bold">
                                    <FlaskConical size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    Lab Practical Mode 🔬
                                </h3>
                                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                    Alternating facing pages! Blank plain pages on the left for apparatus diagrams, circuit diagrams, and graphs — ruled lined pages on the right for Aim, Procedure, and Calculations.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                Freehand pen & SVG science presets included →
                            </span>
                        </div>

                        {/* Feature 2: 3D Twin-Wire Spiral Binding */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 font-bold">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    Classmate 3D Spiral Coils 📓
                                </h3>
                                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                    Authentic 30-loop metallic twin-wire silver spiral coils spanning the left margin with drop shadows and punched hole rings. Looks like an actual physical register.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                Locked to authentic left-margin binding →
                            </span>
                        </div>

                        {/* Feature 3: Natural Human Imperfection Engine */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 font-bold">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    Human Error Engine ✍️
                                </h3>
                                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                    Computer fonts look fake because they're too perfect. InkTrail injects subtle baseline jitter, organic word spacing, realistic crossed-out words, and caret insertions.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                Zero repeating character signatures →
                            </span>
                        </div>

                        {/* Feature 4: Phone Camera Physics */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 font-bold">
                                    <Camera size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    Desk Shadows & Vignette 📱
                                </h3>
                                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                    Simulate snapping a photo of your notebook under desk lighting. Adds realistic phone top-down shadows, subtle paper creases, and natural lens curvature.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                                Perfect for CamScanner-like uploads →
                            </span>
                        </div>

                        {/* Feature 5: Multi-Format Document Importer */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5 font-bold">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    Drag & Drop .docx / .pdf / OCR 📂
                                </h3>
                                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                    Drop lecture notes, Word files, assignments, or textbook photos straight in. Our parser extracts text and automatically lays it out onto notebook margins.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                Instant automated formatting →
                            </span>
                        </div>

                        {/* Feature 6: 100% Free Public Beta */}
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-7 text-white shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-white/20 text-yellow-300 flex items-center justify-center mb-5 font-bold">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    100% Free For Students 🎓
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">
                                    No subscription traps. No 3-page export limits. No watermark stamp on your submissions. Built with love by college students, for college students.
                                </p>
                            </div>
                            <Link
                                to="/editor"
                                className="px-4 py-2.5 bg-white text-violet-900 font-bold text-xs rounded-xl text-center hover:bg-violet-50 transition-colors"
                            >
                                Start Creating Free →
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================
                5. AUTHENTIC PAPER MATERIALS SHOWCASE
            ========================================================= */}
            <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="text-xs font-black tracking-widest uppercase text-violet-600 mb-2 block">
                        Authentic Texture Collection
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black font-display text-neutral-950">
                        15+ Realistic Student Paper Styles.
                    </h2>
                    <p className="text-neutral-500 text-sm sm:text-base mt-3">
                        From Indian Classmate registers to engineering grid and aged vintage parchment.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {[
                        { name: 'Indian Spiral', tag: 'Classmate/Youva', color: 'bg-white border-blue-200', desc: '30-coil twin wire' },
                        { name: 'College Ruled', tag: 'Standard Lined', color: 'bg-stone-50 border-blue-100', desc: 'Narrow blue lines' },
                        { name: 'Engineering Graph', tag: 'Math / Physics', color: 'bg-blue-50/40 border-blue-200', desc: 'Precise 5mm grid' },
                        { name: 'Plain Lab Sheet', tag: 'Diagrams', color: 'bg-white border-neutral-200', desc: 'Zero lines canvas' },
                        { name: 'Dotted Journal', tag: 'Bullet Notes', color: 'bg-amber-50/30 border-amber-200', desc: 'Minimal dot matrix' },
                        { name: 'Vintage Aged', tag: 'Historic Style', color: 'bg-amber-100/50 border-amber-300', desc: 'Sepia paper grain' },
                    ].map(paper => (
                        <div
                            key={paper.name}
                            className={`p-4 rounded-2xl border-2 ${paper.color} shadow-xs hover:scale-104 transition-all flex flex-col justify-between h-36`}
                        >
                            <div>
                                <span className="text-[10px] font-bold text-violet-700 bg-violet-100/60 px-2 py-0.5 rounded-md inline-block mb-2">
                                    {paper.tag}
                                </span>
                                <p className="font-extrabold text-sm text-neutral-900 leading-snug">{paper.name}</p>
                            </div>
                            <p className="text-[11px] text-neutral-500 font-medium">{paper.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================================
                6. FAQ ACCORDION (Addressing student doubts)
            ========================================================= */}
            <section className="py-20 bg-stone-50 border-t border-stone-200 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-black tracking-widest uppercase text-violet-600 mb-2 block">
                            Got Questions?
                        </span>
                        <h2 className="text-3xl font-black font-display text-neutral-950">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                q: "Will my professor know this wasn't written by hand?",
                                a: "InkTrail is specifically engineered to defeat pattern detection. Unlike simple font generators, our Human Error Engine randomizes individual character widths, introduces organic baseline drift, slight word jitter, and realistic ink bleeding so that no two letters on the page look identical."
                            },
                            {
                                q: "Is InkTrail really 100% free?",
                                a: "Yes! While in public beta, every single feature — including all 30+ handwriting fonts, 3D twin-wire spirals, 4K PDF exports with no watermark, and the Lab Practical diagram canvas — is completely free for all students."
                            },
                            {
                                q: "How does the Lab Practical Notebook mode work?",
                                a: "Lab practicals in universities require diagrams on the left (plain page) and theory/calculations on the right (ruled page). When you toggle Lab Mode, InkTrail automatically interleaves blank and ruled pages in sequence, allowing you to draw or paste diagrams on the facing side!"
                            },
                            {
                                q: "Can I print the generated PDF?",
                                a: "Absolutely. InkTrail exports high-resolution print-ready PDFs at standard A4 dimensions (210mm x 297mm). You can print it on your home printer or local college xerox shop."
                            },
                            {
                                q: "Where is my data saved?",
                                a: "Your documents and drafts are stored securely in your browser's local cache. Your privacy is paramount — your assignments are never uploaded to any third-party AI training servers."
                            }
                        ].map((faq, i) => (
                            <div
                                key={faq.q}
                                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs"
                            >
                                <button
                                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                                    className="w-full px-6 py-4 text-left font-bold text-sm sm:text-base text-neutral-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        size={18}
                                        className={`text-neutral-400 shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180 text-violet-600' : ''}`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {faqOpen === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                7. FINAL CONVERTING CTA BANNER
            ========================================================= */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 rounded-[2.5rem] p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-black tracking-wider uppercase mb-5">
                            <Flame size={14} className="text-yellow-400" />
                            Stop Writing Assignments at 3 AM
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4 leading-tight">
                            Finish Your Records in Minutes.
                        </h2>
                        <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-8">
                            Join thousands of university scholars using InkTrail for their weekly submissions. Zero watermarks, completely free.
                        </p>
                        <Link
                            to="/editor"
                            className="inline-flex items-center gap-2.5 px-9 py-4 bg-white hover:bg-neutral-100 text-neutral-950 rounded-2xl font-black text-base shadow-xl hover:scale-103 active:scale-97 transition-all"
                        >
                            <Sparkles size={18} className="text-violet-600" />
                            <span>Launch InkTrail Free</span>
                            <ArrowRight size={18} className="text-neutral-400" />
                        </Link>
                        <p className="text-white/40 text-xs mt-6">
                            Crafted with ❤️ by Bipin Vishwakarma · UPES Dehradun
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}
