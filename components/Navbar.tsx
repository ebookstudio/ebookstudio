import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { IconMenu, IconX, IconArrowLeft } from '../constants';
import MorphicEye from './MorphicEye';

const { Link, useNavigate, useLocation } = ReactRouterDOM as any;

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isStudio = location.pathname === '/ebook-studio';
  const isLogin = location.pathname === '/login';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isStudio) {
      return (
          <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-navbar px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <MorphicEye variant="logo" className="w-8 h-8" />
                  <span className="type-h3 text-sm tracking-[0.2em] uppercase font-bold text-white/90">Studio</span>
              </div>
              <button 
                  onClick={() => navigate('/dashboard')}
                  className="type-tiny flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
              >
                  <IconArrowLeft className="w-4 h-4" /> Exit to Dashboard
              </button>
          </nav>
      );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-1000 ${scrolled ? 'py-4' : 'py-10'}`}>
        <div className={`max-w-screen-xl mx-auto px-6`}>
            <div className={`glass-navbar rounded-[32px] px-8 h-20 flex items-center justify-between transition-all duration-1000 ${scrolled ? 'shadow-2xl translate-y-2' : 'bg-transparent border-transparent'}`}>
                
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <MorphicEye variant="logo" className="w-10 h-10 transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="type-h3 text-lg tracking-[-0.02em] font-black text-white leading-none">ebookstudio</span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-bold mt-1">opendev-labs</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-12">
                    <nav className="flex items-center gap-8">
                        <Link to="/store" className="type-tiny text-zinc-500 hover:text-white transition-all hover:tracking-widest">Store</Link>
                        <Link to="/pricing" className="type-tiny text-zinc-500 hover:text-white transition-all hover:tracking-widest">Pricing</Link>
                    </nav>
                    
                    <div className="h-4 w-[1px] bg-white/10" />

                    {currentUser ? (
                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="type-tiny text-zinc-500 hover:text-white transition-all hover:tracking-widest">Dashboard</Link>
                            <Link to="/ebook-studio" className="btn-primary py-3 px-8 rounded-full">New Book</Link>
                            <button onClick={handleLogout} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group">
                                <IconX className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary py-3 px-10 rounded-full">Get Started</Link>
                    )}
                </div>

                {/* Mobile Trigger */}
                {!isLogin && (
                    <button 
                        className="md:hidden w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-zinc-400 active:scale-90 transition-all"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <IconMenu className="w-6 h-6"/>
                    </button>
                )}
            </div>
        </div>

        {/* Mobile Fullscreen Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col p-10 animate-fade-in">
                <div className="flex justify-between items-center mb-20">
                    <div className="flex items-center gap-3">
                        <MorphicEye variant="logo" className="w-8 h-8" />
                        <span className="type-h3 text-white uppercase tracking-widest text-sm">Menu</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                        <IconX className="w-6 h-6 text-white"/>
                    </button>
                </div>

                <div className="flex flex-col gap-10">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="type-display text-4xl">Home</Link>
                    <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="type-display text-4xl">Store</Link>
                    <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="type-display text-4xl">Pricing</Link>
                    {currentUser ? (
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="type-display text-4xl">Dashboard</Link>
                    ) : (
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary py-5 text-center mt-10">Sign In</Link>
                    )}
                </div>
                
                <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-2">
                    <p className="type-tiny text-zinc-600">Sovereign Entity</p>
                    <p className="type-h3 text-sm text-zinc-400">opendev-labs</p>
                </div>
            </div>
        )}
    </nav>
  );
};

export default Navbar;

