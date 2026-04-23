import React from 'react';
import { APP_NAME, IconShieldCheck, IconActivity, IconLock } from '../constants';

const PrivacyPolicyPage: React.FC = () => {
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
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Privacy Architecture v2.0</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">Privacy <br/><span className="text-zinc-500">Policy.</span></h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
        </header>

        {/* Content Section */}
        <div className="space-y-20">
            
            {/* 01. Information Collection */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">01</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Information Collection</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">For Customers</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                We collect your name, email address, and essential payment details required for transaction processing.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">For Authors</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                In addition to basic profile info, we collect your <span className="text-zinc-100 font-bold">UPI ID</span> or bank account details to facilitate earnings payouts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 02. Razorpay Integration */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">02</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Secure Payments</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-6">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Payments and payouts are handled by <span className="text-zinc-100 font-bold">Razorpay</span>. We share necessary transaction data (amount, order ID, customer email, author UPI ID) with Razorpay to process payments and settlements. 
                    </p>
                    <div className="flex items-start gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                        <IconLock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                            We do not store full card numbers or sensitive banking credentials on our servers. All sensitive financial data is handled by Razorpay's PCI-DSS compliant infrastructure.
                        </p>
                    </div>
                </div>
            </section>

            {/* 03. Data Retention */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">03</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Retention & Deletion</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        You may request deletion of your account and associated data via settings. However, specific transaction records may be retained for <span className="text-zinc-100 font-bold">7-10 years</span> as required by financial regulations and tax laws.
                    </p>
                </div>
            </section>

            {/* 04. Cookies & Tracking */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">04</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Cookies & Tracking</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        We use essential session cookies to manage your shopping cart, authentication state, and checkout process. We do not use intrusive third-party tracking pixels for advertising purposes.
                    </p>
                </div>
            </section>

            {/* 05. Children's Privacy */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-black text-4xl">05</span>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Age Restriction</h2>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl space-y-4">
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Our platform is intended for users who are <span className="text-zinc-100 font-bold text-lg">18+</span>. We do not knowingly collect personal information from minors without parental consent.
                    </p>
                </div>
            </section>

        </div>

        {/* Footer Note */}
        <footer className="pt-24 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Secured by EbookStudio Neural Engine</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-800">ISO/DATA Compliant (Draft)</p>
            </div>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <IconShieldCheck className="w-4 h-4 text-emerald-500" />
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

export default PrivacyPolicyPage;