import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    IconShoppingCart, IconSearch, IconCheck, IconArrowRight,
    IconStar
} from '../constants';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription 
} from '../components/ui/dialog';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';
import BookCard from '../components/BookCard';

const { useNavigate } = ReactRouterDOM as any;

const StorePage: React.FC = () => {
  const { allBooks, addToCart, cart } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedBook, setSelectedBook] = useState<EBook | null>(null);

  const genres = useMemo(() => ['All', ...Array.from(new Set(allBooks.map(b => b.genre)))], [allBooks]);

  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [allBooks, searchTerm, selectedGenre]);

  const isInCart = (id: string) => cart.some(item => item.id === id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary/30">
      
      {/* --- STORE HEADER --- */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[1600px] mx-auto space-y-12">
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-3xl space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-[1px] bg-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Premium Marketplace</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">The Library</h1>
                  <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-xl">
                      Explore a curated collection of high-fidelity digital assets and architectural insights.
                  </p>
              </div>
              <div className="flex items-center gap-4">
                  <Button 
                      onClick={() => navigate('/checkout')}
                      className="h-12 px-8 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all relative font-bold text-xs uppercase tracking-wider flex items-center gap-3 shadow-xl"
                  >
                      <IconShoppingCart className="w-4 h-4" />
                      Cart
                      {cart.length > 0 && (
                          <span className="bg-primary text-primary-foreground w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full">
                              {cart.length}
                          </span>
                      )}
                  </Button>
              </div>
          </header>

          {/* --- FILTER INTERFACE --- */}
          <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 group w-full">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-200 transition-colors" />
                  <input 
                      placeholder="Search publications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 bg-zinc-900 border border-border rounded-md text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all text-sm font-medium"
                  />
              </div>
              <div className="w-full md:w-64">
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger className="h-12 px-6 bg-zinc-900 border border-border rounded-md text-zinc-200 focus:ring-0 text-[10px] font-bold uppercase tracking-wider">
                          <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-border text-zinc-200">
                          {genres.map(g => (
                              <SelectItem key={g} value={g} className="text-[10px] font-bold uppercase tracking-wider px-6">
                                  {g}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1600px] mx-auto px-6 pb-32">
        {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {filteredBooks.map((book) => (
                    <BookCard 
                        key={book.id} 
                        book={book} 
                        onViewDetails={() => setSelectedBook(book)}
                    />
                ))}
            </div>
        ) : (
            <div className="py-32 text-center border border-dashed border-border rounded-xl bg-zinc-900/30">
                <IconSearch className="w-12 h-12 mx-auto mb-4 text-zinc-800" />
                <h3 className="text-xl font-bold text-zinc-500">No matching items found</h3>
                <p className="text-sm text-zinc-600 mt-2">Try adjusting your filters or search terms.</p>
            </div>
        )}

        {/* --- PREMIUM BOOK DETAIL DIALOG --- */}
        <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
            {selectedBook && (
                <DialogContent className="max-w-6xl p-0 bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] lg:h-[750px]">
                        
                        {/* Left Column: Cinematic Visual Area */}
                        <div className="lg:col-span-5 bg-[#080808] relative flex items-center justify-center p-12 overflow-hidden border-r border-zinc-900">
                             {/* Ambient Glow Background */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-zinc-100/[0.03] blur-[120px] rounded-full pointer-events-none" />
                             
                             <div className="relative group perspective-1000">
                                <img 
                                    src={selectedBook.coverImageUrl} 
                                    alt={selectedBook.title} 
                                    className="w-full max-w-[340px] h-auto rounded-lg shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-zinc-800 transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Bottom Reflection Effect */}
                                <div className="absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-t from-transparent to-zinc-950/20 blur-xl opacity-40 scale-x-90" />
                             </div>

                             <div className="absolute bottom-8 left-10 flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">High Fidelity Asset</span>
                             </div>
                        </div>

                        {/* Right Column: Detailed Intelligence Area */}
                        <div className="lg:col-span-7 flex flex-col bg-[#020202]">
                            <ScrollArea className="flex-1">
                                <div className="p-12 lg:p-20 space-y-16">
                                    <header className="space-y-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-zinc-100 text-zinc-950 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border-none shadow-glow-sm">
                                                    {selectedBook.genre}
                                                </Badge>
                                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Master Edition</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {[1, 2, 3, 4, 5].map(i => <IconStar key={i} className="w-3 h-3 text-zinc-400 fill-zinc-400" />)}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] text-zinc-100">
                                                {selectedBook.title}
                                            </h2>
                                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">
                                                Orchestrated by {selectedBook.author}
                                            </p>
                                        </div>
                                    </header>
                                    
                                    <div className="space-y-16">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-4">
                                                <span>Abstract</span>
                                                <div className="h-px flex-1 bg-zinc-900/50" />
                                            </h4>
                                            <p className="text-zinc-400 text-[15px] leading-relaxed font-medium">
                                                {selectedBook.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 transition-all hover:bg-zinc-900/60 group">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 group-hover:text-zinc-400 transition-colors">Integration Date</p>
                                                <p className="text-zinc-100 font-bold text-lg tabular-nums">{selectedBook.publicationDate}</p>
                                            </div>
                                            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 transition-all hover:bg-zinc-900/60 group">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 group-hover:text-zinc-400 transition-colors">Processing Quality</p>
                                                <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    Neural Optimized
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            
                            {/* Action Bar Footer */}
                            <div className="p-12 lg:px-20 lg:py-10 bg-[#050505] border-t border-zinc-900 flex items-center justify-between mt-auto">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Access Fee</span>
                                    <p className="text-4xl font-black text-zinc-100 tracking-tighter">${selectedBook.price.toFixed(2)}</p>
                                </div>
                                <Button 
                                    onClick={() => {
                                        addToCart(selectedBook);
                                        setSelectedBook(null);
                                    }}
                                    disabled={isInCart(selectedBook.id)}
                                    className={cn(
                                        "h-14 px-12 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl",
                                        isInCart(selectedBook.id)
                                            ? "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
                                            : "bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                                    )}
                                >
                                    {isInCart(selectedBook.id) ? (
                                        <>Item in Cart <IconCheck className="w-4 h-4" /></>
                                    ) : (
                                        <>Add to Cart <IconArrowRight className="w-4 h-4" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
      </main>
    </div>
  );
};

export default StorePage;
