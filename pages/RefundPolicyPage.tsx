import React from 'react';
import { APP_NAME, IconWallet } from '../constants';
import CoAuthor from '../components/CoAuthor';
import { Badge } from '../components/ui/badge';

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-background pt-48 pb-32 selection:bg-white selection:text-black overflow-hidden">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-purple-600/5 rounded-full blur-[160px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-24">
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 mb-10 shadow-3xl backdrop-blur-xl">
                <IconWallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-serif font-bold italic mb-6">Refund Policy</h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em] italic">
                Digital Product Returns
            </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden backdrop-blur-3xl shadow-3xl">
             <div className="space-y-16 text-zinc-400 leading-relaxed italic">
                  
                  <div className="p-10 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] shadow-inner">
                      <Badge className="bg-rose-500 text-white mb-6 px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border-none shadow-lg">
                          Important Information
                      </Badge>
                      <p className="text-xl font-medium text-zinc-300 leading-relaxed">
                         Since our books are digital products and delivered instantly, all purchases are generally <strong className="text-white italic">final and non-refundable</strong> once the book is added to your library.
                      </p>
                  </div>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">01</span>
                        Cancelling an Order
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        Orders cannot be cancelled once the payment is successful and the book has been added to your library.
                    </p>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">02</span>
                        Exceptions
                    </h3>
                    <p className="text-lg font-medium mb-10">We may offer a refund in the following cases:</p>
                    <ul className="space-y-6 text-sm font-bold uppercase tracking-widest text-zinc-600">
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            The book file is broken or corrupted.
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            You were charged twice for the same book.
                        </li>
                    </ul>
                    <p className="mt-12 text-xs font-bold text-zinc-700 italic">Issues must be reported within 7 days of purchase.</p>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">03</span>
                        Refund Time
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        Approved refunds are processed within 5-7 business days. The money will be returned to your original payment method.
                    </p>
                </section>
             </div>

             {/* Footer Note */}
             <div className="mt-24 pt-12 border-t border-white/5 text-center">
                 <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em] italic">
                     EBOOKSTUDIO SECURE BILLING
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
