import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, GraduationCap, Github, Mail, Sparkles, Loader2, School, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScrollLock } from '../../hooks/useScrollLock';
const logo = '/images/logo.png';

export default function AuthModal() {
    const { 
        isAuthModalOpen, 
        setAuthModalOpen, 
        loginWithGoogle, 
        loginWithGithub, 
        loginWithStudentId, 
        loginWithEmail,
        isLoading 
    } = useAuth();

    const [authTab, setAuthTab] = useState<'oauth' | 'student' | 'email'>('oauth');
    
    // Student Form State
    const [studentName, setStudentName] = useState('Aarav Vishwakarma');
    const [studentId, setStudentId] = useState('UPES-50012489');
    const [collegeName, setCollegeName] = useState('UPES Dehradun');

    // Email Form State
    const [emailInput, setEmailInput] = useState('');
    const [emailName, setEmailName] = useState('');

    useScrollLock(isAuthModalOpen);

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim() || !studentId.trim()) return;
        loginWithStudentId(studentName, studentId, collegeName);
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput.trim()) return;
        loginWithEmail(emailInput, emailName);
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className="bg-white rounded-3xl overflow-hidden isolate shadow-2xl max-w-md w-full relative flex flex-col border border-neutral-200/80"
                    >
                        {/* HEADER with macOS dots */}
                        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div>
                                    <h2 className="text-base font-display font-extrabold text-neutral-900 leading-tight">
                                        Student Account & Cloud Vault
                                    </h2>
                                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle2 size={11} /> 100% Free Forever for Students
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setAuthModalOpen(false)}
                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-full transition-all cursor-pointer"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* TAB SELECTOR */}
                        <div className="flex border-b border-neutral-100 bg-neutral-100/70 p-1.5 gap-1 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setAuthTab('oauth')}
                                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    authTab === 'oauth' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                <Sparkles size={13} className="text-indigo-500" />
                                <span>OAuth</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthTab('student')}
                                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    authTab === 'student' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                <GraduationCap size={14} className="text-blue-600" />
                                <span>College ID</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthTab('email')}
                                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    authTab === 'email' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                <Mail size={13} className="text-amber-500" />
                                <span>Email Link</span>
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="p-6 bg-white relative">
                            {authTab === 'oauth' && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <div className="w-14 h-14 mx-auto mb-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center shadow-xs border border-indigo-100/60">
                                            <img src={logo} alt="InkTrail" className="w-9 h-9 object-contain drop-shadow-xs" />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-neutral-900">Sign in with Student Account</h3>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            Sync assignments, custom handwriting styles & diagrams across devices.
                                        </p>
                                    </div>

                                    {/* Google OAuth Button */}
                                    <button
                                        type="button"
                                        onClick={() => loginWithGoogle('student.upes@gmail.com', 'Aarav Sharma')}
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        {/* Official Google 'G' Logo SVG */}
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>

                                    {/* GitHub OAuth Button */}
                                    <button
                                        type="button"
                                        onClick={() => loginWithGithub('bipin-vishwakarma')}
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md shadow-neutral-900/10 active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        <Github size={16} />
                                        <span>Continue with GitHub</span>
                                    </button>

                                    {/* 1-Click Student UPES Demo Button */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => loginWithStudentId('UPES Student Scholar', '500124890', 'UPES Dehradun')}
                                            disabled={isLoading}
                                            className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200/80 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <School size={14} className="text-blue-600" />
                                            <span>⚡ Quick Sign In as UPES Dehradun Student</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {authTab === 'student' && (
                                <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Student Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={studentName}
                                            onChange={(e) => setStudentName(e.target.value)}
                                            placeholder="e.g. Bipin Vishwakarma"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            University / College Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={collegeName}
                                            onChange={(e) => setCollegeName(e.target.value)}
                                            placeholder="e.g. UPES Dehradun"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Student Roll No. / Enrollment ID
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            placeholder="e.g. 500124890 / SAP ID"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-2 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <>
                                                <GraduationCap size={15} />
                                                <span>Save & Activate Student ID</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {authTab === 'email' && (
                                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Your Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={emailName}
                                            onChange={(e) => setEmailName(e.target.value)}
                                            placeholder="e.g. Alex"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Student / College Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            placeholder="name@stu.upes.ac.in"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-2 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Mail size={15} />
                                                <span>Send Magic Link / Sign In</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* PRIVACY & ENCRYPTION BADGE */}
                            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <ShieldCheck size={13} />
                                    <span>Client-Encrypted</span>
                                </div>
                                <span>No Credit Card Ever</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
