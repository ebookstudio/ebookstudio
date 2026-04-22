import React from 'react';
import { APP_NAME, IconBook } from '../constants';
import { Badge } from '../components/ui/badge';

const TermsPage: React.FC = () => {
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
                <IconBook className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-serif font-bold italic mb-6">Terms of Service</h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em] italic">
                Effective Date: {new Date().toLocaleDateString()}
            </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden backdrop-blur-3xl shadow-3xl">
             <div className="space-y-20 text-zinc-400 leading-relaxed italic">
                
                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">01</span>
                        Acceptance of Terms
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        By using <span className="text-white font-mono italic">ebookstudio.vercel.app</span>, you agree to these rules. If you do not agree with this policy, you may not use our website.
                    </p>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">02</span>
                        Ownership
                    </h3>
                    <p className="text-lg font-medium leading-relaxed mb-8">
                        This website and its content are owned by {APP_NAME} and are protected by law.
                    </p>
                    <div className="bg-white/5 p-10 rounded-[2rem] border border-white/5 shadow-inner">
                        <Badge className="bg-white text-black mb-6 px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border-none shadow-lg">
                            Your Content
                        </Badge>
                        <p className="text-lg font-medium text-zinc-300 italic leading-relaxed">
                            The books you write using our AI belong to you. We do not claim any ownership over your creative work.
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">03</span>
                        Third-Party Services
                    </h3>
                    <p className="text-lg font-medium leading-relaxed mb-10">
                        We use Google's services for login and other features. By using them, you also agree to Google's terms.
                    </p>
                    <ul className="space-y-6 text-sm font-bold uppercase tracking-widest text-zinc-600">
                        <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-zinc-800"></div> Your data is never used for unwanted monitoring.</li>
                        <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-zinc-800"></div> Your data is never sold to third parties.</li>
                        <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-zinc-800"></div> We do not show you personalized ads.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">04</span>
                        Your Account
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        When signing up, you must provide true information. Providing false information is a violation of our terms and may lead to account suspension.
                    </p>
                </section>

                <section>
                    <h3 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">05</span>
                        Limitation of Liability
                    </h3>
                    <p className="text-lg font-medium leading-relaxed">
                        {APP_NAME} is not responsible for any damages resulting from your use of this website.
                    </p>
                </section>

             </div>

             {/* Footer Note */}
             <div className="mt-24 pt-12 border-t border-white/5 text-center">
                 <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em] italic">
                     EBOOKSTUDIO LEGAL DEPARTMENT
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;