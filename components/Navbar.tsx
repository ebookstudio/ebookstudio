
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  // Handle Studio Mode Specifically
  const isStudio = location.pathname === '/ebook-studio';
  const isStandalone = location.pathname.startsWith('/site/');
  const isLogin = location.pathname === '/login';

  if (isStandalone) return null;

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
      { label: 'Store', path: '/store', icon: <IconStore className="w-5 h-5"/> },
      { label: 'Plans', path: '/pricing', icon: <IconBook className="w-5 h-5"/> },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${
        isStudio 
        ? 'border-b border-white/5 bg-black/80 backdrop-blur-2xl' 
        : 'glass-navbar py-4'
    }`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <MorphicEye className="w-10 h-10 bg-black shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 rounded-full transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xl font-black tracking-tighter uppercase title-neural">EbookStudio</span>
            </Link>

            {/* Desktop Links */}
            {!isStudio && !isLogin && (
                <div className="hidden md:flex items-center gap-10">
                    <Link to="/store" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Store</Link>
                    <Link to="/pricing" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Pricing</Link>
                    
                    {currentUser ? (
                        <div className="flex items-center gap-8">
                            <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
                            <Link to="/ebook-studio" className="btn-studio py-2 px-6 text-[10px]">Start Writing</Link>
                            <button onClick={handleLogout} className="btn-studio-outline py-2 px-6 text-[10px]">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-studio py-2 px-8 text-[10px]">Sign In</Link>
                    )}
                </div>
            )}

            {/* Right Side for Studio Mode */}
            {isStudio && (
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-studio-outline py-2 px-6 text-[10px]"
                >
                    Back to Dashboard
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
    </nav>

    {/* Mobile Full Screen Menu */}
    {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden flex flex-col pt-24 pb-8 px-6 animate-fade-in">
             <div className="flex flex-col gap-6">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-bold text-white flex items-center gap-4 py-2 border-b border-white/10 animate-slide-up-stagger delay-100">
                    <IconHome className="w-6 h-6 text-neutral-500"/> Home
                </Link>
                {navLinks.map((link, idx) => (
                    <Link 
                        key={link.path} 
                        to={link.path} 
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-3xl font-bold text-white flex items-center gap-4 py-2 border-b border-white/10 animate-slide-up-stagger delay-${(idx + 2) * 100}`}
                    >
                        <span className="text-neutral-500">{link.icon}</span>
                        {link.label}
                    </Link>
                ))}
                
                {currentUser ? (
                    <>
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-bold text-white flex items-center gap-4 py-2 border-b border-white/10 animate-slide-up-stagger delay-300">
                           <IconHome className="w-6 h-6 text-neutral-500" /> My Profile
                        </Link>
                         <Link to="/ebook-studio" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-bold text-white flex items-center gap-4 py-2 border-b border-white/10 animate-slide-up-stagger delay-400">
                           <IconRocket className="w-6 h-6 text-neutral-500" /> Write Book
                        </Link>
                        <button onClick={handleLogout} className="text-left text-xl font-bold text-red-500 py-4 mt-4 animate-slide-up-stagger delay-400">
                            Sign Out
                        </button>
                    </>
                ) : (
                    <div className="mt-8 flex flex-col gap-4 animate-slide-up-stagger delay-400">
                        <Link 
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold text-center rounded-full"
                        >
                            Login
                        </Link>
                        <Link 
                            to="/pricing" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-4 bg-white text-black font-bold text-center rounded-full shadow-glow-white"
                        >
                            Start Free
                        </Link>
                    </div>
                )}
             </div>
        </div>
    )}
    </>
  );
};

export default Navbar;
