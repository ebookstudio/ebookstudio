import React from 'react';
import { motion } from 'framer-motion';
import { EBook } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { IconShoppingCart, IconBook } from '../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <Card className="bg-[#050505] border-white/5 rounded-[40px] overflow-hidden flex flex-col h-full group-hover:border-white/10 transition-all duration-700 shadow-2xl">
        {/* Cover Section */}
        <div className="aspect-[3/4] overflow-hidden relative">
            <img 
                src={book.coverImageUrl} 
                className="w-full h-full object-cover opacity-[0.9] group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                alt={book.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            
            <Badge variant="outline" className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl border-white/5 text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full text-zinc-500 group-hover:text-white transition-colors">
                {book.genre}
            </Badge>
        </div>

        {/* Content Section */}
        <CardContent className="p-8 flex flex-col flex-grow">
            <h3 className="text-white text-xl font-black mb-1.5 line-clamp-1 tracking-tight group-hover:text-white transition-colors leading-tight">
                {book.title}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600 mb-8 leading-none">
                By {book.author}
            </p>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-white text-lg font-black tracking-tighter leading-none">
                        {isFree ? 'FREE' : `$${(book.price / 100).toFixed(2)}`}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mt-1.5 leading-none">
                      Neural Sync
                    </span>
                </div>
                
                <Button 
                    onClick={handleAction}
                    className={`w-12 h-12 rounded-full p-0 flex items-center justify-center transition-all duration-700 ${
                        isFree 
                        ? 'bg-zinc-900 border border-white/5 text-zinc-500 hover:bg-white hover:text-black hover:scale-110 shadow-xl' 
                        : 'bg-white text-black hover:bg-zinc-200 hover:scale-110 shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                    }`}
                >
                    {isFree ? <IconBook className="w-5 h-5" /> : <IconShoppingCart className="w-5 h-5" />}
                </Button>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookCard;

