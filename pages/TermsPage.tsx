import React from 'react';
import { APP_NAME, IconBook, IconShieldCheck, IconActivity } from '../constants';

const TermsPage: React.FC = () => {
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
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Legal Framework v2.0</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">Terms of <br/><span className="text-zinc-500">Service.</span></h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Effective Date: {new Date().toLocaleDateString()}</p>
            </div>
        </header>

        {/* Content Section */}
        <div className="space-y-20">
            
            {/* 01. Platform Role */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">01</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Platform Role</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        We are a marketplace that allows creators ("Authors") to generate or upload ebooks and sell them to readers ("Customers"). We also provide an optional AI-powered ebook generation tool to facilitate the creative process.
                    </p>
                </div>
            </section>

            {/* 02. Commissions & Payments */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">02</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Commissions & Payments</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-6">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        For every ebook sold on our platform, the Author receives <span className="text-zinc-100 font-bold">70%</span> of the sale price, and we retain <span className="text-zinc-100 font-bold">30%</span> as a platform commission. 
                    </p>
                    <div className="flex items-start gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                        <IconShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                            All customer payments are processed securely via <span className="text-zinc-300">Razorpay</span>. We support cards, UPI, and netbanking for global accessibility.
                        </p>
                    </div>
                </div>
            </section>

            {/* 03. Author Payouts */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">03</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Author Payouts</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Author earnings are paid to the <span className="text-zinc-100 font-bold">UPI ID</span> or bank account provided by the Author. Payouts are processed on a weekly basis via Razorpay Payouts. A small transaction fee (nominal bank charges) may be deducted from the final payout amount.
                    </p>
                </div>
            </section>

            {/* 04. AI Subscription */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">04</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">AI Subscription</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Access to our AI ebook generator requires a separate paid subscription. Subscription fees are <span className="text-zinc-100 font-bold underline underline-offset-4">non-refundable</span> and are collected via Razorpay. The AI subscription is a tool-access fee and does not affect the 30% sales commission.
                    </p>
                </div>
            </section>

            {/* 05. Intellectual Property */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">05</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Intellectual Property</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Authors retain <span className="text-zinc-100 font-bold">full ownership</span> of their ebooks. By listing on our marketplace, you grant us a non-exclusive license to host, display, and distribute the ebook. Authors are solely responsible for ensuring their content does not infringe third-party copyrights.
                    </p>
                </div>
            </section>

            {/* 06. AI Content Disclaimer */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">06</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">AI Disclaimer</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Ebooks created using our AI tool are generated by an automated system. We do not guarantee originality, accuracy, or copyright clearance for AI-generated text. Authors must review and assume full responsibility for all AI-generated content before publishing.
                    </p>
                </div>
            </section>

        </div>

        {/* Footer Note */}
        <footer className="pt-24 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">EbookStudio Legal Department</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-800">Operated by OpenDev-Labs</p>
            </div>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <IconActivity className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <IconBook className="w-4 h-4 text-zinc-500" />
                </div>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default TermsPage;