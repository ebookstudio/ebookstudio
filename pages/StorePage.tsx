import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    IconShoppingCart, IconSearch, IconCheck, IconArrowRight,
    IconStar
} from '../constants';
import MorphicEye from '../components/MorphicEye';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

  const spotlightBook = useMemo(() => allBooks[0], [allBooks]);

  return (
    <div className="min-h-screen bg-[#000000] pt-32 pb-40 selection:bg-white selection:text-black">
      <div className="fixed inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.02] rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
      </div>

      <div className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10">
        
        {/* --- STORE HEADER --- */}
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-3xl">
                <Badge variant="outline" className="px-6 py-1.5 border-white/10 text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] rounded-full bg-white/5 mb-8">
                    Neural Marketplace / v1.0
                </Badge>
                <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">Archive.</h1>
                <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                    Discover synthetic manuscripts and human-authored masterpieces synchronized for your creative expansion.
                </p>
            </div>
            <div className="flex items-center gap-6">
                <Button 
                    variant="outline"
                    onClick={() => navigate('/checkout')}
                    className="h-20 px-10 rounded-full border-white/5 bg-[#050505] hover:bg-[#0a0a0a] transition-all relative group shadow-2xl"
                >
                    <IconShoppingCart className="w-5 h-5 text-white mr-4" />
                    <span className="type-tiny text-white">Neural Cart</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black text-[10px] font-black flex items-center justify-center rounded-full shadow-2xl animate-pulse">
                            {cart.length}
                        </span>
                    )}
                </Button>
            </div>
        </header>

        {/* --- SPOTLIGHT SECTION --- */}
        {spotlightBook && (
            <section className="mb-32">
                <Card className="bg-[#050505] border-white/10 rounded-[64px] overflow-hidden group shadow-2xl relative">
                    <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] group-hover:bg-white/[0.05] transition-all duration-1000" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-12 lg:p-24 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-10">
                                <Badge className="bg-white text-black hover:bg-zinc-200 px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
                                    Featured Protocol
                                </Badge>
                                <span className="type-tiny opacity-30">Archive Spotlight</span>
                            </div>
                            <h2 className="text-white text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-8 group-hover:scale-[1.01] transition-transform duration-700">
                                {spotlightBook.title}
                            </h2>
                            <p className="text-zinc-500 text-lg leading-relaxed mb-12 max-w-lg">
                                {spotlightBook.description.slice(0, 180)}...
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <Button 
                                    onClick={() => setSelectedBook(spotlightBook)}
                                    className="h-16 px-12 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl"
                                >
                                    <span className="type-tiny">Analyze Metadata</span>
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => addToCart(spotlightBook)}
                                    disabled={isInCart(spotlightBook.id)}
                                    className="h-16 px-12 rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 transition-all"
                                >
                                    <span className="type-tiny">{isInCart(spotlightBook.id) ? 'Archive Ingested' : 'Ingest Fragment'}</span>
                                </Button>
                            </div>
                        </div>
                        <div className="relative h-[400px] lg:h-auto bg-[#0a0a0a] flex items-center justify-center p-12 overflow-hidden border-l border-white/5">
                            <div className="relative group/cover">
                                <div className="absolute inset-0 bg-white/20 rounded-[32px] blur-3xl opacity-0 group-hover/cover:opacity-30 transition-all duration-1000 scale-75" />
                                <img 
                                    src={spotlightBook.coverImageUrl} 
                                    alt={spotlightBook.title} 
                                    className="w-64 lg:w-80 h-auto rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-1000 grayscale-[0.3] group-hover:grayscale-0"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
        )}

        {/* --- FILTER INTERFACE --- */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-20">
            <div className="relative flex-1 group">
                <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                <Input 
                    placeholder="Query Archive By Title, Author, or Tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-20 pl-16 pr-8 bg-[#050505] border-white/5 rounded-[32px] text-white placeholder:text-zinc-700 focus:border-white/20 focus:ring-0 transition-all shadow-2xl"
                />
            </div>
            <div className="w-full md:w-72">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="h-20 px-8 bg-[#050505] border-white/5 rounded-[32px] text-white focus:ring-0 shadow-2xl">
                        <SelectValue placeholder="Genre Classification" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl p-2">
                        {genres.map(g => (
                            <SelectItem key={g} value={g} className="rounded-xl py-3 hover:bg-white/5 focus:bg-white/5 transition-colors cursor-pointer">
                                <span className="type-tiny">{g}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* --- BOOK GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredBooks.map((book) => (
                <Card 
                    key={book.id} 
                    className="bg-[#050505] border-white/5 rounded-[48px] overflow-hidden group hover:border-white/20 transition-all duration-700 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.4)]"
                >
                    <div className="relative aspect-[3/4] overflow-hidden p-8">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                        <img 
                            src={book.coverImageUrl} 
                            alt={book.title} 
                            className="w-full h-full object-cover rounded-3xl transform group-hover:scale-110 transition-transform duration-1000 grayscale-[0.5] group-hover:grayscale-0 shadow-2xl"
                        />
                        <div className="absolute bottom-10 left-10 right-10 z-20 flex justify-between items-end">
                            <Badge className="bg-black/80 backdrop-blur-md text-white border-white/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full">
                                {book.genre}
                            </Badge>
                            <span className="text-white text-3xl font-black tracking-tighter">${book.price.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <CardContent className="p-10 pt-4">
                        <h3 className="text-white text-2xl font-black tracking-tighter leading-tight mb-2 group-hover:text-zinc-300 transition-colors">{book.title}</h3>
                        <p className="type-tiny opacity-40 mb-8">{book.author}</p>
                        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-10">
                            {book.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant="outline"
                                onClick={() => setSelectedBook(book)}
                                className="h-14 rounded-full border-white/5 bg-white/5 text-white hover:bg-white/10 transition-all"
                            >
                                <span className="type-tiny">Details</span>
                            </Button>
                            <Button 
                                onClick={() => addToCart(book)}
                                disabled={isInCart(book.id)}
                                className="h-14 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-xl"
                            >
                                <span className="type-tiny">{isInCart(book.id) ? <IconCheck className="w-4 h-4" /> : 'Ingest'}</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* --- BOOK DETAIL DIALOG --- */}
        <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
            {selectedBook && (
                <DialogContent className="max-w-5xl p-0 bg-[#020202] border-white/10 rounded-[48px] overflow-hidden shadow-[0_0_150px_rgba(255,255,255,0.05)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 h-full lg:h-[700px]">
                        <div className="lg:col-span-5 relative bg-[#050505] p-12 lg:p-20 flex items-center justify-center border-r border-white/5">
                            <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />
                            <img 
                                src={selectedBook.coverImageUrl} 
                                alt={selectedBook.title} 
                                className="w-full max-w-[300px] h-auto rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5"
                            />
                        </div>
                        <div className="lg:col-span-7 flex flex-col">
                            <ScrollArea className="flex-1 p-12 lg:p-20">
                                <DialogHeader className="mb-12">
                                    <div className="flex items-center gap-4 mb-8">
                                        <Badge variant="outline" className="px-4 py-1 border-white/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full bg-emerald-500/5">
                                            Archive Verified
                                        </Badge>
                                        <Separator orientation="vertical" className="h-4 bg-white/10" />
                                        <span className="type-tiny opacity-30">{selectedBook.genre}</span>
                                    </div>
                                    <DialogTitle className="text-white text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4">
                                        {selectedBook.title}
                                    </DialogTitle>
                                    <DialogDescription className="type-tiny text-zinc-500">
                                        Protocol Initialized By {selectedBook.author}
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-10">
                                    <div>
                                        <h4 className="type-tiny mb-4 opacity-30">Metadata Overview</h4>
                                        <p className="text-zinc-400 text-lg leading-relaxed">
                                            {selectedBook.description}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                            <p className="type-tiny opacity-30 mb-2">Publication</p>
                                            <p className="text-white font-mono text-xs">{selectedBook.publicationDate}</p>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                            <p className="type-tiny opacity-30 mb-2">Complexity</p>
                                            <p className="text-white font-mono text-xs">Standard Archive</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            
                            <div className="p-12 lg:p-20 bg-[#050505] border-t border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="type-tiny opacity-30 mb-2">Acquisition Fee</span>
                                    <span className="text-white text-5xl font-black tracking-tighter">${selectedBook.price.toFixed(2)}</span>
                                </div>
                                <Button 
                                    onClick={() => {
                                        addToCart(selectedBook);
                                        setSelectedBook(null);
                                    }}
                                    disabled={isInCart(selectedBook.id)}
                                    className="h-20 px-16 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl"
                                >
                                    <span className="type-tiny">{isInCart(selectedBook.id) ? 'Ingested' : 'Ingest Fragment'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
      </div>
    </div>
  );
};

export default StorePage;
