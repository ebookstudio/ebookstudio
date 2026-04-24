import React from 'react';
import { IconTrash } from '../constants';
import { EBook } from '../types';
import { motion } from 'framer-motion';

interface CheckoutItemProps {
    item: EBook;
    onRemove: (id: string) => void;
}

const CheckoutItem: React.FC<CheckoutItemProps> = ({ item, onRemove }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-2xl group hover:border-zinc-700/50 transition-all backdrop-blur-sm"
        >
            <div className="flex gap-8">
                <div className="w-24 h-32 flex-shrink-0 relative overflow-hidden rounded-lg border border-zinc-800 shadow-2xl">
                    <img src={item.coverImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-start mb-4 gap-6">
                        <div className="min-w-0 space-y-1">
                            <h3 className="text-zinc-100 text-xl font-bold tracking-tight truncate group-hover:text-white transition-colors">{item.title}</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Archived by {item.author}</p>
                        </div>
                        <button 
                            onClick={() => onRemove(item.id)}
                            className="w-9 h-9 rounded-full bg-zinc-950 text-zinc-700 hover:text-red-400 hover:bg-red-400/5 transition-all flex items-center justify-center border border-zinc-900 hover:border-red-400/20 active:scale-90"
                            title="Remove Asset"
                        >
                            <IconTrash className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-md group-hover:text-zinc-300 group-hover:border-zinc-700 transition-all">
                            {item.genre}
                        </div>
                        <span className="text-zinc-100 text-xl font-black tracking-tighter">${item.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CheckoutItem;
