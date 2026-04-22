import React from 'react';
import { motion } from 'framer-motion';
import { EBook } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { IconShoppingCart, IconBook, IconArrowUpRight } from '../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

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
    else navigate(`/read/${book.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative cursor-pointer flex flex-col h-full overflow-hidden bg-zinc-900 border border-border rounded-xl transition-all hover:border-zinc-700 hover:shadow-2xl"
      onClick={handleCardClick}
    >
        {/* Cover Section */}
        <div className="aspect-[3/4] overflow-hidden relative bg-zinc-950">
            <img 
                src={book.coverImageUrl} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                alt={book.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
            
            <div className="absolute top-3 right-3">
                <Badge className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                    {book.genre}
                </Badge>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <IconArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow space-y-3">
            <div>
              <h3 className="text-zinc-100 text-sm font-bold tracking-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {book.title}
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {book.author}
              </p>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between border-t border-zinc-800/50">
                <span className="text-sm font-bold text-zinc-100">
                    {isFree ? 'Free' : `$${(book.price / 100).toFixed(2)}`}
                </span>
                
                <Button 
                    size="sm"
                    variant="ghost"
                    onClick={handleAction}
                    className="h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                    {isFree ? 'Read' : 'Add to Cart'}
                </Button>
            </div>
        </div>
    </motion.div>
  );
};

export default BookCard;
