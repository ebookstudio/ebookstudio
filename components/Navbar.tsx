import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { IconMenu, IconX, IconArrowLeft } from '../constants';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (isStudio) {
      return (
          <nav className="fixed top-0 left-0 right-0 z-[100] h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-sm bg-zinc-950" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-100">Studio Workspace</span>
              </div>
              <Button 
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
              >
                  <IconArrowLeft className="w-3.5 h-3.5 mr-2" /> Exit Studio
              </Button>
          </nav>
      );
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300",
      scrolled ? "h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800" : "h-20 bg-transparent border-b border-transparent"
    )}>
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
            {/* Brand Identity */}
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-7 h-7 bg-zinc-100 rounded flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                    <span className="text-zinc-950 font-black text-[10px]">E</span>
                </div>
                <span className="text-base font-bold tracking-tighter text-zinc-100">EbookStudio</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 h-full">
                <div className="flex items-center gap-6">
                    <Link to="/store" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-all">Library</Link>
                    <Link to="/pricing" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-all">Pricing</Link>
                </div>
                
                <div className="h-4 w-[1px] bg-zinc-800" />

                {currentUser ? (
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-all">Dashboard</Link>
                        <Button 
                          onClick={() => navigate('/ebook-studio')}
                          className="rounded h-8 px-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          Create
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-6">
                       <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-all">Login</Link>
                       <Button 
                         onClick={() => navigate('/login')}
                         className="rounded h-8 px-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-widest transition-all"
                       >
                         Get Started
                       </Button>
                    </div>
                )}
            </div>

            {/* Mobile Trigger */}
            <button 
                className="md:hidden w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-100 active:scale-95 transition-all"
                onClick={() => setMobileMenuOpen(true)}
            >
                <IconMenu className="w-4 h-4"/>
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col p-8 overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center">
                                <span className="text-zinc-950 font-black text-sm">E</span>
                            </div>
                            <span className="text-lg font-bold tracking-tighter text-zinc-100">EbookStudio</span>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                            <IconX className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="flex flex-col gap-8">
                        {[
                            { label: "Library", href: "/store" },
                            { label: "Pricing", href: "/pricing" },
                            { label: "Dashboard", href: "/dashboard" }
                        ].map((link) => (
                            <Link 
                                key={link.href}
                                to={link.href} 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="text-3xl font-bold text-zinc-100 hover:text-zinc-500 transition-colors tracking-tight"
                            >
                                {link.label}
                            </Link>
                        ))}
                        
                        {!currentUser && (
                            <Button 
                              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                              className="h-14 rounded-md bg-zinc-100 text-zinc-950 text-lg font-bold mt-8 transition-all"
                            >
                              Get Started
                            </Button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </nav>

  );
};

export default Navbar;
