import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, ArrowRight, Eye, EyeOff, Loader2, 
    BookOpen, PenTool, Sparkles, CheckCircle2, AlertCircle, KeyRound, Lock, User, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Text2HandwritingLogo from '../components/common/Text2HandwritingLogo';

type AuthStep = 'choose' | 'email-password';

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
        loginWithGoogle, 
        loginWithGithub, 
        loginWithPassword,
        signUpWithPassword,
        isLoading 
    } = useAuth();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/onboarding';

    const [step, setStep] = useState<AuthStep>('choose');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

    const isNewUser = () => !localStorage.getItem('text2handwriting_onboarding_done');

    const afterAuth = () => {
        const dest = isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor');
        navigate(dest, { replace: true });
    };

    const handleGoogle = async () => {
        setErrorMessage(null);
        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithGoogle(dest);
        if (res.redirected) return;
        if (!res.success) {
            setErrorMessage(res.error || 'Google sign-in encountered an issue.');
        } else {
            afterAuth();
        }
    };

    const handleGithub = async () => {
        setErrorMessage(null);
        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithGithub(dest);
        if (res.redirected) return;
        if (!res.success) {
            setErrorMessage(res.error || 'GitHub sign-in encountered an issue.');
        } else {
            afterAuth();
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
            const res = await signUpWithPassword(email, password, { name: fullName });
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

    const hasIncomingCode = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).has('code') ||
        window.location.hash.includes('access_token')
    );

    if (isLoading && hasIncomingCode) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 gap-4">
                <Text2HandwritingLogo size={44} className="animate-pulse" />
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                    <div className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                    <span>Securely signing you in...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex">
            {/* Left panel — branding */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55 }}
                className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 p-12 text-white relative overflow-hidden"
            >
                <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-14">
                        <Text2HandwritingLogo size={38} className="drop-shadow-md" />
                        <span className="text-2xl font-black tracking-tight">Text2Handwriting</span>
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
                        <span>Built with ❤️ by students, for students</span>
                        <span className="text-emerald-300 font-bold">● Cloud Sync Ready</span>
                    </div>
                </div>
            </motion.div>

            {/* Right panel — auth form */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Radiant Ambient Bloom */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-violet-400/20 via-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* Back to Home Header */}
                <div className="p-6 sm:p-8 flex justify-between items-center relative z-20">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-violet-600 transition-colors">
                        <Home size={16} />
                        <span>Back to Home</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full max-w-md relative z-10 -mt-16"
                    >
                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
                            <Text2HandwritingLogo size={36} />
                            <span className="text-xl font-black text-neutral-900">Text2Handwriting</span>
                        </div>

                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs"
                            >
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                                <div className="flex-1 space-y-1">
                                    <p className="font-extrabold text-sm">Authentication Notice</p>
                                    <p className="leading-relaxed">{errorMessage}</p>
                                </div>
                            </motion.div>
                        )}

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
                            {step === 'choose' && (
                                <motion.div
                                    key="choose"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.28 }}
                                >
                                    <h1 className="text-3xl font-black text-neutral-900 mb-1">Welcome back</h1>
                                    <p className="text-neutral-500 mb-8 text-sm">Sign in to sync your handwriting securely.</p>

                                    <div className="space-y-4">
                                        {/* Google OAuth Button - Primary */}
                                        <button 
                                            type="button" 
                                            className="flex items-center justify-center gap-3 w-full px-5 py-3.5 rounded-2xl border-2 border-violet-600 bg-violet-600 hover:bg-violet-700 text-white transition-all cursor-pointer font-bold shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                            onClick={handleGoogle} 
                                            disabled={isLoading}
                                        >
                                            <div className="bg-white p-1 rounded-full flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            </div>
                                            <span className="text-[15px]">Continue with Google</span>
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
                                        </button>
                                        
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="h-px bg-neutral-200 flex-1"></div>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">or email</span>
                                            <div className="h-px bg-neutral-200 flex-1"></div>
                                        </div>

                                        {/* Email & Password Option */}
                                        <button 
                                            type="button" 
                                            className={providerCard} 
                                            onClick={() => setStep('email-password')} 
                                            disabled={isLoading}
                                        >
                                            <Mail size={19} className="text-neutral-500 flex-shrink-0" />
                                            <span>Sign in with Email</span>
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
                                        ← Back to options
                                    </button>
                                    <h1 className="text-2xl font-black text-neutral-900 mb-1">
                                        {isSignUp ? 'Create Account' : 'Welcome Back'}
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
                                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
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
                                                    className="font-bold text-violet-600 hover:underline cursor-pointer"
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
                                                    className="font-bold text-violet-600 hover:underline cursor-pointer"
                                                >
                                                    Create Account
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
