
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import MorphicEye from '../components/MorphicEye';

const { useNavigate } = ReactRouterDOM as any;

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center font-sans overflow-hidden relative">
            {/* Global Antigravity Background (Simulated locally for standalone look) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,15,25,1)_0%,rgba(0,0,0,1)_100%)]"></div>
            <div className="absolute top-[20%] left-[15%] w-32 h-32 border border-white/5 rounded-full animate-float opacity-30 blur-[1px]"></div>
            <div className="absolute bottom-[25%] right-[20%] w-64 h-64 border border-white/5 rotate-45 animate-float-delayed opacity-20"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 animate-fade-in flex flex-col items-center">
                <div className="mb-10 p-6 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl shadow-[0_0_80px_rgba(255,255,255,0.05)]">
                    <MorphicEye className="w-24 h-24" />
                </div>

                <h1 className="text-8xl md:text-[12rem] font-black text-white leading-none tracking-tighter mb-4 opacity-10 select-none">404</h1>
                <div className="absolute top-[45%] md:top-[40%]">
                    <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight uppercase">Segment Not Found</h2>
                </div>

                <p className="text-neutral-500 max-w-sm mx-auto mb-12 text-xs md:text-sm font-mono uppercase tracking-[0.3em] mt-16 leading-relaxed">
                    The requested data fragment does not exist in the current neural cluster.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full hover:bg-neutral-200 transition-all shadow-glow-white hover:scale-105 active:scale-95"
                >
                    Return to Origin
                </button>
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-widest">EbookStudio Neural OS v1.0.4</span>
            </div>
        </div>
    );
};

export default NotFoundPage;
