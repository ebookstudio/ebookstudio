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
      whileHover={{ y: -8 }}
      className="group relative cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="glass-card-premium rounded-3xl overflow-hidden flex flex-col h-full bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
        
        {/* Cover Image - Standard Book Ratio 2:3 */}
        <div className="aspect-[2/3] overflow-hidden relative">
            <img 
                src={book.coverImageUrl} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt={book.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Genre Badge */}
            <div className="absolute top-4 left-4">
                <span className="glass-panel px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border-white/5 backdrop-blur-md">
                    {book.genre}
                </span>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="type-h3 text-white mb-2 line-clamp-1 group-hover:text-white transition-colors">
                {book.title}
            </h3>
            <p className="type-tiny text-zinc-500 mb-6">
                by {book.author}
            </p>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <span className="type-h3 font-bold text-white">
                    {isFree ? 'FREE' : `$${(book.price / 100).toFixed(2)}`}
                </span>
                
                <button 
                    onClick={handleAction}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isFree 
                        ? 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white hover:text-black hover:border-white' 
                        : 'bg-white text-black hover:scale-110 shadow-lg'
                    }`}
                >
                    {isFree ? <IconBook className="w-4 h-4" /> : <IconShoppingCart className="w-4 h-4" />}
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;

