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
            
            {/* --- $1M HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none"></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 flex flex-col items-center"
                >
                    {/* The Centerpiece Little Friend */}
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full animate-pulse-slow"></div>
                        <MorphicEye className="w-32 h-32 md:w-48 md:h-48 glass-panel rounded-full" />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-center tracking-tighter mb-8 leading-[0.9] text-gradient">
                        Turn Your Ideas <br /> Into Books.
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-muted text-center max-w-2xl mb-12 font-light">
                        The easiest way to write, read, and sell books with the power of Studio AI.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 mb-16">
                        <Link to="/dashboard" className="btn-premium px-12 py-5 text-xs">
                            Start Creating <IconArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/login" className="btn-premium-outline px-12 py-5 text-xs">
                            Sign In
                        </Link>
                    </div>

                    {/* Minimalist Trust Bar */}
                    <div className="flex items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-bold">
                            <LogoGoogle className="w-4 h-4" /> Powered by Google
                        </div>
                    </div>
                </motion.div>

                {/* Hero Floor Shadow */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
            </section>

            {/* --- $1M BENTO GRID FEATURES --- */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Authoring Suite.</h2>
                        <p className="text-muted text-lg max-w-xl mx-auto">Professional tools designed for high-performance creativity.</p>
                    </div>

                    <div className="bento-grid">
                        
                        {/* Main Studio Feature (Span 8) */}
                        <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="bento-item bento-item-8 glass-card-premium rounded-[40px] p-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <IconBrain className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold mb-6">Neural Writing Engine</h3>
                                <p className="text-muted text-lg max-w-md">
                                    Our proprietary Studio AI helps you draft, refine, and polish manuscripts in record time.
                                </p>
                            </div>
                            {/* Visual Asset Placeholder */}
                            <div className="mt-12 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5 animate-shimmer"></div>
                        </motion.div>

                        {/* Marketplace (Span 4) */}
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bento-item bento-item-4 glass-card-premium rounded-[40px] p-12 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <IconRocket className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-6">Direct <br />Publishing</h3>
                                <p className="text-muted text-sm leading-relaxed">
                                    Go live instantly. Keep 70% of every sale you generate through your own storefront.
                                </p>
                            </div>
                        </motion.div>

                        {/* Reader (Span 4) */}
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bento-item bento-item-4 glass-card-premium rounded-[40px] p-12 flex flex-col justify-between border-l-0"
                        >
                            <div>
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <IconBook className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-6">Focus <br />Reading</h3>
                                <p className="text-muted text-sm leading-relaxed">
                                    A distraction-free interface designed for deep immersion into your favorite books.
                                </p>
                            </div>
                        </motion.div>

                        {/* Social (Span 8) */}
                        <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="bento-item bento-item-8 glass-card-premium rounded-[40px] p-12 relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1">
                                    <h3 className="text-4xl font-bold mb-6">Global Authors Network</h3>
                                    <p className="text-muted text-lg">
                                        Join a thriving community of writers sharing insights, feedback, and success stories.
                                    </p>
                                </div>
                                <div className="flex -space-x-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-16 h-16 rounded-full border-4 border-black bg-neutral-900 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* --- $1M CALL TO ACTION --- */}
            <section className="py-48 px-6 relative">
                 <div className="max-w-4xl mx-auto text-center glass-panel rounded-[60px] p-24 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                     <div className="relative z-10">
                        <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter">Ready to Start?</h2>
                        <p className="text-xl text-muted mb-16 max-w-2xl mx-auto font-light leading-relaxed">
                            Join thousands of authors who are already using EbookStudio to build their literary careers.
                        </p>
                        <Link to="/dashboard" className="btn-premium px-16 py-6 text-sm mx-auto shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            Create Your First Book
                        </Link>
                     </div>
                 </div>
            </section>

            {/* --- TECH STACK (LUXURY) --- */}
            <section className="py-24 bg-black/50 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-600 mb-16">The Engine Behind The Magic</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-700">
                        <LogoGoogle className="w-8 h-8" />
                        <LogoReact className="w-8 h-8" />
                        <LogoTS className="w-8 h-8" />
                        <LogoTailwind className="w-8 h-8" />
                        <LogoVite className="w-8 h-8" />
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
