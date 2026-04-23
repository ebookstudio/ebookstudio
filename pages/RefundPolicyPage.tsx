import React from 'react';
import { APP_NAME, IconActivity, IconWallet, IconCheck } from '../constants';

const RefundPolicyPage: React.FC = () => {
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
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Billing Integrity v2.0</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">Refund <br/><span className="text-zinc-500">Policy.</span></h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Digital Marketplace Standards</p>
            </div>
        </header>

        {/* Content Section */}
        <div className="space-y-20">
            
            {/* 01. Eligibility */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">01</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Customer Eligibility</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-6">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Refunds are evaluated on a case-by-case basis. You may be eligible for a refund within <span className="text-zinc-100 font-bold">7 days</span> of purchase if:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "Ebook file is corrupted/unreadable",
                            "Content significantly differs from description",
                            "Duplicate accidental purchase (within 24h)",
                            "Unauthorized transaction reported"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-tight">
                                <IconCheck className="w-4 h-4 text-emerald-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 02. Non-Refundable Items */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">02</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Non-Refundable Cases</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Due to the digital nature of our assets, we cannot offer refunds for the following:
                    </p>
                    <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                        <li className="flex items-start gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                            <span>Subjective preferences ("I didn't like the book").</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                            <span>Books that have been downloaded multiple times.</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                            <span className="text-rose-400 font-bold italic">AI Subscription Fees (Non-refundable).</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* 03. Refund Process */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">03</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Process & Timelines</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        If approved, your refund will be processed via <span className="text-zinc-100 font-bold">Razorpay</span> to your original payment method. Funds typically reflect in your account within <span className="text-zinc-100 font-bold text-lg">5-7 business days</span>.
                    </p>
                </div>
            </section>

            {/* 04. Author Impact */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">04</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Author Account Adjustment</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium italic">
                        "If a refund is granted to a customer, the corresponding platform commission and author payout will be reversed. The amount will be deducted from the author's future payouts."
                    </p>
                </div>
            </section>

        </div>

        {/* Footer Note */}
        <footer className="pt-24 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">EbookStudio Transaction Safety</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-800">Powered by Razorpay Ecosystem</p>
            </div>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <IconWallet className="w-4 h-4 text-zinc-500" />
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

export default RefundPolicyPage;
