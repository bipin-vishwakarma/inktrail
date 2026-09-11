import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, GraduationCap, ArrowRight, Eye, EyeOff, Loader2, 
    BookOpen, PenTool, Sparkles, CheckCircle2, AlertCircle, KeyRound, Lock, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InkTrailLogo from '../components/common/InkTrailLogo';

type AuthStep = 'choose' | 'student-form' | 'email-magic' | 'email-password' | 'magic-sent';

const providerCard =
    'flex items-center gap-3 w-full px-5 py-4 rounded-2xl border-2 border-neutral-200 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all cursor-pointer font-semibold text-neutral-800 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed';

const features = [
    { icon: PenTool, text: 'Realistic handwriting simulation in seconds' },
    { icon: BookOpen, text: 'Lab notebooks, ruled pages & 15+ student paper types' },
    { icon: Sparkles, text: 'Zero watermark, 4K PDF exports — 100% Free during Beta' },
];

export default function AuthPage() {
    const { 
        isAuthenticated, 
        isSupabaseConfigured, 
        loginWithGoogle, 
        loginWithGithub, 
        loginWithStudentId, 
        loginWithEmail,
        loginWithPassword,
        signUpWithPassword,
        isLoading 
    } = useAuth();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/onboarding';

    const [step, setStep] = useState<AuthStep>('choose');
    const [showSupabaseInfo, setShowSupabaseInfo] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successNotice, setSuccessNotice] = useState<string | null>(null);

    // Student Form State
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [college, setCollege] = useState('');
    const [showId, setShowId] = useState(false);

    // Email Forms State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [fullName, setFullName] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});

    // If already logged in, navigate immediately
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect, { replace: true });
        }
    }, [isAuthenticated, navigate, redirect]);

    const isNewUser = () => !localStorage.getItem('inktrail_onboarding_done');

    const afterAuth = () => {
        const dest = isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor');
        navigate(dest, { replace: true });
    };

    const handleGoogle = async () => {
        setErrorMessage(null);
        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithGoogle(dest);
        if (res.redirected) {
            // Browser will redirect to Google
            return;
        }
        if (!res.success) {
            setErrorMessage(res.error || 'Google sign-in encountered an issue. Try Student Sign In or Email.');
        } else {
            afterAuth();
        }
    };

    const handleGithub = async () => {
        setErrorMessage(null);
        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithGithub(dest);
        if (res.redirected) {
            return;
        }
        if (!res.success) {
            setErrorMessage(res.error || 'GitHub sign-in encountered an issue. Try Student Sign In or Email.');
        } else {
            afterAuth();
        }
    };

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        const errs: Record<string, string> = {};
        if (!studentName.trim()) errs.name = 'Name is required';
        if (!studentId.trim()) errs.id = 'Student / Roll number is required';
        if (!college.trim()) errs.college = 'College name is required';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        await loginWithStudentId(studentName, studentId, college);
        afterAuth();
    };

    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        const errs: Record<string, string> = {};
        if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email address';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithEmail(email, dest);
        if (res.success) {
            setStep('magic-sent');
        } else {
            setErrorMessage(res.error || 'Could not send magic link. Please check your email or try password login.');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessNotice(null);
        const errs: Record<string, string> = {};
        if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email address';
        if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (isSignUp && !fullName.trim()) errs.fullName = 'Full name is required';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        if (isSignUp) {
            const res = await signUpWithPassword(email, password, {
                name: fullName,
                studentId: studentId || undefined,
                collegeName: college || undefined,
            });
            if (res.success) {
                if (res.needsEmailConfirmation) {
                    setSuccessNotice(`Confirmation email sent to ${email}. Check your inbox to verify your account.`);
                } else {
                    afterAuth();
                }
            } else {
                setErrorMessage(res.error || 'Failed to create account. Please try again.');
            }
        } else {
            const res = await loginWithPassword(email, password);
            if (res.success) {
                afterAuth();
            } else {
                setErrorMessage(res.error || 'Invalid email or password.');
            }
        }
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
                        <InkTrailLogo size={38} className="drop-shadow-md" />
                        <span className="text-2xl font-black tracking-tight">InkTrail</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 font-black text-xs mb-4 shadow-sm">
                        <Sparkles size={12} className="text-yellow-900" />
                        <span>PUBLIC BETA · 100% FREE FOR STUDENTS</span>
                    </div>
                    <h2 className="text-4xl font-black leading-tight mb-4">
                        Your digital notebook.<br />Your authentic handwriting.
                    </h2>
                    <p className="text-white/75 text-lg leading-relaxed">
                        Trusted by students worldwide to generate authentic handwritten assignments, lab records, and diagrams effortlessly.
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
                    <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/60">
                        <span>Built with ❤️ by Bipin Vishwakarma</span>
                        <span className="text-emerald-300 font-bold">● Cloud Sync Ready</span>
                    </div>
                </div>
            </motion.div>

            {/* Right panel — auth form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <InkTrailLogo size={32} />
                        <span className="text-xl font-black text-neutral-900">InkTrail</span>
                    </div>

                    {/* Global Error Notice */}
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs"
                        >
                            <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold">Authentication Notice</p>
                                <p className="mt-0.5 text-rose-700 leading-normal">{errorMessage}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Global Success Notice */}
                    {successNotice && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 shadow-xs"
                        >
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold">Account Created</p>
                                <p className="mt-0.5 text-emerald-700 leading-normal">{successNotice}</p>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* === STEP 1: CHOOSE PROVIDER === */}
                        {step === 'choose' && (
                            <motion.div
                                key="choose"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <h1 className="text-3xl font-black text-neutral-900 mb-1">Welcome to InkTrail</h1>
                                <p className="text-neutral-500 mb-4 text-sm">Sign in to save documents & sync handwriting across devices.</p>

                                {/* Supabase Cloud Connection Status Badge */}
                                <div className="mb-6 p-3.5 rounded-2xl border text-xs bg-white/80 backdrop-blur-xs shadow-2xs border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            <span className="font-bold text-neutral-800">
                                                {isSupabaseConfigured ? 'Supabase Cloud Auth: Live & Connected' : 'Instant Campus Demo Mode'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowSupabaseInfo(!showSupabaseInfo)}
                                            className="text-violet-600 hover:text-violet-800 font-bold underline cursor-pointer text-[11px]"
                                        >
                                            {showSupabaseInfo ? 'Hide Details' : 'Auth Setup'}
                                        </button>
                                    </div>
                                    {showSupabaseInfo && (
                                        <div className="mt-2.5 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-600 space-y-1.5 leading-relaxed">
                                            <p className="font-semibold text-neutral-800">Supabase Backend Status:</p>
                                            <p>Project: <span className="font-mono text-violet-700 font-bold">SOLINK (zfkxtakrcsqncdxslsvx)</span></p>
                                            <p className="text-emerald-700 font-semibold">
                                                ✓ Google OAuth, GitHub OAuth, Email OTP, and Password authentication are live.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {/* Google OAuth Button */}
                                    <button 
                                        type="button" 
                                        className={providerCard} 
                                        onClick={handleGoogle} 
                                        disabled={isLoading}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>

                                    {/* GitHub OAuth Button */}
                                    <button 
                                        type="button" 
                                        className={providerCard} 
                                        onClick={handleGithub} 
                                        disabled={isLoading}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 fill-neutral-800">
                                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                        <span>Continue with GitHub</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>

                                    {/* Email & Password Option */}
                                    <button 
                                        type="button" 
                                        className={providerCard} 
                                        onClick={() => setStep('email-password')} 
                                        disabled={isLoading}
                                    >
                                        <Lock size={19} className="text-violet-600 flex-shrink-0" />
                                        <span>Sign in with Email & Password</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>

                                    {/* Email Magic Link Option */}
                                    <button 
                                        type="button" 
                                        className={providerCard} 
                                        onClick={() => setStep('email-magic')} 
                                        disabled={isLoading}
                                    >
                                        <Mail size={19} className="text-indigo-500 flex-shrink-0" />
                                        <span>Email Magic Link (Passwordless)</span>
                                        <ArrowRight size={16} className="ml-auto text-neutral-400" />
                                    </button>

                                    {/* 1-Click Student Campus Sign In */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            className={`${providerCard} border-violet-200 bg-violet-50/70 hover:border-violet-400 hover:bg-violet-100/70`}
                                            onClick={() => setStep('student-form')}
                                            disabled={isLoading}
                                        >
                                            <GraduationCap size={20} className="text-violet-600 flex-shrink-0" />
                                            <div className="text-left">
                                                <p className="font-bold text-violet-900">Student ID / Guest Access</p>
                                                <p className="text-xs font-normal text-violet-600">Instant sign-in with your roll number</p>
                                            </div>
                                            <ArrowRight size={16} className="ml-auto text-violet-500" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-neutral-400 mt-8">
                                    By signing in you agree to our{' '}
                                    <a href="/terms" className="underline hover:text-violet-600">Terms</a> and{' '}
                                    <a href="/privacy" className="underline hover:text-violet-600">Privacy Policy</a>.
                                </p>
                            </motion.div>
                        )}

                        {/* === STEP 2: EMAIL & PASSWORD === */}
                        {step === 'email-password' && (
                            <motion.div
                                key="email-password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <button 
                                    type="button" 
                                    onClick={() => setStep('choose')} 
                                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-violet-600 mb-6 transition-colors"
                                >
                                    ← Back
                                </button>
                                <h1 className="text-2xl font-black text-neutral-900 mb-1">
                                    {isSignUp ? 'Create Student Account' : 'Sign In with Password'}
                                </h1>
                                <p className="text-neutral-500 mb-6 text-sm">
                                    {isSignUp ? 'Create an account to sync all assignments.' : 'Enter your email & password to sign in.'}
                                </p>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    {isSignUp && (
                                        <div>
                                            <label className="text-xs font-bold text-neutral-700 mb-1 block">Your Full Name</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Aarav Sharma"
                                                    value={fullName}
                                                    onChange={e => setFullName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                                />
                                            </div>
                                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-neutral-700 mb-1 block">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                type="email"
                                                placeholder="you@university.edu"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                                autoFocus
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-neutral-700 mb-1 block">Password</label>
                                        <div className="relative">
                                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)} 
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-60 shadow-md shadow-violet-600/20 cursor-pointer"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                            <>
                                                <Lock size={16} />
                                                <span>{isSignUp ? 'Create Student Account' : 'Sign In'}</span>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-5 pt-5 border-t border-neutral-200 text-xs text-neutral-600">
                                    {isSignUp ? (
                                        <p>
                                            Already have an account?{' '}
                                            <button 
                                                type="button" 
                                                onClick={() => setIsSignUp(false)} 
                                                className="font-bold text-violet-600 hover:underline"
                                            >
                                                Sign In
                                            </button>
                                        </p>
                                    ) : (
                                        <p>
                                            Don't have an account yet?{' '}
                                            <button 
                                                type="button" 
                                                onClick={() => setIsSignUp(true)} 
                                                className="font-bold text-violet-600 hover:underline"
                                            >
                                                Create Student Account
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* === STEP 3: EMAIL MAGIC LINK === */}
                        {step === 'email-magic' && (
                            <motion.div
                                key="email-magic"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <button 
                                    type="button" 
                                    onClick={() => setStep('choose')} 
                                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-violet-600 mb-6 transition-colors"
                                >
                                    ← Back
                                </button>
                                <h1 className="text-2xl font-black text-neutral-900 mb-1">Passwordless Magic Link</h1>
                                <p className="text-neutral-500 mb-6 text-sm">We'll send a secure login link directly to your inbox.</p>

                                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-neutral-700 mb-1 block">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@university.edu"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                            autoFocus
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-md shadow-indigo-600/20 cursor-pointer"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                            <>
                                                <Mail size={18} />
                                                <span>Send Magic Link</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* === STEP 4: MAGIC LINK SENT NOTIFICATION === */}
                        {step === 'magic-sent' && (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-indigo-600 shadow-inner">
                                    <Mail size={38} />
                                </div>
                                <h2 className="text-2xl font-black text-neutral-900 mb-2">Check Your Email</h2>
                                <p className="text-neutral-600 mb-3 text-sm leading-relaxed">
                                    We sent a login link to <br /><strong className="text-neutral-900 font-bold">{email}</strong>
                                </p>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Click the link in your email on this device to sign in automatically. Be sure to check your spam/promotions folder if it does not arrive within a minute.
                                </p>

                                <div className="space-y-2.5">
                                    <button
                                        type="button"
                                        onClick={handleMagicLinkSubmit}
                                        disabled={isLoading}
                                        className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                    >
                                        Resend Magic Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('choose')}
                                        className="w-full py-2.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold cursor-pointer"
                                    >
                                        ← Use a different login method
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* === STEP 5: STUDENT CAMPUS ID FORM === */}
                        {step === 'student-form' && (
                            <motion.div
                                key="student"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.28 }}
                            >
                                <button 
                                    type="button" 
                                    onClick={() => setStep('choose')} 
                                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-violet-600 mb-6 transition-colors"
                                >
                                    ← Back
                                </button>
                                <h1 className="text-2xl font-black text-neutral-900 mb-1">Student Campus Sign In</h1>
                                <p className="text-neutral-500 mb-6 text-sm">Instant guest sign-in using your college credentials.</p>

                                <form onSubmit={handleStudentSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-neutral-700 mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bipin Vishwakarma"
                                            value={studentName}
                                            onChange={e => setStudentName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-neutral-700 mb-1 block">Student / Roll Number</label>
                                        <div className="relative">
                                            <input
                                                type={showId ? 'text' : 'password'}
                                                placeholder="e.g. 500123456 or STU-2026"
                                                value={studentId}
                                                onChange={e => setStudentId(e.target.value)}
                                                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowId(!showId)} 
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                                            >
                                                {showId ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-neutral-700 mb-1 block">College / University</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. University / Institute of Technology"
                                            value={college}
                                            onChange={e => setCollege(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-violet-400 focus:outline-none text-neutral-900 bg-white transition-colors text-sm font-medium"
                                        />
                                        {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-60 cursor-pointer shadow-md shadow-violet-600/20"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                            <>
                                                <GraduationCap size={18} />
                                                <span>Sign In as Student</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
