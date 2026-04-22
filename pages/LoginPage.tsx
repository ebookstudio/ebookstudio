import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

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
        <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 selection:bg-primary/30">
            
            <div className="w-full max-w-[400px] space-y-8 animate-fade-in">
                
                <header className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-8">
                         <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                            <span className="text-zinc-950 font-black text-xl">E</span>
                        </div>
                        <span className="text-xl font-bold tracking-tighter">EbookStudio</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
                    <p className="text-sm text-zinc-500">Enter your credentials to access the studio.</p>
                </header>

                <div className="bg-zinc-900 border border-border p-8 rounded-xl shadow-2xl space-y-6">
                    <Button 
                        onClick={onGoogleLogin}
                        disabled={isProcessing}
                        variant="outline"
                        className="w-full h-11 border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {isProcessing ? 'Connecting...' : 'Continue with Google'}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="bg-zinc-900 px-3 text-zinc-500">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={onEmailLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-10 bg-zinc-950 border border-border rounded-md px-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-700"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
                                <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-200 transition-colors">Forgot password?</button>
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-10 bg-zinc-950 border border-border rounded-md px-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-700"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full h-11 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all mt-4"
                        >
                            {isProcessing ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>
                </div>

                <footer className="text-center">
                    <p className="text-xs text-zinc-500">
                        Don't have an account? <Link to="/store" className="text-zinc-200 hover:underline font-semibold">Start browsing</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
