import React from 'react';
import { APP_NAME, IconRocket, IconActivity } from '../constants';

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 pt-40 pb-32 px-6 text-zinc-100 selection:bg-primary/30">
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-zinc-900/20 to-transparent" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-24 animate-fade-in">
        
        {/* Header Section */}
        <header className="space-y-8">
            <div className="flex items-center gap-3 text-zinc-500">
                <div className="w-8 h-[1px] bg-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Logistics Architecture v2.0</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">Delivery <br/><span className="text-zinc-500">Policy.</span></h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Instant Digital Transmission</p>
            </div>
        </header>

        {/* Content Section */}
        <div className="space-y-20">
            
            {/* 01. Instant Fulfillment */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">01</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Instant Fulfillment</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        {APP_NAME} is a pure digital marketplace. We do not manufacture or ship physical items. Your digital assets are fulfilled <span className="text-zinc-100 font-bold">instantly</span> upon successful payment authorization.
                    </p>
                </div>
            </section>

            {/* 02. Access Methods */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">02</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Retrieval Methods</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Cloud Library</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                Accessible directly from your personal dashboard under the "Collection" tab.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Email Confirmation</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                A permanent download record is sent to your registered email address.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 03. Global Access */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">03</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">No Geographic Constraints</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        As a digital-first platform, there are <span className="text-zinc-100 font-bold underline underline-offset-4 decoration-zinc-800">zero shipping fees</span> and no regional boundaries. Our infrastructure ensures 99.9% availability for downloads worldwide.
                    </p>
                </div>
            </section>

        </div>

        {/* Footer Note */}
        <footer className="pt-24 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">EbookStudio Global Distribution</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-800">Zero-Latency Fulfillment</p>
            </div>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <IconRocket className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <IconActivity className="w-4 h-4 text-zinc-500" />
                </div>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default ShippingPolicyPage;
