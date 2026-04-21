import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import BookCard from '../components/BookCard';
import { EBook } from '../types';
import { IconSearch, IconStar, IconArrowRight } from '../constants';
import Modal from '../components/Modal'; 
import CustomDropdown, { DropdownOption } from '../components/CustomDropdown';
import { useAppContext } from '../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import MorphicEye from '../components/MorphicEye';

const { useNavigate } = ReactRouterDOM as any;

const StorePage: React.FC = () => {
  const { addToCart, allBooks } = useAppContext(); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy] = useState('publicationDate'); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<EBook | null>(null);

  const genres = useMemo(() => ['All', ...new Set(allBooks.map(book => book.genre))], [allBooks]);
  const genreOptions: DropdownOption[] = genres.map(g => ({ label: g === 'All' ? 'All Genres' : g, value: g }));
  
  const priceOptions: DropdownOption[] = [
      { label: 'All Prices', value: 'All' },
      { label: 'Free Only', value: 'Free' },
      { label: 'Paid Only', value: 'Paid' },
  ];

  const filteredAndSortedBooks = useMemo(() => {
    let books = allBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedGenre !== 'All') books = books.filter(book => book.genre === selectedGenre);
    
    if (selectedPriceFilter === 'Free') books = books.filter(book => book.price === 0);
    else if (selectedPriceFilter === 'Paid') books = books.filter(book => book.price > 0);

    return books.sort((a, b) => {
      return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
    });
  }, [searchTerm, selectedGenre, selectedPriceFilter, allBooks]);

  const featuredBook = useMemo(() => {
      return allBooks.find(b => b.title.includes("Manual")) || allBooks.find(b => b.price > 0) || allBooks[0];
  }, [allBooks]);

  const handleViewDetails = (bookId: string) => {
    const book = allBooks.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setIsModalOpen(true);
    }
  };

  const handleModalAction = () => {
    if (selectedBook) {
        if (selectedBook.price === 0) navigate(`/read/${selectedBook.id}`);
        else addToCart(selectedBook);
        setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-white/[0.01] rounded-full blur-[160px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.2]" />
      </div>

      {/* --- FEATURED SECTION --- */}
      <section className="relative pt-48 px-6 pb-20 z-10">
          {featuredBook && !searchTerm && selectedGenre === 'All' && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="max-w-screen-xl mx-auto relative group"
            >
                <div className="glass-card-premium p-10 md:p-24 overflow-hidden relative min-h-[600px] flex items-center rounded-[60px] border-white/5 shadow-2xl">
                    <div className="absolute inset-0 z-0">
                        <img src={featuredBook.coverImageUrl} className="w-full h-full object-cover opacity-20 scale-110 transition-transform duration-[3000ms] group-hover:scale-100" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-16 md:gap-24 items-center w-full">
                        <div className="w-full md:w-[320px] flex-shrink-0">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                            >
                                <img 
                                    src={featuredBook.coverImageUrl} 
                                    className="w-full aspect-[2/3] object-cover rounded-3xl border border-white/10" 
                                    alt={featuredBook.title} 
                                />
                            </motion.div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-10">
                                <IconStar className="w-5 h-5 text-white animate-pulse" />
                                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/50">Neural Spotlight</span>
                            </div>
                            <h1 className="type-display text-white text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-none">
                                {featuredBook.title}
                            </h1>
                            <p className="type-body text-zinc-400 text-xl max-w-xl mb-12 leading-relaxed font-medium">
                                {featuredBook.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button onClick={() => handleViewDetails(featuredBook.id)} className="btn-primary rounded-full px-12 py-5 text-xs">
                                    Analyze Details <IconArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => featuredBook.price === 0 ? navigate(`/read/${featuredBook.id}`) : addToCart(featuredBook)}
                                    className="btn-secondary rounded-full px-12 py-5 text-xs"
                                >
                                    {featuredBook.price === 0 ? 'Synchronize' : `Sync Protocol — $${(featuredBook.price/100).toFixed(2)}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
          )}
      </section>

      {/* --- FILTER ARCHITECTURE --- */}
      <section className="sticky top-24 z-50 px-6 py-6 pointer-events-none">
          <div className="max-w-screen-xl mx-auto pointer-events-auto">
            <div className="glass-navbar p-3 rounded-[32px] border border-white/5 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                        type="text"
                        placeholder="Search the Neural Archive..."
                        className="bg-transparent border-none focus:ring-0 w-full pl-14 py-3 text-sm text-white placeholder:text-zinc-600"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <CustomDropdown options={genreOptions} value={selectedGenre} onChange={setSelectedGenre} className="flex-1 md:w-48 bg-white/5 rounded-2xl border-white/5 text-[10px]" />
                    <CustomDropdown options={priceOptions} value={selectedPriceFilter} onChange={(val) => setSelectedPriceFilter(val as any)} className="flex-1 md:w-40 bg-white/5 rounded-2xl border-white/5 text-[10px]" />
                </div>
            </div>
          </div>
      </section>

      {/* --- REPOSITORY GRID --- */}
      <section className="relative z-10 px-6 pt-10 pb-48">
          <div className="max-w-screen-xl mx-auto">
            {filteredAndSortedBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {filteredAndSortedBooks.map((book, idx) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: (idx % 4) * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <BookCard book={book} onViewDetails={handleViewDetails} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-64 text-center glass-card-premium rounded-[60px] border-dashed border-white/10">
                    <div className="flex justify-center mb-10 opacity-20">
                        <MorphicEye variant="logo" className="w-20 h-20" />
                    </div>
                    <h3 className="type-h2 text-zinc-500 mb-4 tracking-widest uppercase text-sm">No neural fragments found.</h3>
                    <p className="type-body text-zinc-700">Adjust your synchronization parameters.</p>
                </div>
            )}
          </div>
      </section>

      {/* --- PREVIEW ARCHITECTURE --- */}
      {selectedBook && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="" size="lg">
            <div className="flex flex-col md:flex-row min-h-[600px] bg-[#050505] overflow-hidden rounded-[40px] border border-white/10">
                <div className="w-full md:w-1/2 relative min-h-[400px] border-b md:border-b-0 md:border-r border-white/5">
                    <img src={selectedBook.coverImageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
                </div>
                <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-500">{selectedBook.genre}</span>
                        <div className="h-[1px] flex-grow bg-white/5" />
                    </div>
                    <h2 className="type-h1 text-white text-4xl md:text-5xl font-black mb-6 leading-tight">{selectedBook.title}</h2>
                    <p className="type-body text-zinc-400 text-lg mb-12">By <span className="text-white font-bold">{selectedBook.author}</span></p>
                    <p className="type-small text-zinc-500 mb-16 leading-relaxed line-clamp-8">
                        {selectedBook.description}
                    </p>
                    <div className="flex items-center justify-between pt-12 border-t border-white/5 mt-auto">
                        <span className="type-h2 text-white text-3xl font-black">{selectedBook.price === 0 ? 'FREE' : `$${(selectedBook.price/100).toFixed(2)}`}</span>
                        <button onClick={handleModalAction} className="btn-primary rounded-full px-12 py-5 text-xs">
                            {selectedBook.price === 0 ? 'Initialize Sync' : 'Add to Protocol'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default StorePage;

