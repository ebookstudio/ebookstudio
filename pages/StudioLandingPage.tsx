
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { IconRocket, IconBrain, IconSettings, IconArrowRight, IconBook } from '../constants';
import CoAuthor from '../components/CoAuthor';
import { getAppBaseUrl } from '../App';

const { useNavigate } = ReactRouterDOM as any;

const StudioLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'init' | 'menu' | 'launch'>('init');

    useEffect(() => {
        // Initial "redirecting" / loading animation
        const timer = setTimeout(() => {
            setPhase('menu');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleEnterStudio = () => {
        setPhase('launch');
        // Explicitly redirect to the production Firebase app (or mirror)
        setTimeout(() => {
            const baseUrl = getAppBaseUrl();
            window.location.href = `${baseUrl}/ebook-studio`;
        }, 1500);
    };

    if (phase === 'init') {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse-slow"></div>
                    <CoAuthor className="w-24 h-24 border border-white/50 bg-black relative z-10" />
                </div>
                <div className="mt-8 flex flex-col items-center gap-3">
                    <h1 className="text-white text-3xl font-black tracking-tighter uppercase animate-slide-up font-sans">
                        EBOOKSTUDIO
                    </h1>
                    <div className="flex items-center gap-3 text-neutral-500 font-mono text-[10px] uppercase tracking-[0.2em] animate-fade-in delay-200">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                        SYSTEM ONLINE
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'launch') {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
                <div className="absolute inset-0 bg-white/5 animate-pulse-square"></div>
                <CoAuthor className="w-32 h-32 border border-white bg-black animate-spin-slow scale-125 transition-transform duration-1000" />
                <h2 className="mt-12 text-white text-xl font-bold uppercase tracking-[0.5em] animate-pulse">Establishing Uplink...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background Polish */}
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[160px] pointer-events-none animate-pulse-slow"></div>

            {/* Top Badge */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                    <IconBrain className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Agentic Workflow Engine v3.0</span>
                </div>
            </div>

            <div className="z-10 w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mt-10">

                {/* Left: Typography */}
                <div className="text-left space-y-8">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                        Studio <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-600">Environment</span>
                    </h1>
                    <p className="text-neutral-500 max-w-lg text-base md:text-lg leading-relaxed font-light">
                        Welcome to your dedicated creation workspace. Access your projects, configure your AI agents, and write without distractions.
                    </p>
                </div>

                {/* Right: Interactive Cards */}
                <div className="space-y-6 w-full max-w-md mx-auto lg:ml-auto">

                    {/* Main Action Card */}
                    <button
                        onClick={handleEnterStudio}
                        className="group w-full relative overflow-hidden bg-white text-black p-1.5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                    >
                        <div className="relative z-10 bg-white border border-neutral-200 rounded-[1.5rem] px-8 py-8 flex items-center justify-between">
                            <div className="text-left">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <IconRocket className="w-6 h-6" /> Enter Studio
                                </h3>
                                <p className="text-[11px] text-neutral-500 font-mono mt-2 font-bold tracking-widest">NEW PROJECT / OPEN RECENT</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:rotate-45 group-hover:scale-110">
                                <IconArrowRight className="w-6 h-6" />
                            </div>
                        </div>
                    </button>

                    {/* Secondary Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="group relative overflow-hidden bg-[#0A0A0A] border border-white/10 p-6 rounded-[1.5rem] hover:bg-[#111] transition-colors text-left hover:border-white/20">
                            <IconSettings className="w-8 h-8 text-neutral-600 mb-4 group-hover:text-white transition-colors" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agent Settings</h3>
                            <p className="text-[10px] text-neutral-500 mt-1">Configure Models & Personas</p>
                        </button>
                        <button className="group relative overflow-hidden bg-[#0A0A0A] border border-white/10 p-6 rounded-[1.5rem] hover:bg-[#111] transition-colors text-left hover:border-white/20">
                            <IconBook className="w-8 h-8 text-neutral-600 mb-4 group-hover:text-white transition-colors" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Archives</h3>
                            <p className="text-[10px] text-neutral-500 mt-1">View past drafts</p>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudioLandingPage;
