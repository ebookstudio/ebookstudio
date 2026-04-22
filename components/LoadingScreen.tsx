import React from 'react';
import { IconBook } from '../constants';
import { motion } from 'framer-motion';
import CoAuthor from './CoAuthor';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center font-sans overflow-hidden">
            <div className="relative z-10 flex flex-col items-center space-y-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "circOut" }}
                >
                    <CoAuthor size="md" className="shadow-2xl shadow-white/5" />
                </motion.div>

                <div className="text-center space-y-4">
                    <motion.h2 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-[10px] font-black text-zinc-100 tracking-[0.4em] uppercase"
                    >
                        Initializing Studio
                    </motion.h2>
                    
                    <div className="flex gap-1.5 justify-center">
                        {[0, 1, 2].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ opacity: [0.1, 1, 0.1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1 h-1 bg-zinc-100 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-12 text-[9px] text-zinc-800 font-bold tracking-[0.3em] uppercase">
                Enterprise Edition / v2.0.4
            </div>
        </div>
    );
};

export default LoadingScreen;
