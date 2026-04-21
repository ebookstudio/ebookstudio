
import React from 'react';
import { IconBook } from '../constants';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                {/* Grid line */}
                <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-glow-white relative"
                >
                    <IconBook className="w-8 h-8 text-black" />
                    {/* Ring animation */}
                    <motion.div 
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 border-2 border-white rounded-full"
                    />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-center"
                >
                    <h2 className="text-sm font-black text-white tracking-[0.3em] uppercase mb-2">Syncing Workspace</h2>
                    <div className="flex gap-1 justify-center">
                        {[0, 1, 2].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1 h-1 bg-white"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
            
            <div className="absolute bottom-12 text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
                Neural OS v1.0.8 / PRODUCTION_ENV
            </div>
        </div>
    );
};

export default LoadingScreen;
