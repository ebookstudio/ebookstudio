import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Seller, EBook, CreatorSiteConfig } from '../types';
import { mockUsers, mockEBooks } from '../services/mockData';
import { APP_NAME, IconBook, IconArrowRight, IconGlobe } from '../constants';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const { useParams, Link } = ReactRouterDOM as any;

const CreatorSitePage: React.FC = () => {
  const { slug } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [siteConfig, setSiteConfig] = useState<CreatorSiteConfig | null>(null);
  const [showcasedBooks, setShowcasedBooks] = useState<EBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundSeller = Object.values(mockUsers).find(
      u => (u as Seller).creatorSite?.slug === slug && (u as Seller).id.startsWith('seller')
    ) as Seller | undefined;

    if (foundSeller && foundSeller.creatorSite && foundSeller.creatorSite.isEnabled) {
      setSeller(foundSeller);
      setSiteConfig(foundSeller.creatorSite);
      const booksToDisplay = mockEBooks.filter(book => 
        foundSeller.creatorSite!.showcasedBookIds.includes(book.id) && book.sellerId === foundSeller.id
      );
      setShowcasedBooks(booksToDisplay);
    } else {
      setSeller(null);
      setSiteConfig(null);
      setShowcasedBooks([]);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin mb-8" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Connecting to Identity...</p>
      </div>
    );
  }

  if (!seller || !siteConfig) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-[0.1]" />
        <div className="relative z-10 max-w-xl">
            <IconGlobe className="w-24 h-24 text-zinc-800 mb-12 mx-auto opacity-40" />
            <h1 className="text-white text-6xl font-serif font-black italic tracking-tighter mb-8 leading-none bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">Lost Site.</h1>
            <p className="text-zinc-600 text-xl font-medium italic mb-16 leading-relaxed">"The digital sanctuary you seek has moved beyond the observable horizon."</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="h-20 px-16 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black text-xs uppercase tracking-[0.4em] transition-all shadow-3xl italic"
            >
              Return to Core
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-[0.2]" />
      <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />

      <header className="relative z-10 pt-40 pb-32 px-8 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="relative mb-16 group">
            <div className="absolute inset-0 bg-white/20 blur-[80px] rounded-full group-hover:scale-125 transition-all duration-1000" />
            {siteConfig.profileImageUrl ? (
                <img 
                    src={siteConfig.profileImageUrl} 
                    className="w-48 h-48 rounded-[3.5rem] object-cover relative z-10 shadow-3xl border-4 border-white/5 grayscale group-hover:grayscale-0 transition-all duration-1000" 
                    alt="" 
                />
            ) : (
                <div className="w-48 h-48 rounded-[3.5rem] bg-white/5 border border-white/5 flex items-center justify-center relative z-10 shadow-3xl">
                    <span className="text-6xl font-serif font-black italic text-zinc-800">{siteConfig.displayName?.[0] || seller.name[0]}</span>
                </div>
            )}
        </div>
        
        <h1 className="text-white text-7xl md:text-9xl font-serif font-black italic tracking-tighter leading-none mb-8 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">{siteConfig.displayName || seller.name}.</h1>
        {siteConfig.tagline && (
            <p className="text-zinc-500 text-2xl font-medium italic leading-relaxed max-w-2xl mx-auto opacity-60">
                "{siteConfig.tagline}"
            </p>
        )}
      </header>

      <main className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10 pb-64">
        <div className="flex items-center gap-8 mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-700 italic whitespace-nowrap">Featured Works</h2>
            <div className="h-[1px] w-full bg-white/5" />
        </div>

        {showcasedBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {showcasedBooks.map(book => (
              <div key={book.id} className="card-magic group p-10 flex flex-col h-full hover:scale-[1.02] transition-all duration-1000">
                <div className="relative overflow-hidden rounded-[2.5rem] mb-10 shadow-3xl border border-white/5">
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-[450px] object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="text-white text-3xl font-serif font-black italic mb-4 tracking-tight leading-tight group-hover:text-purple-400 transition-colors duration-500">{book.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5">
                    <span className="text-white text-3xl font-serif font-black italic tracking-tighter">${book.price.toFixed(2)}</span>
                    <Button 
                      asChild
                      className="h-14 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-black text-[10px] uppercase tracking-widest transition-all italic shadow-2xl group/btn"
                    >
                        <Link to={`/store?bookId=${book.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                            Acquire <IconArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
            <IconBook className="w-24 h-24 text-zinc-900 mb-10 mx-auto opacity-40" />
            <p className="text-2xl font-serif font-black italic text-zinc-600">"This creator's sanctuary library is currently in silence."</p>
          </div>
        )}
      </main>
      
      <footer className="relative z-10 py-32 border-t border-white/5 bg-white/[0.01] backdrop-blur-3xl text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800 italic mb-6">
            &copy; {new Date().getFullYear()} {siteConfig.displayName || seller.name}
        </p>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">
            Architected by <Link to="/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-500 transition-colors">EbookStudio</Link>
        </p>
      </footer>
    </div>
  );
};

export default CreatorSitePage;