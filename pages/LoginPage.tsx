import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const { useNavigate, Link } = ReactRouterDOM as any;

const LoginPage: React.FC = () => {
    const { handleEmailLogin, handleGoogleLogin, currentUser, isAuthenticating } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localProcessing, setLocalProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-navigate when login is confirmed in context
    React.useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const isProcessing = localProcessing || isAuthenticating;

    const onEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalProcessing(true);
        setError(null);
        try {
            const result = await handleEmailLogin(email, password);
            if (!result.success) {
                setError(result.message || 'Invalid credentials');
                setLocalProcessing(false);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLocalProcessing(false);
        }
    };

    const onGoogleLogin = async () => {
        setLocalProcessing(true);
        setError(null);
        try {
            const success = await handleGoogleLogin();
            if (!success) {
                setError('Google login was interrupted or failed.');
            }
        } catch (err) {
            setError('Google login failed. Please try again.');
        } finally {
            setLocalProcessing(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-100 selection:bg-white/10 relative overflow-hidden">
            {/* High-end Background Texture */}
            <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-zinc-100/5 to-transparent pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Logo & Header */}
                <header className="text-center mb-10 space-y-4">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <span className="text-black font-black text-2xl tracking-tighter">E</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">EbookStudio</span>
                    </motion.div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
                        <p className="text-sm text-zinc-500 font-medium tracking-tight">Enter your workspace credentials</p>
                    </div>
                </header>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-8 relative overflow-hidden group">
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold p-3 rounded-lg flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <Button 
                            onClick={onGoogleLogin}
                            disabled={isProcessing}
                            variant="outline"
                            className="w-full h-12 border-white/10 bg-zinc-950 text-white hover:bg-zinc-900 hover:border-white/20 text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg rounded-xl"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {isProcessing ? 'Synchronizing...' : 'Fast Sign in with Google'}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
                                <span className="bg-[#0e0e11] px-4">Standard Protocol</span>
                            </div>
                        </div>

                        <form onSubmit={onEmailLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Email Identifier</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 bg-zinc-950/50 border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Security Key</label>
                                    <button type="button" className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-600 hover:text-white transition-colors">Recover</button>
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 bg-zinc-950/50 border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-zinc-800"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isProcessing}
                                className="w-full h-12 bg-white text-black hover:bg-zinc-200 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-xl shadow-[0_10px_20px_rgba(255,255,255,0.05)] active:scale-[0.98]"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Authenticating
                                    </div>
                                ) : 'Secure Login'}
                            </Button>
                        </form>
                    </div>
                </div>

                <footer className="mt-12 text-center space-y-4">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Don't have an account? <Link to="/store" className="text-white hover:underline">Start browsing</Link>
                    </p>
                    <div className="flex items-center justify-center gap-6 opacity-30">
                        <div className="w-8 h-[1px] bg-white" />
                        <span className="text-[8px] font-bold tracking-[0.5em] text-white">ENCRYPTED SYSTEM</span>
                        <div className="w-8 h-[1px] bg-white" />
                    </div>
                </footer>
            </motion.div>
        </div>
    );
};

export default LoginPage;
