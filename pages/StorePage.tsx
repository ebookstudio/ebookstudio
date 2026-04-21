import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import BookCard from '../components/BookCard';
import { EBook } from '../types';
import { IconShoppingCart, IconSearch, IconBook, IconStar, IconArrowRight } from '../constants';
import Modal from '../components/Modal'; 
import CustomDropdown, { DropdownOption } from '../components/CustomDropdown';
import { useAppContext } from '../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

const StorePage: React.FC = () => {
  const { addToCart, allBooks } = useAppContext(); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState('publicationDate'); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<EBook | null>(null);

  const genres = useMemo(() => ['All', ...new Set(allBooks.map(book => book.genre))], [allBooks]);
  const genreOptions: DropdownOption[] = genres.map(g => ({ label: g === 'All' ? 'All Genres' : g, value: g }));
  
  const priceOptions: DropdownOption[] = [
      { label: 'All Prices', value: 'All' },
      { label: 'Free Only', value: 'Free' },
      { label: 'Paid Only', value: 'Paid' },
  ];

  const sortOptions: DropdownOption[] = [
      { label: 'Newest First', value: 'publicationDate' },
      { label: 'Title (A-Z)', value: 'title' },
      { label: 'Price (Low-High)', value: 'price' },
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
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'price') return a.price - b.price;
      return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
    });
  }, [searchTerm, selectedGenre, selectedPriceFilter, sortBy, allBooks]);

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
    <div className="min-h-screen bg-black bg-neural-mesh pt-32 pb-24 px-6">
      
      {/* --- LUXURY FEATURED RELEASE --- */}
      {featuredBook && !searchTerm && selectedGenre === 'All' && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mb-24 relative overflow-hidden glass-panel rounded-[60px] min-h-[600px] flex items-center"
        >
             <div className="absolute inset-0 z-0">
                <img src={featuredBook.coverImageUrl} className="w-full h-full object-cover opacity-20 scale-110 blur-xl" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
             </div>

             <div className="relative z-10 p-12 md:p-24 flex flex-col md:flex-row gap-16 items-center">
                <div className="w-full md:w-5/12">
                    <motion.div 
                        whileHover={{ rotateY: 15, rotateX: -5 }}
                        className="relative group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                            src={featuredBook.coverImageUrl} 
                            className="w-full aspect-[2/3] object-cover rounded-[30px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10 relative z-10" 
                            alt={featuredBook.title} 
                        />
                    </motion.div>
                </div>

                <div className="w-full md:w-7/12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-panel rounded-full mb-8">
                        <IconStar className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Neural Drop</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black title-neural mb-6 leading-none text-gradient">
                        {featuredBook.title}
                    </h1>
                    <p className="text-xl text-muted mb-12 max-w-xl font-light">
                        {featuredBook.description}
                    </p>
                    <div className="flex gap-6">
                        <button onClick={() => handleViewDetails(featuredBook.id)} className="btn-premium px-12 py-5 text-[10px]">
                            Details <IconArrowRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => featuredBook.price === 0 ? navigate(`/read/${featuredBook.id}`) : addToCart(featuredBook)}
                            className="btn-premium-outline px-12 py-5 text-[10px]"
                        >
                            {featuredBook.price === 0 ? 'Read Now' : `Add to Cart - ₹${featuredBook.price}`}
                        </button>
                    </div>
                </div>
             </div>
        </motion.div>
      )}

      {/* --- PREMIUM FILTER BAR --- */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="glass-panel p-3 rounded-[32px] flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
                <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                    type="text"
                    placeholder="Search the neural library..."
                    className="w-full bg-white/5 border border-transparent focus:border-white/10 rounded-[20px] py-4 pl-14 pr-6 text-white placeholder-neutral-700 outline-none transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <CustomDropdown options={genreOptions} value={selectedGenre} onChange={setSelectedGenre} className="flex-1 md:w-48" />
                <CustomDropdown options={priceOptions} value={selectedPriceFilter} onChange={(val) => setSelectedPriceFilter(val as any)} className="flex-1 md:w-40" />
            </div>
        </div>
      </div>

      {/* --- GRID OF BOOKS --- */}
      <div className="max-w-7xl mx-auto">
        {filteredAndSortedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {filteredAndSortedBooks.map(book => (
                    <BookCard key={book.id} book={book} onViewDetails={handleViewDetails} />
                ))}
            </div>
        ) : (
            <div className="py-40 text-center glass-panel rounded-[40px]">
                <IconSearch className="w-20 h-20 text-neutral-800 mx-auto mb-8" />
                <h3 className="text-3xl font-bold mb-4">No volumes found.</h3>
                <p className="text-muted">Try adjusting your search or filters.</p>
            </div>
        )}
      </div>

      {/* --- LUXURY PREVIEW MODAL --- */}
      {selectedBook && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="" size="lg">
            <div className="flex flex-col md:flex-row h-full bg-black overflow-hidden">
                <div className="w-full md:w-1/2 relative h-[400px] md:h-auto">
                    <img src={selectedBook.coverImageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                </div>
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-600 mb-6">{selectedBook.genre}</span>
                    <h2 className="text-5xl font-black title-neural mb-4 leading-none">{selectedBook.title}</h2>
                    <p className="text-lg text-neutral-400 mb-8 font-light">by {selectedBook.author}</p>
                    <p className="text-muted text-sm leading-relaxed mb-12 line-clamp-6">
                        {selectedBook.description}
                    </p>
                    <div className="flex items-center justify-between pt-12 border-t border-white/5">
                        <span className="text-4xl font-bold">{selectedBook.price === 0 ? 'Free' : `₹${selectedBook.price}`}</span>
                        <button onClick={handleModalAction} className="btn-premium px-10 py-4 text-[10px]">
                            {selectedBook.price === 0 ? 'Read Now' : 'Add to Cart'}
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
