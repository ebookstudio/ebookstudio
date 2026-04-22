import React from 'react';
import { APP_NAME, IconRocket } from '../constants';

const ShippingPolicyPage: React.FC = () => {
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
                <IconRocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-serif font-bold italic mb-6">Delivery Policy</h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em] italic">
                Instant Digital Delivery
            </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden backdrop-blur-3xl shadow-3xl">
             <div className="space-y-20 text-zinc-400 leading-relaxed italic">
                
                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">01</span>
                        Instant Delivery
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        {APP_NAME} is a digital marketplace. We do not sell physical books, so there is no physical shipping involved. Your book is delivered <strong className="text-white italic">instantly</strong> as soon as your payment is confirmed.
                    </p>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">02</span>
                        How to Access
                    </h3>
                    <ul className="space-y-8 text-sm font-bold uppercase tracking-widest text-zinc-600">
                        <li className="flex gap-6">
                            <strong className="text-white shrink-0 italic">Library:</strong> 
                            <span>The book is added to your personal library immediately.</span>
                        </li>
                        <li className="flex gap-6">
                            <strong className="text-white shrink-0 italic">Email:</strong> 
                            <span>A confirmation email is sent to your registered email address.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">03</span>
                        Shipping Costs
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        There are <strong className="text-white italic">no shipping fees</strong> for any of our products on {APP_NAME}.
                    </p>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">04</span>
                        Delivery Issues
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                         If you don't see your book in your library within 5 minutes of payment, please check your email spam folder or contact our support team.
                    </p>
                </section>
             </div>

             {/* Footer Note */}
             <div className="mt-24 pt-12 border-t border-white/5 text-center">
                 <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em] italic">
                     EBOOKSTUDIO INSTANT ACCESS
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
