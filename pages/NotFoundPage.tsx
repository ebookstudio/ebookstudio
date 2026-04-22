import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import CoAuthor from '../components/CoAuthor';
import { Button } from '../components/ui/button';

const { useNavigate } = ReactRouterDOM as any;

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center selection:bg-white selection:text-black overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
            </div>

            <div className="relative z-10 animate-fade-in flex flex-col items-center">
                <div className="mb-12 p-8 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl shadow-3xl">
                    <CoAuthor size="lg" />
                </div>

                <div className="relative mb-12">
                    <h1 className="text-8xl md:text-[14rem] font-serif font-bold text-white leading-none tracking-tighter opacity-5 select-none italic">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-3xl md:text-6xl font-serif font-bold text-white tracking-tight italic">Lost in the stacks.</h2>
                    </div>
                </div>

                <p className="text-zinc-500 max-w-md mx-auto mb-16 text-lg font-medium italic leading-relaxed">
                    We couldn't find the page you were looking for. Maybe it's hidden in another chapter?
                </p>

                <Button
                    onClick={() => navigate('/')}
                    className="h-20 px-16 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all shadow-3xl hover:scale-105 italic"
                >
                    Back to Home
                </Button>
            </div>

            <div className="absolute bottom-12 left-0 right-0 text-center">
                <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest italic">EbookStudio v1.2</span>
            </div>
        </div>
    );
};

export default NotFoundPage;
