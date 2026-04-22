import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    IconRocket, IconBook, IconArrowRight, 
    IconStar, IconArrowUpRight, IconSparkles
} from '../constants';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { EBook } from '../types';

const { useNavigate } = ReactRouterDOM as any;

const MOCK_BOOKS: EBook[] = [
    { id: '1', title: "The Silent Garden", author: "Elena Voss", price: 1299, genre: "Fiction", coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format", description: "A journey through the hidden whispers of nature.", publicationDate: "2026", sellerId: "system" },
    { id: '2', title: "Modern Structures", author: "Marcus Chen", price: 1999, genre: "Design", coverImageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format", description: "The intersection of biological intelligence and digital form.", publicationDate: "2026", sellerId: "system" },
    { id: '3', title: "The Perception Shift", author: "Aria Thorne", price: 999, genre: "Philosophy", coverImageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format", description: "Exploring the boundaries of perception in the digital age.", publicationDate: "2026", sellerId: "system" },
    { id: '4', title: "Zero to Unicorn", author: "Sophia Lin", price: 2499, genre: "Business", coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format", description: "Scalable strategies for the next generation of founders.", publicationDate: "2026", sellerId: "system" },
];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Fiction", "Design", "Philosophy", "Business"];
    const filteredBooks = activeCategory === "All" ? MOCK_BOOKS : MOCK_BOOKS.filter(b => b.genre === activeCategory);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-zinc-100/10">
            
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
                
                {/* Subtle Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-100/[0.02] rounded-full blur-[120px] pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 flex flex-col items-center w-full max-w-5xl text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 mb-8 animate-fade-in">
                        <IconSparkles className="w-3.5 h-3.5 text-zinc-100" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Premium Authorship Studio</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05] text-zinc-100">
                        Craft the future of <br />
                        <span className="text-zinc-500">digital literature.</span>
                    </h1>
                    
                    <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-medium">
                        The professional sanctuary for high-fidelity literature. Elevate your thoughts into publication-ready assets with advanced AI collaboration.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          className="h-12 px-8 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-sm font-bold transition-all flex items-center gap-2"
                        >
                            Enter the Studio <IconArrowUpRight className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => navigate('/store')}
                          className="h-12 px-8 rounded-md border border-zinc-800 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800 text-sm font-bold transition-all"
                        >
                            Explore Library
                        </Button>
                    </div>
                </motion.div>

                {/* Dashboard Preview Mockup */}
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 40 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-20 w-full max-w-6xl mx-auto px-4"
                >
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-3xl shadow-2xl overflow-hidden aspect-[16/9] relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                        
                        {/* Mock Dashboard UI */}
                        <div className="h-full flex text-[8px] font-bold uppercase tracking-widest text-zinc-800">
                            <div className="w-48 border-r border-zinc-900 p-6 space-y-6 hidden md:block bg-zinc-950/80">
                                <div className="w-6 h-6 rounded bg-zinc-100 mb-8 flex items-center justify-center shadow-lg">
                                    <div className="w-3 h-3 rounded-sm bg-zinc-950" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-1.5 w-full bg-zinc-900 rounded" />
                                    <div className="h-1.5 w-3/4 bg-zinc-900 rounded opacity-50" />
                                    <div className="h-1.5 w-5/6 bg-zinc-900 rounded opacity-50" />
                                </div>
                                <div className="pt-8 space-y-4">
                                    <div className="text-[6px] text-zinc-700 uppercase tracking-[0.2em]">Workspace</div>
                                    <div className="h-1.5 w-full bg-zinc-900 rounded opacity-50" />
                                    <div className="h-1.5 w-2/3 bg-zinc-900 rounded opacity-50" />
                                </div>
                            </div>
                            <div className="flex-1 p-10 space-y-10 bg-zinc-950/40">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <div className="h-2 w-32 bg-zinc-900 rounded" />
                                        <div className="h-1 w-20 bg-zinc-900/30 rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-24 rounded-md bg-zinc-900 border border-zinc-800" />
                                        <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 rounded-xl bg-zinc-900/30 border border-zinc-800 p-5 flex flex-col justify-between">
                                            <div className="h-1.5 w-12 bg-zinc-800 rounded" />
                                            <div className="h-4 w-24 bg-zinc-100/10 rounded" />
                                            <div className="h-1.5 w-20 bg-zinc-800/50 rounded" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-64 rounded-xl bg-zinc-900/10 border border-zinc-900 relative overflow-hidden">
                                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/[0.01] to-transparent" />
                                     <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 100">
                                         <path d="M0,80 C50,70 100,90 150,60 C200,30 250,50 300,20 C350,-10 400,10 400,10 L400,100 L0,100 Z" fill="white" />
                                     </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 bg-black/60 backdrop-blur-xl">
                             <Button className="rounded-full h-20 w-20 flex items-center justify-center p-0 bg-zinc-100 text-zinc-950 hover:scale-110 shadow-2xl transition-transform border-none">
                                <IconRocket className="w-6 h-6" />
                             </Button>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="py-32 px-6 border-t border-zinc-900 bg-zinc-950">
                <div className="max-w-7xl mx-auto">
                    <header className="text-center mb-24 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100">Precision Authorship.</h2>
                        <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
                            Designed for the modern architect of words. A suite of high-density tools that integrate seamlessly with your creative process.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "AI Integration", desc: "Collaborate with an intelligence engine that understands your unique narrative style.", icon: IconSparkles },
                            { title: "Direct Publishing", desc: "Instantly publish and monetize your works to a global audience.", icon: IconRocket },
                            { title: "Studio Experience", desc: "Immersive writing environments optimized for deep concentration.", icon: IconBook }
                        ].map((feature, i) => (
                            <div key={i} className="p-10 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-700 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 text-zinc-100 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-zinc-100 tracking-tight">{feature.title}</h3>
                                <p className="text-zinc-500 leading-relaxed font-medium text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 px-6 border-t border-zinc-900 text-center relative overflow-hidden bg-zinc-950">
                 <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />
                 <div className="max-w-4xl mx-auto relative z-10 space-y-10">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100">Begin your session.</h2>
                    <p className="text-zinc-500 text-lg md:text-xl font-medium">
                        Join the collective of professionals redefining the soul of modern literature.
                    </p>
                    <div className="pt-4">
                        <Button 
                          onClick={() => navigate('/login')}
                          className="h-14 px-12 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-lg font-bold transition-all shadow-xl"
                        >
                            Get Started
                        </Button>
                    </div>
                 </div>
            </section>

        </div>
    );
};

export default HomePage;
