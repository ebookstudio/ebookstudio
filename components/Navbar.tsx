import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../types';
import { IconShoppingCart, IconRocket, IconMenu, IconX, IconStore, IconHome, IconBook, IconArrowLeft } from '../constants';
import MorphicEye from './MorphicEye';

const { Link, useNavigate, useLocation } = ReactRouterDOM as any;

const Navbar: React.FC = () => {
  const { currentUser, userType, cart, logout } = useAppContext();
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

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-700 px-6 ${scrolled ? 'pt-4' : 'pt-8'}`}>
        <div className={`max-w-7xl mx-auto glass-panel rounded-[24px] px-8 h-20 flex items-center justify-between transition-all duration-700 ${scrolled ? 'bg-black/80 shadow-2xl scale-[0.98]' : 'bg-transparent border-transparent shadow-none'}`}>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4 group">
                <MorphicEye className="w-10 h-10 bg-black border border-white/10 rounded-full transition-transform group-hover:scale-110" />
                <span className="type-h3 tracking-tighter uppercase">EbookStudio</span>
            </Link>

            {/* Desktop Links */}
            {!isStudio && (
                <div className="hidden md:flex items-center gap-10">
                    <Link to="/store" className="type-tiny text-zinc-400 hover:text-white transition-colors">Store</Link>
                    <Link to="/pricing" className="type-tiny text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                    
                    {currentUser ? (
                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="type-tiny text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
                            <Link to="/ebook-studio" className="btn-primary py-2 px-6">Write</Link>
                            <button onClick={handleLogout} className="btn-secondary py-2 px-6">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary py-2 px-8">Sign In</Link>
                    )}
                </div>
            )}

            {/* Right Side for Studio */}
            {isStudio && (
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary py-2 px-6"
                >
                    <IconArrowLeft className="w-4 h-4" /> Dashboard
                </button>
            )}

            {/* Mobile Menu Button */}
            {!isLogin && (
                <button 
                    className="md:hidden p-2 text-zinc-400 hover:text-white transition-transform active:scale-90"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <IconX className="w-6 h-6"/> : <IconMenu className="w-6 h-6"/>}
                </button>
            )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-[90] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 p-6 animate-fade-in">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="type-display text-3xl uppercase">Home</Link>
                <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="type-display text-3xl uppercase">Store</Link>
                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="type-display text-3xl uppercase">Pricing</Link>
                {currentUser ? (
                    <>
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="type-display text-3xl uppercase">Dashboard</Link>
                        <button onClick={handleLogout} className="text-red-500 type-h2 uppercase mt-8">Sign Out</button>
                    </>
                ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary px-20 py-5 mt-8">Sign In</Link>
                )}
                <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10 text-white"><IconX className="w-8 h-8"/></button>
            </div>
        )}
    </nav>
  );
};

export default Navbar;

