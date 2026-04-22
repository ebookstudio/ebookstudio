import React from 'react';
import { APP_NAME, IconCheck } from '../constants';
import CoAuthor from '../components/CoAuthor';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const PrivacyPolicyPage: React.FC = () => {
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
            <div className="flex justify-center mb-10">
                <CoAuthor size="md" className="shadow-[0_0_50px_rgba(139,92,246,0.1)]" />
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-serif font-bold italic mb-6">Privacy Policy</h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em] italic">
                Last Updated: {new Date().toLocaleDateString()}
            </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden backdrop-blur-3xl shadow-3xl">
             
             {/* Security Badge */}
             <div className="absolute top-0 right-0 p-12 opacity-50 hidden md:block">
                 <div className="flex items-center gap-4 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest italic">Data Securely Encrypted</span>
                 </div>
             </div>

             <div className="space-y-20 text-zinc-400 leading-relaxed italic">
                
                <section>
                    <h2 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">01</span>
                        Introduction
                    </h2>
                    <p className="text-lg font-medium leading-relaxed">
                        At {APP_NAME}, we take your privacy very seriously. This policy explains how we collect, use, and protect your personal information and the content you create on our platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">02</span>
                        Security
                    </h2>
                    <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 shadow-inner">
                        <p className="mb-10 text-xs font-bold text-white uppercase tracking-widest italic">
                            How we keep your data safe
                        </p>
                        <ul className="space-y-8">
                            <li className="flex gap-6 text-sm font-medium">
                                <IconCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                <span><strong className="text-white italic">Safe Login:</strong> We use Google's secure login system. We never see or store your password.</span>
                            </li>
                            <li className="flex gap-6 text-sm font-medium">
                                <IconCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                <span><strong className="text-white italic">Protected Content:</strong> Your book drafts are private and securely encrypted. Only you can access them.</span>
                            </li>
                            <li className="flex gap-6 text-sm font-medium">
                                <IconCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                <span><strong className="text-white italic">Secure Transfers:</strong> All information sent between your browser and our servers is protected by modern encryption.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">03</span>
                        What We Collect
                    </h2>
                    <p className="mb-8 text-lg font-medium italic">We only collect what is necessary to give you a great experience:</p>
                    <ul className="space-y-6 text-sm font-medium text-zinc-500">
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                            Your basic profile (Name, Email, and Profile Picture)
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                            Technical info (Browser type, Device info, and IP address)
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                            Your activity (The books you buy, save, or write)
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl text-white font-serif font-bold mb-8 flex items-center gap-6 italic">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-white">04</span>
                        Your Rights
                    </h2>
                    <p className="text-lg font-medium leading-relaxed italic">
                        You are in full control of your data. You can download your content or delete your account at any time. We will never sell your information to anyone.
                    </p>
                </section>

             </div>

             {/* Footer Note */}
             <div className="mt-24 pt-12 border-t border-white/5 text-center">
                 <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em] italic">
                     SECURED BY EBOOKSTUDIO
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;