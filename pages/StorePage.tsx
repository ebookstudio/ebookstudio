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

        {/* --- BOOK DETAIL DIALOG --- */}
        <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
            {selectedBook && (
                <DialogContent className="max-w-5xl p-0 bg-zinc-950 border border-border rounded-xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 h-full lg:h-[700px]">
                        <div className="lg:col-span-5 bg-zinc-900 p-12 lg:p-16 flex items-center justify-center border-r border-border">
                            <img 
                                src={selectedBook.coverImageUrl} 
                                alt={selectedBook.title} 
                                className="w-full max-w-[320px] h-auto rounded-lg shadow-2xl border border-border"
                            />
                        </div>
                        <div className="lg:col-span-7 flex flex-col">
                            <ScrollArea className="flex-1 p-12 lg:p-16">
                                <DialogHeader className="mb-12 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                            {selectedBook.genre}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(i => <IconStar key={i} className="w-3 h-3 text-zinc-500" />)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <DialogTitle className="text-4xl font-bold tracking-tight text-zinc-100">
                                            {selectedBook.title}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                            By {selectedBook.author}
                                        </DialogDescription>
                                    </div>
                                </DialogHeader>
                                
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            {selectedBook.description}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 rounded-lg bg-zinc-900 border border-border">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Published</p>
                                            <p className="text-zinc-200 font-bold text-sm">{selectedBook.publicationDate}</p>
                                        </div>
                                        <div className="p-6 rounded-lg bg-zinc-900 border border-border">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Quality</p>
                                            <p className="text-emerald-500 font-bold text-sm uppercase tracking-wider">Premium Grade</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            
                            <div className="p-12 lg:p-16 bg-zinc-900 border-t border-border flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Purchase Price</span>
                                    <p className="text-3xl font-bold text-zinc-100">${selectedBook.price.toFixed(2)}</p>
                                </div>
                                <Button 
                                    onClick={() => {
                                        addToCart(selectedBook);
                                        setSelectedBook(null);
                                    }}
                                    disabled={isInCart(selectedBook.id)}
                                    className="h-12 px-10 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl"
                                >
                                    {isInCart(selectedBook.id) ? (
                                        <>In Cart <IconCheck className="w-4 h-4" /></>
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
