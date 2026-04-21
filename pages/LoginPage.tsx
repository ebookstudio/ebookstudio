import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import MorphicEye from '../components/MorphicEye';

const { useNavigate, Link } = ReactRouterDOM as any;

const LoginPage: React.FC = () => {
    const { handleEmailLogin, handleGoogleLogin } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const onEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        const success = await handleEmailLogin(email, password);
        if (success) navigate('/dashboard');
        else alert('Invalid credentials');
        setIsProcessing(false);
    };

    const onGoogleLogin = async () => {
        setIsProcessing(true);
        const success = await handleGoogleLogin();
        if (success) navigate('/dashboard');
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen w-full relative bg-[#000000] flex items-center justify-center p-6 overflow-hidden">
            
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-dot-matrix opacity-[0.2]" />
            </div>

            {/* Login Architecture */}
            <div className="w-full max-w-[420px] relative z-10">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-10">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <MorphicEye variant="hero" className="w-24 h-24 relative z-10" />
                        </div>
                    </div>
                    <h1 className="type-h1 text-white text-4xl font-black tracking-tight mb-4">Neural Access</h1>
                    <p className="type-body text-zinc-500 text-sm tracking-wide">Secure synchronization for sovereign creators.</p>
                </div>

                <div className="glass-card-premium p-10 border-white/5">
                    {/* Google Action */}
                    <button 
                        onClick={onGoogleLogin}
                        disabled={isProcessing}
                        className="btn-google w-full"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {isProcessing ? 'Synchronizing...' : 'Sign in with Google'}
                    </button>

                    <div className="relative py-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-4 text-[9px] uppercase tracking-[0.4em] font-black text-zinc-700">Protocol Link</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={onEmailLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Identity</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-premium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Cipher</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-premium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="btn-primary w-full mt-4 rounded-2xl"
                        >
                            {isProcessing ? 'Authorizing...' : 'Initialize Access'}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <p className="type-tiny text-[9px] tracking-[0.2em] text-zinc-600">
                        By initializing, you accept the <Link to="/terms-and-conditions" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/10">Sovereign Agreement</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

