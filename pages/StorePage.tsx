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
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 bg-neural-mesh bg-dot-matrix">
      
      {/* --- FEATURED RELEASE --- */}
      {featuredBook && !searchTerm && selectedGenre === 'All' && (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mb-32 relative overflow-hidden glass-card-premium p-12 md:p-20 flex items-center min-h-[500px]"
        >
             <div className="absolute inset-0 z-0">
                <img src={featuredBook.coverImageUrl} className="w-full h-full object-cover opacity-10 blur-3xl scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
             </div>

             <div className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-20 items-center w-full">
                <div className="w-full md:w-4/12 max-w-[320px]">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                            src={featuredBook.coverImageUrl} 
                            className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-white/10 relative z-10" 
                            alt={featuredBook.title} 
                        />
                    </div>
                </div>

                <div className="w-full md:w-8/12">
                    <div className="flex items-center gap-2 mb-6">
                        <IconStar className="w-4 h-4 text-white" />
                        <span className="type-tiny text-white tracking-widest">Featured Release</span>
                    </div>
                    <h1 className="type-display text-gradient mb-6 leading-none">
                        {featuredBook.title}
                    </h1>
                    <p className="type-body text-muted mb-10 max-w-xl">
                        {featuredBook.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => handleViewDetails(featuredBook.id)} className="btn-primary px-12">
                            Details <IconArrowRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => featuredBook.price === 0 ? navigate(`/read/${featuredBook.id}`) : addToCart(featuredBook)}
                            className="btn-secondary px-12"
                        >
                            {featuredBook.price === 0 ? 'Read Now' : `Add to Cart — $${(featuredBook.price/100).toFixed(2)}`}
                        </button>
                    </div>
                </div>
             </div>
        </motion.div>
      )}

      {/* --- FILTER BAR --- */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="glass-panel p-4 rounded-3xl flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
                <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                    type="text"
                    placeholder="Search the neural library..."
                    className="input-premium pl-14 py-4"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
                <CustomDropdown options={genreOptions} value={selectedGenre} onChange={setSelectedGenre} className="flex-1 lg:w-56" />
                <CustomDropdown options={priceOptions} value={selectedPriceFilter} onChange={(val) => setSelectedPriceFilter(val as any)} className="flex-1 lg:w-48" />
            </div>
        </div>
      </div>

      {/* --- GRID OF BOOKS --- */}
      <div className="max-w-7xl mx-auto">
        {filteredAndSortedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredAndSortedBooks.map(book => (
                    <BookCard key={book.id} book={book} onViewDetails={handleViewDetails} />
                ))}
            </div>
        ) : (
            <div className="py-40 text-center glass-card-premium">
                <IconSearch className="w-16 h-16 text-zinc-800 mx-auto mb-8" />
                <h3 className="type-h2 mb-4">No volumes found.</h3>
                <p className="type-body text-muted">Try adjusting your search or filters.</p>
            </div>
        )}
      </div>

      {/* --- PREVIEW MODAL --- */}
      {selectedBook && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="" size="lg">
            <div className="flex flex-col md:flex-row h-full bg-zinc-950 overflow-hidden rounded-3xl">
                <div className="w-full md:w-1/2 relative min-h-[400px]">
                    <img src={selectedBook.coverImageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent"></div>
                </div>
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <span className="type-tiny text-zinc-500 mb-6">{selectedBook.genre}</span>
                    <h2 className="type-h1 mb-4 leading-tight">{selectedBook.title}</h2>
                    <p className="type-body text-zinc-400 mb-8">by {selectedBook.author}</p>
                    <p className="type-small text-muted mb-12 line-clamp-6 leading-relaxed">
                        {selectedBook.description}
                    </p>
                    <div className="flex items-center justify-between pt-10 border-t border-white/5 mt-auto">
                        <span className="type-h2">{selectedBook.price === 0 ? 'FREE' : `$${(selectedBook.price/100).toFixed(2)}`}</span>
                        <button onClick={handleModalAction} className="btn-primary px-10">
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

