import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { APP_NAME } from '../constants';

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
                    <span className="type-h3 tracking-tighter uppercase">EbookStudio</span>
                </div>
                <p className="type-small text-muted max-w-sm">
                    EbookStudio is the definitive platform for creating, refining, and selling digital literature. 
                    Empowering authors through the power of Studio AI.
                </p>
                <div className="mt-8 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                    <span className="type-tiny text-zinc-600">Studio AI Active</span>
                </div>
            </div>

            <div>
                <h4 className="type-tiny text-zinc-500 mb-8">Platform</h4>
                <ul className="space-y-4">
                    <li><Link to="/store" className="type-small text-muted hover:text-white transition-colors">Library</Link></li>
                    <li><Link to="/pricing" className="type-small text-muted hover:text-white transition-colors">Pricing</Link></li>
                    <li><Link to="/contact" className="type-small text-muted hover:text-white transition-colors">Help & Contact</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="type-tiny text-zinc-500 mb-8">Legal</h4>
                <ul className="space-y-4">
                    <li><Link to="/terms-and-conditions" className="type-small text-muted hover:text-white transition-colors">Terms of Use</Link></li>
                    <li><Link to="/privacy-policy" className="type-small text-muted hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/refund-policy" className="type-small text-muted hover:text-white transition-colors">Refund Policy</Link></li>
                </ul>
            </div>

        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-700 tracking-[0.2em] uppercase">
            <p>&copy; {new Date().getFullYear()} EbookStudio. All Rights Reserved.</p>
            <p className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                Built with Google Gemini
            </p>
        </div>
    </footer>
  );
};

export default Footer;