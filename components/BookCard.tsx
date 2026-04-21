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
      whileHover={{ y: -10 }}
      className="group relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 3D-Like Card Container */}
      <div className="glass-card-premium rounded-[32px] overflow-hidden flex flex-col h-full border border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
        
        {/* Cover Image with Depth */}
        <div className="aspect-[3/4] overflow-hidden relative">
            <img 
                src={book.coverImageUrl} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={book.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            
            {/* Genre Badge */}
            <div className="absolute top-6 left-6">
                <span className="glass-panel px-3 py-1 text-[8px] font-bold uppercase tracking-[0.3em] rounded-full border-white/10">
                    {book.genre}
                </span>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-8 flex flex-col flex-grow">
            <h3 className="text-xl font-bold title-neural mb-2 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                {book.title}
            </h3>
            <p className="text-[10px] text-muted uppercase tracking-widest font-medium mb-6">
                {book.author}
            </p>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-xl font-bold font-display">
                    {isFree ? 'FREE' : `₹${book.price}`}
                </span>
                
                <button 
                    onClick={handleAction}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isFree 
                        ? 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-black' 
                        : 'bg-white text-black hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }`}
                >
                    {isFree ? <IconBook className="w-4 h-4" /> : <IconShoppingCart className="w-4 h-4" />}
                </button>
            </div>
        </div>
      </div>

      {/* Decorative Glow behind the card on hover */}
      <div className="absolute -inset-4 bg-white/5 blur-[40px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </motion.div>
  );
};

export default BookCard;
