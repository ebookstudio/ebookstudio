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
        <div className={`max-w-7xl mx-auto glass-panel rounded-[30px] px-8 h-20 flex items-center justify-between transition-all duration-700 ${scrolled ? 'bg-black/60 shadow-2xl scale-[0.98]' : 'bg-transparent border-transparent shadow-none'}`}>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4 group">
                <MorphicEye className="w-10 h-10 bg-black border border-white/20 rounded-full transition-transform group-hover:scale-110" />
                <span className="text-xl font-black tracking-tighter uppercase title-neural">EbookStudio</span>
            </Link>

            {/* Links */}
            {!isStudio && (
                <div className="hidden md:flex items-center gap-12">
                    <Link to="/store" className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 hover:text-white transition-colors">Store</Link>
                    <Link to="/pricing" className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 hover:text-white transition-colors">Pricing</Link>
                    
                    {currentUser ? (
                        <div className="flex items-center gap-10">
                            <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
                            <Link to="/ebook-studio" className="btn-premium py-2 px-8 text-[9px]">Write</Link>
                            <button onClick={handleLogout} className="btn-premium-outline py-2 px-8 text-[9px]">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-premium py-2 px-10 text-[9px]">Sign In</Link>
                    )}
                </div>
            )}

            {/* Right Side for Studio */}
            {isStudio && (
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-premium-outline py-2 px-8 text-[9px]"
                >
                    <IconArrowLeft className="w-4 h-4" /> Dashboard
                </button>
            )}

            {/* Mobile Menu Button */}
            {!isLogin && (
                <button 
                    className="md:hidden p-2 text-neutral-400 hover:text-white transition-transform active:scale-90"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <IconX className="w-6 h-6"/> : <IconMenu className="w-6 h-6"/>}
                </button>
            )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-12 p-6 animate-fade-in">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black title-neural uppercase">Home</Link>
                <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black title-neural uppercase">Store</Link>
                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black title-neural uppercase">Pricing</Link>
                {currentUser ? (
                    <button onClick={handleLogout} className="text-red-500 text-2xl font-bold uppercase tracking-widest">Sign Out</button>
                ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-premium px-20 py-6">Sign In</Link>
                )}
                <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10 text-white"><IconX className="w-10 h-10"/></button>
            </div>
        )}
    </nav>
  );
};

export default Navbar;
