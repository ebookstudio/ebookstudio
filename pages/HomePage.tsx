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
        <div className="min-h-screen bg-[#000000] overflow-hidden">
            
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6">
                {/* Background Ambience */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-dot-matrix opacity-[0.4]" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    className="relative z-10 flex flex-col items-center w-full max-w-5xl"
                >
                    {/* The Centerpiece: MorphicEye Friend */}
                    <div className="mb-16">
                        <div className="relative p-1 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                            <MorphicEye variant="hero" className="w-40 h-40 md:w-56 md:h-56 rounded-full" />
                        </div>
                    </div>

                    <h1 className="type-display text-center mb-10 text-white tracking-tight leading-[1.05]">
                        The Neural <br /> Manuscript Engine
                    </h1>
                    
                    <p className="type-body text-zinc-400 text-center max-w-2xl mb-16 px-4 text-lg leading-relaxed">
                        Redefining literature for the sovereign creator. <br />
                        Powered by <span className="text-white font-semibold">Studio AI</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md sm:max-w-none justify-center">
                        <Link to="/dashboard" className="btn-primary rounded-full group">
                            Start Writing <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                        <Link to="/pricing" className="btn-secondary rounded-full">
                            View Plans
                        </Link>
                    </div>

                    {/* Trust Indicator */}
                    <div className="mt-32 flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                        <p className="type-tiny text-[9px] tracking-[0.4em] text-zinc-500 font-black">Trusted by Global Entities</p>
                        <div className="flex items-center gap-12 grayscale">
                            <LogoGoogle className="w-5 h-5" />
                            <LogoReact className="w-5 h-5" />
                            <LogoTS className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- CORE CAPABILITIES --- */}
            <section className="py-48 px-6 relative z-10 border-t border-white/5 bg-[#030303]">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-10">
                        <div className="max-w-2xl">
                            <h2 className="type-h1 text-white text-5xl md:text-7xl font-black mb-8">Creative Sovereignty.</h2>
                            <p className="type-body text-zinc-500 text-xl leading-relaxed">
                                A holistic suite of tools designed to transform fragmented thoughts into professional literature.
                            </p>
                        </div>
                        <div className="h-[2px] flex-grow bg-white/5 mx-12 hidden lg:block" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card-premium p-12 h-full flex flex-col">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10">
                                <IconBrain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="type-h2 text-white mb-6 text-2xl">Neural Drafting</h3>
                            <p className="type-body text-zinc-500 mb-10 flex-grow">
                                Studio AI understands narrative structure, tone, and pacing, helping you generate high-fidelity manuscripts with consistent world-building.
                            </p>
                            <div className="h-40 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card-premium p-12 h-full flex flex-col">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10">
                                <IconRocket className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="type-h2 text-white mb-6 text-2xl">Direct Commerce</h3>
                            <p className="type-body text-zinc-500 mb-10 flex-grow">
                                Skip the gatekeepers. Publish directly to your personalized storefront and maintain 100% control over your intellectual property.
                            </p>
                            <div className="h-40 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                <div className="w-full h-full bg-dot-matrix opacity-20" />
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card-premium p-12 h-full flex flex-col">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10">
                                <IconBook className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="type-h2 text-white mb-6 text-2xl">Focus Protocol</h3>
                            <p className="type-body text-zinc-500 mb-10 flex-grow">
                                A distraction-free reading and writing interface inspired by Obsidian luxury, focused on cognitive flow and immersion.
                            </p>
                            <div className="h-40 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                                <MorphicEye variant="logo" className="w-12 h-12 opacity-30" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CALL TO ACTION --- */}
            <section className="py-64 px-6 relative bg-black">
                 <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="glass-card-premium rounded-[60px] p-20 md:p-32 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="type-h1 text-white text-5xl md:text-7xl mb-10">Manifest <br /> Your Vision.</h2>
                            <p className="type-body text-zinc-500 text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
                                Join a new generation of creators who are defining the future of digital literature.
                            </p>
                            <div className="flex justify-center">
                                <Link to="/login" className="btn-primary rounded-full px-20 py-6 text-base">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                 </div>
            </section>

            {/* --- FOOTER / TECH --- */}
            <footer className="py-24 border-t border-white/5 bg-black">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex items-center gap-4">
                            <MorphicEye variant="logo" className="w-8 h-8 opacity-50" />
                            <span className="type-tiny text-zinc-500 tracking-[0.5em] font-black uppercase">ebookstudio</span>
                        </div>
                        
                        <div className="flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                            <LogoTailwind className="w-5 h-5" />
                            <LogoVite className="w-5 h-5" />
                            <LogoTS className="w-5 h-5" />
                        </div>
                        
                        <p className="type-tiny text-zinc-700 text-[10px] tracking-widest uppercase">
                            © 2026 opendev-labs
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default HomePage;

