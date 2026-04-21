import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    IconBrain, IconRocket, IconBook, IconArrowRight, 
    LogoGoogle, LogoReact, LogoTS, LogoTailwind, LogoVite 
} from '../constants';
import MorphicEye from '../components/MorphicEye';

const { Link } = ReactRouterDOM as any;

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black overflow-hidden bg-neural-mesh bg-dot-matrix">
            
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none"></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 flex flex-col items-center"
                >
                    {/* The Centerpiece */}
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full animate-pulse-slow"></div>
                        <MorphicEye className="w-32 h-32 md:w-48 md:h-48 glass-panel rounded-full" />
                    </div>

                    <h1 className="type-display text-center mb-8 text-gradient">
                        Turn Your Ideas <br /> Into Books.
                    </h1>
                    
                    <p className="type-body text-muted text-center max-w-2xl mb-12 px-4">
                        The easiest way to write, read, and sell books with the power of Studio AI.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-md sm:max-w-none px-6">
                        <Link to="/dashboard" className="btn-primary sm:px-12 py-5">
                            Start Creating <IconArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/login" className="btn-secondary sm:px-12 py-5">
                            Sign In
                        </Link>
                    </div>

                    {/* Minimalist Trust Bar */}
                    <div className="flex items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="type-tiny flex items-center gap-2">
                            <LogoGoogle className="w-3 h-3" /> Powered by Google
                        </div>
                    </div>
                </motion.div>

                {/* Hero Floor Shadow */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="type-h1 mb-6">Authoring Suite.</h2>
                        <p className="type-body text-muted max-w-xl mx-auto">Professional tools designed for high-performance creativity.</p>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        
                        {/* Main Studio Feature (Span 8) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-8 glass-card-premium p-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <IconBrain className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="type-h2 mb-4">Neural Writing Engine</h3>
                                <p className="type-small text-muted max-w-md">
                                    Our proprietary Studio AI helps you draft, refine, and polish manuscripts in record time with deep narrative consistency.
                                </p>
                            </div>
                            {/* Visual Asset Placeholder */}
                            <div className="mt-12 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                            </div>
                        </motion.div>

                        {/* Marketplace (Span 4) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-4 glass-card-premium p-12 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <IconRocket className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="type-h3 mb-4">Direct Publishing</h3>
                                <p className="type-small text-muted">
                                    Go live instantly. Keep 70% of every sale you generate through your own storefront.
                                </p>
                            </div>
                        </motion.div>

                        {/* Reader (Span 4) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-4 glass-card-premium p-12 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <IconBook className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="type-h3 mb-4">Focus Reading</h3>
                                <p className="type-small text-muted">
                                    A distraction-free interface designed for deep immersion into your favorite books.
                                </p>
                            </div>
                        </motion.div>

                        {/* Social (Span 8) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-8 glass-card-premium p-12 relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1">
                                    <h3 className="type-h2 mb-4">Global Network</h3>
                                    <p className="type-small text-muted">
                                        Join a thriving community of writers sharing insights, feedback, and success stories.
                                    </p>
                                </div>
                                <div className="flex -space-x-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-neutral-900 overflow-hidden ring-4 ring-white/5">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* --- CALL TO ACTION --- */}
            <section className="py-48 px-6 relative">
                 <div className="max-w-4xl mx-auto text-center glass-panel rounded-[40px] p-12 md:p-24 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                     <div className="relative z-10">
                        <h2 className="type-h1 mb-8">Ready to Start?</h2>
                        <p className="type-body text-muted mb-12 max-w-2xl mx-auto">
                            Join thousands of authors who are already using EbookStudio to build their literary careers.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/dashboard" className="btn-primary px-16 py-6 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                                Create Your First Book
                            </Link>
                        </div>
                     </div>
                 </div>
            </section>

            {/* --- TECH STACK --- */}
            <section className="py-24 bg-black/50 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="type-tiny text-zinc-600 mb-16 tracking-[0.5em]">The Engine Behind The Magic</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-700">
                        <LogoGoogle className="w-6 h-6" />
                        <LogoReact className="w-6 h-6" />
                        <LogoTS className="w-6 h-6" />
                        <LogoTailwind className="w-6 h-6" />
                        <LogoVite className="w-6 h-6" />
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;

