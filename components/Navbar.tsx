import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { IconMenu, IconX, IconArrowLeft } from '../constants';
import MorphicEye from './MorphicEye';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
          <nav className="fixed top-0 left-0 right-0 z-[100] h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <MorphicEye variant="logo" className="opacity-80" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Studio Interface</span>
              </div>
              <Button 
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-bold text-zinc-500 hover:text-white"
              >
                  <IconArrowLeft className="w-4 h-4 mr-2" /> Exit to Dashboard
              </Button>
          </nav>
      );
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-700",
      scrolled ? "py-4" : "py-8"
    )}>
        <div className="max-w-7xl mx-auto px-6">
            <div className={cn(
                "rounded-full px-8 h-20 flex items-center justify-between transition-all duration-700 border",
                scrolled 
                  ? "bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                  : "bg-transparent border-transparent"
            )}>
                
                {/* Brand Identity */}
                <Link to="/" className="flex items-center gap-6 group">
                    <MorphicEye variant="logo" className="transition-transform duration-700 group-hover:scale-110" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-xl font-black text-white tracking-tighter leading-none">ebookstudio</span>
                        <span className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 font-black mt-1.5">opendev-labs</span>
                    </div>
                </Link>

                {/* Navigation Ecosystem */}
                <div className="hidden md:flex items-center gap-10">
                    <div className="flex items-center gap-8">
                        <Link to="/store" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Repository</Link>
                        <Link to="/pricing" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Protocol</Link>
                    </div>
                    
                    <div className="h-4 w-[1px] bg-white/5" />

                    {currentUser ? (
                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Console</Link>
                            <Button 
                              onClick={() => navigate('/ebook-studio')}
                              className="rounded-full px-8 h-11 bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                            >
                              Initialize Project
                            </Button>
                            <button 
                              onClick={handleLogout} 
                              className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-zinc-600 hover:text-red-400"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Button 
                          onClick={() => navigate('/login')}
                          className="rounded-full px-10 h-12 bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105"
                        >
                          Establish Access
                        </Button>
                    )}
                </div>

                {/* Mobile Interface Trigger */}
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

        {/* Neural Overlay Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col p-12 animate-fade-in">
                <div className="flex justify-between items-center mb-24">
                    <div className="flex items-center gap-4">
                        <MorphicEye variant="logo" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Protocol Menu</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white">
                        <IconX className="w-6 h-6"/>
                    </button>
                </div>

                <div className="flex flex-col gap-12">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-black tracking-tighter text-white">Interface</Link>
                    <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-black tracking-tighter text-white">Repository</Link>
                    <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-black tracking-tighter text-white">Protocol</Link>
                    {currentUser ? (
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-black tracking-tighter text-white">Console</Link>
                    ) : (
                        <Button 
                          onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                          className="h-20 rounded-3xl bg-white text-black text-xl font-black uppercase tracking-widest mt-12"
                        >
                          Initialize Access
                        </Button>
                    )}
                </div>
                
                <div className="mt-auto pt-12 border-t border-white/5 flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 leading-none">Sovereign Architecture</p>
                    <p className="text-xl font-black text-zinc-500 tracking-tighter">opendev-labs</p>
                </div>
            </div>
        )}
    </nav>
  );
};

export default Navbar;

