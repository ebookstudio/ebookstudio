import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { APP_NAME, IconSparkles, IconMail, IconLock, IconArrowRight, IconBook } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { UserType } from '../types';
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
        <div className="min-h-screen w-full relative bg-black flex items-center justify-center p-6 bg-neural-mesh bg-dot-matrix">
            
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="glass-card-premium p-10 md:p-12 text-center">
                    
                    {/* Header */}
                    <div className="mb-12">
                        <div className="relative w-20 h-20 mx-auto mb-8">
                            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full"></div>
                            <MorphicEye className="w-20 h-20 bg-black border border-white/20 rounded-full relative z-10" />
                        </div>
                        <h1 className="type-h1 tracking-tighter mb-4">Welcome Back</h1>
                        <p className="type-small text-muted">Continue your literary journey.</p>
                    </div>

                    {/* Main Actions */}
                    <div className="space-y-4">
                        <button 
                            onClick={onGoogleLogin}
                            disabled={isProcessing}
                            className="btn-secondary w-full py-4 text-[11px]"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {isProcessing ? 'Connecting...' : 'Sign in with Google'}
                        </button>

                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center"><span className="bg-transparent px-4 type-tiny text-zinc-600">OR</span></div>
                        </div>

                        <form onSubmit={onEmailLogin} className="space-y-5 text-left">
                            <div className="space-y-2">
                                <label className="type-tiny text-zinc-500 ml-1">Email Address</label>
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
                                <label className="type-tiny text-zinc-500 ml-1">Password</label>
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
                                className="btn-primary w-full mt-4 py-4"
                            >
                                {isProcessing ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="mt-8 text-center type-tiny text-zinc-600">
                    By signing in, you agree to our <Link to="/terms-and-conditions" className="text-zinc-400 hover:text-white underline-offset-4 hover:underline transition-colors">Terms of Service</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

