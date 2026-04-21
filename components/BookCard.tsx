import React from 'react';
import { motion } from 'framer-motion';
import { EBook } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { IconShoppingCart, IconBook } from '../constants'; 
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

interface BookCardProps {
  book: EBook;
  onViewDetails?: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onViewDetails }) => {
  const { addToCart } = useAppContext();
  const navigate = useNavigate();

  const isFree = book.price === 0;

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isFree) navigate(`/read/${book.id}`);
    else addToCart(book);
  };
  
  const handleCardClick = () => {
    if (onViewDetails) onViewDetails(book.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      className="group relative cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="glass-card-premium rounded-[32px] overflow-hidden flex flex-col h-full bg-[#080808] border-white/5 group-hover:border-white/10 transition-all duration-700">
        
        {/* Cover Canvas */}
        <div className="aspect-[2/3] overflow-hidden relative">
            <img 
                src={book.coverImageUrl} 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1500ms]" 
                alt={book.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
            
            {/* Semantic Badge */}
            <div className="absolute top-6 left-6">
                <span className="bg-black/40 backdrop-blur-3xl px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-white/5 text-zinc-400">
                    {book.genre}
                </span>
            </div>
        </div>

        {/* Intelligence Content */}
        <div className="p-8 flex flex-col flex-grow">
            <h3 className="text-white text-xl font-black mb-1 line-clamp-1 group-hover:text-white transition-colors tracking-tight">
                {book.title}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-600 mb-8">
                By {book.author}
            </p>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-white text-lg font-black">
                    {isFree ? 'FREE' : `$${(book.price / 100).toFixed(2)}`}
                </span>
                
                <button 
                    onClick={handleAction}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-700 ${
                        isFree 
                        ? 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white hover:text-black shadow-xl' 
                        : 'bg-white text-black hover:scale-110 shadow-[0_10px_30px_rgba(255,255,255,0.2)]'
                    }`}
                >
                    {isFree ? <IconBook className="w-5 h-5" /> : <IconShoppingCart className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;

