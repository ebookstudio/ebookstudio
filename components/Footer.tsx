import React, { useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { APP_NAME, ENGINE_NAME } from '../constants';
import { animate, remove } from 'animejs';

const { Link, useLocation } = ReactRouterDOM as any;

const Footer: React.FC = () => {
  const location = useLocation();

  // HIDE FOOTER ON STUDIO PAGE, STANDALONE PREVIEW, DASHBOARD, OR READER PAGE
  if (location.pathname === '/ebook-studio' || location.pathname.startsWith('/site/') || location.pathname === '/dashboard' || location.pathname.startsWith('/read/')) {
      return null;
  }

  return (
    <footer className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-black tracking-tighter uppercase title-neural">EbookStudio</span>
                </div>
                <p className="text-neural max-w-sm">
                    EbookStudio is the easiest way to write, read, and sell books. 
                    Created with love for authors everywhere.
                </p>
                <div className="mt-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Studio AI Active</span>
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8 opacity-50">Quick Links</h4>
                <ul className="space-y-4">
                    <li><Link to="/store" className="text-neutral-500 hover:text-white transition-colors text-sm">Library</Link></li>
                    <li><Link to="/pricing" className="text-neutral-500 hover:text-white transition-colors text-sm">Pricing</Link></li>
                    <li><Link to="/contact" className="text-neutral-500 hover:text-white transition-colors text-sm">Help & Contact</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8 opacity-50">Legal</h4>
                <ul className="space-y-4">
                    <li><Link to="/terms-and-conditions" className="text-neutral-500 hover:text-white transition-colors text-sm">Terms of Use</Link></li>
                    <li><Link to="/privacy-policy" className="text-neutral-500 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                    <li><Link to="/refund-policy" className="text-neutral-500 hover:text-white transition-colors text-sm">Refund Policy</Link></li>
                </ul>
            </div>

        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono text-neutral-700 tracking-[0.5em] uppercase">
            <p>&copy; {new Date().getFullYear()} EbookStudio. All Rights Reserved.</p>
            <p>Built with Google Gemini</p>
        </div>
    </footer>
  );
};

export default Footer;