import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    IconBrain, IconRocket, IconBook, IconArrowRight, 
    LogoGoogle, LogoReact, LogoTS 
} from '../constants';
import MorphicEye from '../components/MorphicEye';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const { useNavigate } = ReactRouterDOM as any;

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#000000] selection:bg-white selection:text-black">
            
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
                {/* Background Ambience */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.015] rounded-full blur-[160px]" />
                    <div className="absolute inset-0 bg-dot-matrix opacity-[0.2]" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    className="relative z-10 flex flex-col items-center w-full max-w-6xl"
                >
                    {/* The Observer: Symmetrical Centerpiece */}
                    <div className="mb-20">
                        <MorphicEye variant="hero" className="opacity-80" />
                    </div>

                    <Badge variant="outline" className="mb-8 border-white/10 px-6 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 rounded-full bg-white/[0.02]">
                      Established Access Required
                    </Badge>

                    <h1 className="text-white text-center text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12 max-w-4xl">
                        The Neural <br /> Manuscript Engine
                    </h1>
                    
                    <p className="text-zinc-500 text-center max-w-2xl mb-16 px-4 text-xl font-medium leading-relaxed">
                        Creative sovereignty for the modern architect. <br />
                        Orchestrate literature with <span className="text-white">Studio Interface</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          className="h-16 px-12 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 shadow-2xl"
                        >
                            Initialize Console <IconArrowRight className="w-4 h-4 ml-3" />
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/pricing')}
                          className="h-16 px-12 rounded-full border-white/10 text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            View Protocols
                        </Button>
                    </div>

                    {/* Infrastructure Entities */}
                    <div className="mt-40 flex flex-col items-center gap-10 opacity-30">
                        <p className="text-[9px] tracking-[0.6em] text-zinc-600 font-black uppercase">Infrastructure Partners</p>
                        <div className="flex items-center gap-16">
                            <LogoGoogle className="w-6 h-6 grayscale" />
                            <LogoReact className="w-6 h-6 grayscale" />
                            <LogoTS className="w-6 h-6 grayscale" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- SYSTEM CAPABILITIES --- */}
            <section className="py-64 px-6 relative z-10 border-y border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-baseline justify-between mb-40 gap-12">
                        <div className="max-w-3xl">
                            <h2 className="text-white text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-none">Sovereign <br /> Architecture.</h2>
                            <p className="text-zinc-500 text-2xl font-medium leading-relaxed">
                                High-fidelity tools engineered for the transition from fragmented nodes to professional literature.
                            </p>
                        </div>
                        <div className="h-[1px] w-full lg:w-40 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Capability 01 */}
                        <Card className="bg-transparent border-white/5 rounded-[48px] overflow-hidden group hover:border-white/10 transition-all duration-700">
                          <CardContent className="p-12 flex flex-col h-full">
                              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-12 border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-700">
                                  <IconBrain className="w-7 h-7" />
                              </div>
                              <h3 className="text-white text-3xl font-black mb-6 tracking-tight">Neural Drafting</h3>
                              <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-12 flex-grow">
                                  Automated narrative synthesis. Our engine understands structure, tone, and depth to maintain world-building consistency.
                              </p>
                              <div className="aspect-square bg-white/[0.02] rounded-3xl border border-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-1000">
                                <div className="w-1/2 h-[1px] bg-white/20 relative">
                                  <div className="absolute inset-0 bg-white shadow-[0_0_20px_white] w-1/4 animate-scanline" />
                                </div>
                              </div>
                          </CardContent>
                        </Card>

                        {/* Capability 02 */}
                        <Card className="bg-transparent border-white/5 rounded-[48px] overflow-hidden group hover:border-white/10 transition-all duration-700">
                          <CardContent className="p-12 flex flex-col h-full">
                              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-12 border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-700">
                                  <IconRocket className="w-7 h-7" />
                              </div>
                              <h3 className="text-white text-3xl font-black mb-6 tracking-tight">Direct Commerce</h3>
                              <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-12 flex-grow">
                                  Establish your own storefront. Retain 100% ownership of your intellectual fragments and distribution channels.
                              </p>
                              <div className="aspect-square bg-white/[0.02] rounded-3xl border border-white/5 p-10 opacity-40 group-hover:opacity-100 transition-all duration-1000">
                                <div className="w-full h-full border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Protocol Ready</span>
                                </div>
                              </div>
                          </CardContent>
                        </Card>

                        {/* Capability 03 */}
                        <Card className="bg-transparent border-white/5 rounded-[48px] overflow-hidden group hover:border-white/10 transition-all duration-700">
                          <CardContent className="p-12 flex flex-col h-full">
                              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-12 border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-700">
                                  <IconBook className="w-7 h-7" />
                              </div>
                              <h3 className="text-white text-3xl font-black mb-6 tracking-tight">Focus Protocol</h3>
                              <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-12 flex-grow">
                                  A distraction-free synthesis interface. Minimized cognitive load for maximum immersion.
                              </p>
                              <div className="aspect-square bg-white/[0.02] rounded-3xl border border-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-1000">
                                <MorphicEye variant="logo" className="scale-150" />
                              </div>
                          </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* --- CALL TO ACTION --- */}
            <section className="py-80 px-6 relative bg-black">
                 <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-white text-6xl md:text-9xl font-black tracking-tighter mb-16 leading-none">Manifest <br /> Your Vision.</h2>
                        <p className="text-zinc-500 text-2xl font-medium mb-20 max-w-3xl mx-auto leading-relaxed">
                            Join the next iteration of creators who are architecting the future of digital literature.
                        </p>
                        <Button 
                          onClick={() => navigate('/login')}
                          className="h-20 px-20 rounded-full bg-white text-black hover:bg-zinc-200 text-sm font-black uppercase tracking-widest shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-all hover:scale-110"
                        >
                            Establish Protocol Access
                        </Button>
                    </motion.div>
                 </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-32 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="flex items-center gap-6">
                            <MorphicEye variant="logo" className="opacity-30" />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">ebookstudio</span>
                        </div>
                        
                        <div className="flex items-center gap-16 opacity-10">
                            <LogoReact className="w-6 h-6 grayscale" />
                            <LogoTS className="w-6 h-6 grayscale" />
                        </div>
                        
                        <p className="text-[10px] text-zinc-800 font-black tracking-[0.2em] uppercase">
                            © 2026 opendev-labs
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default HomePage;

