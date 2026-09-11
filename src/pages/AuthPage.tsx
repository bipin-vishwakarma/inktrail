import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, GraduationCap, ArrowRight, Eye, EyeOff, Loader2, BookOpen, PenTool, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const logo = '/images/logo.png';

type AuthStep = 'choose' | 'student-form' | 'email-form' | 'magic-sent';

const providerCard =
    'flex items-center gap-3 w-full px-5 py-4 rounded-2xl border-2 border-neutral-200 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all cursor-pointer font-semibold text-neutral-800 shadow-sm hover:shadow-md active:scale-[0.98]';

const features = [
    { icon: PenTool, text: 'Realistic handwriting in seconds' },
    { icon: BookOpen, text: 'Lab notebooks, ruled pages, custom paper' },
    { icon: Sparkles, text: 'AI-powered text cleaner & smart pagination' },
];

export default function AuthPage() {
    const { isAuthenticated, loginWithGoogle, loginWithGithub, loginWithStudentId, loginWithEmail, isLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/onboarding';

    const [step, setStep] = useState<AuthStep>('choose');
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [college, setCollege] = useState('UPES Dehradun');
    const [email, setEmail] = useState('');
    const [showId, setShowId] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // If already logged in, skip
    useEffect(() => {
        if (isAuthenticated) navigate(redirect, { replace: true });
    }, [isAuthenticated, navigate, redirect]);

    const isNewUser = () => !localStorage.getItem('inktrail_onboarding_done');

    const afterAuth = () => {
        const dest = isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor');
        navigate(dest, { replace: true });
    };

    const handleGoogle = async () => {
        await loginWithGoogle();
        afterAuth();
    };

    const handleGithub = async () => {
        await loginWithGithub();
        afterAuth();
    };

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!studentName.trim()) errs.name = 'Name is required';
        if (!studentId.trim()) errs.id = 'Student / Roll number is required';
        if (!college.trim()) errs.college = 'College name is required';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        await loginWithStudentId(studentName, studentId, college);
        afterAuth();
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email address';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        await loginWithEmail(email);
        setStep('magic-sent');
        // Auto-complete after simulated magic link delay
        setTimeout(() => afterAuth(), 1800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex">
            {/* Left panel — branding */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55 }}
                className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 p-12 text-white relative overflow-hidden"
            >
                {/* Background blobs */}
                <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-14">
                        <img src={logo} alt="InkTrail" className="h-9 w-9 object-contain" />
                        <span className="text-2xl font-black tracking-tight">InkTrail</span>
                    </div>
                    <h2 className="text-4xl font-black leading-tight mb-4">
                        Your digital notebook.<br />Your handwriting.
                    </h2>
                    <p className="text-white/75 text-lg leading-relaxed">
                        Trusted by students at 200+ universities to create beautiful, realistic handwritten PDFs.
                    </p>
                </div>

                <div className="relative z-10 space-y-5">
                    {features.map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Icon size={18} />
                            </div>
                            <p className="text-white/90 font-medium">{text}</p>
                        </div>
                    ))}
                    <p className="text-white/50 text-sm pt-4">
                        Built with ❤️ by Bipin Vishwakarma · UPES Dehradun
                    </p>
                </div>
            </motion.div>

            {/* Right panel — auth form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <img src={logo} alt="InkTrail" className="h-8 w-8 object-contain" />
                        <span className="text-xl font-black text-neutral-900">InkTrail</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* === STEP: choose provider === */}
                        {step === 'choose' && (
                            <motion.div
                                key="choose"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <h1 className="text-3xl font-black text-neutral-900 mb-1">Welcome back</h1>
                                <p className="text-neutral-500 mb-8">Sign in to continue to InkTrail. No password needed.</p>

                                <div className="space-y-3">
                                    {/* Google */}
                                    <button className={providerCard} onClick={handleGoogle} disabled={isLoading}>
                                        {isLoading ? <Loader2 size={20} className="animate-spin text-violet-600" /> : (
                                            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        )}
                                        <span>Continue with Google</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>

                                    {/* GitHub */}
                                    <button className={providerCard} onClick={handleGithub} disabled={isLoading}>
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 fill-neutral-800">
                                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                        <span>Continue with GitHub</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>

                                    {/* Student ID */}
                                    <button
                                        className={`${providerCard} border-violet-300 bg-violet-50 hover:border-violet-500 hover:bg-violet-100`}
                                        onClick={() => setStep('student-form')}
                                        disabled={isLoading}
                                    >
                                        <GraduationCap size={20} className="text-violet-600 flex-shrink-0" />
                                        <div className="text-left">
                                            <p className="font-bold text-violet-800">Student Sign In</p>
                                            <p className="text-xs font-normal text-violet-500">Use your roll number / student ID</p>
                                        </div>
                                        <ArrowRight size={16} className="ml-auto text-violet-400" />
                                    </button>

                                    {/* Email Magic Link */}
                                    <button className={providerCard} onClick={() => setStep('email-form')} disabled={isLoading}>
                                        <Mail size={20} className="text-indigo-500 flex-shrink-0" />
                                        <span>Continue with Email</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>
                                </div>

                                <p className="text-center text-xs text-neutral-400 mt-8">
                                    By signing in you agree to our{' '}
                                    <a href="/terms" className="underline hover:text-violet-600">Terms</a> and{' '}
                                    <a href="/privacy" className="underline hover:text-violet-600">Privacy Policy</a>.
                                </p>
                            </motion.div>
                        )}

                        {/* === STEP: student form === */}
                        {step === 'student-form' && (
                            <motion.div
                                key="student"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-violet-600 mb-6 transition-colors">
                                    ← Back
                                </button>
                                <h1 className="text-2xl font-black text-neutral-900 mb-1">Student Sign In</h1>
                                <p className="text-neutral-500 mb-6 text-sm">Use your university roll number or student ID.</p>

                                <form onSubmit={handleStudentSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-neutral-700 mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bipin Vishwakarma"
                                            value={studentName}
                                            onChange={e => setStudentName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-neutral-700 mb-1 block">Student / Roll Number</label>
                                        <div className="relative">
                                            <input
                                                type={showId ? 'text' : 'password'}
                                                placeholder="e.g. 500123456 or UPES-CS-2026"
                                                value={studentId}
                                                onChange={e => setStudentId(e.target.value)}
                                                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors"
                                            />
                                            <button type="button" onClick={() => setShowId(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                                                {showId ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-neutral-700 mb-1 block">College / University</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. UPES Dehradun"
                                            value={college}
                                            onChange={e => setCollege(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors"
                                        />
                                        {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-60"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><GraduationCap size={18} /> Sign In as Student</>}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* === STEP: email form === */}
                        {step === 'email-form' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-violet-600 mb-6 transition-colors">
                                    ← Back
                                </button>
                                <h1 className="text-2xl font-black text-neutral-900 mb-1">Sign in with Email</h1>
                                <p className="text-neutral-500 mb-6 text-sm">We'll send you a magic link — no password needed.</p>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-neutral-700 mb-1 block">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@university.edu"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors"
                                            autoFocus
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Mail size={18} /> Send Magic Link</>}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* === STEP: magic link sent === */}
                        {step === 'magic-sent' && (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail size={36} className="text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-black text-neutral-900 mb-2">Check your inbox!</h2>
                                <p className="text-neutral-500 mb-4">
                                    Magic link sent to <strong>{email}</strong>.<br />
                                    Signing you in automatically…
                                </p>
                                <div className="flex items-center justify-center gap-2 text-indigo-500 text-sm font-semibold">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Verifying…</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
