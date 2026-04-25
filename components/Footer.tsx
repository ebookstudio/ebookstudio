import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import CoAuthor from './CoAuthor';

const { Link, useLocation } = ReactRouterDOM as any;

const Footer: React.FC = () => {
  const location = useLocation();

  // HIDE FOOTER ON SPECIFIC PAGES
  if (
    location.pathname === '/ebookstudio' ||
    location.pathname.startsWith('/site/') || 
    location.pathname === '/dashboard' || 
    location.pathname.startsWith('/read/') ||
    location.pathname === '/login'
  ) {
      return null;
  }

  return (
    <footer className="py-24 px-6 border-t border-border bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 mb-16 relative z-10">
            
            <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                    <CoAuthor size="sm" className="shadow-lg shadow-white/5" />
                    <span className="text-xl font-bold tracking-tighter text-zinc-100">EbookStudio</span>
                </div>
                <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">
                    The professional sanctuary for high-fidelity literature. Publish your stories with AI precision and reach a global audience.
                </p>
                
                <div className="pt-4 flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Enterprise Authorship v2.0</span>
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="text-zinc-100 text-[10px] font-bold uppercase tracking-[0.3em]">Platform</h4>
                <ul className="space-y-4">
                    <li><Link to="/store" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Library</Link></li>
                    <li><Link to="/pricing" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Pricing</Link></li>
                    <li><Link to="/dashboard" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Dashboard</Link></li>
                    <li><Link to="/contact" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Support</Link></li>
                </ul>
            </div>

            <div className="space-y-6">
                <h4 className="text-zinc-100 text-[10px] font-bold uppercase tracking-[0.3em]">Legal</h4>
                <ul className="space-y-4">
                    <li><Link to="/terms-and-conditions" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Terms of Service</Link></li>
                    <li><Link to="/privacy-policy" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Privacy Policy</Link></li>
                    <li><Link to="/refund-policy" className="text-zinc-500 hover:text-zinc-100 transition-all text-sm font-medium">Refund Policy</Link></li>
                </ul>
            </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex flex-col gap-1 text-center md:text-left">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} EbookStudio. All rights reserved.</p>
                <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest">A product of OpenDev-Labs.</p>
            </div>
            
            <div className="flex gap-8">
                {['Twitter', 'GitHub', 'LinkedIn'].map(platform => (
                    <a key={platform} href="#" className="text-zinc-600 hover:text-zinc-100 transition-colors text-[10px] font-bold uppercase tracking-widest">{platform}</a>
                ))}
            </div>
        </div>
    </footer>
  );
};

export default Footer;