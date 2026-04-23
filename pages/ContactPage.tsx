import React from 'react';
import { APP_NAME, IconSend, IconGlobe, IconActivity } from '../constants';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 pt-40 pb-32 px-6 text-zinc-100 selection:bg-primary/30">
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-zinc-900/20 to-transparent" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-24 animate-fade-in">
        
        {/* Header Section */}
        <header className="space-y-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-zinc-500">
                <div className="w-8 h-[1px] bg-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Support Interface v2.0</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85]">Contact <br/><span className="text-zinc-500">Us.</span></h1>
                <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl">
                    We're here to optimize your creative workflow and resolve any system discrepancies.
                </p>
            </div>
        </header>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Primary Details */}
            <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 md:p-16 space-y-16">
                <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Registered Office</h4>
                    <div className="space-y-2">
                        <p className="text-3xl font-black tracking-tight text-zinc-100">{APP_NAME}</p>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                            Gala No. 1, 1st Floor, Patanwala Estate,<br/>
                            LBS Marg, Ghatkopar West,<br/>
                            Mumbai - 400086, MH.
                        </p>
                    </div>
                </section>

                <section className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Communication Channels</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <a href="mailto:opendev-labs.help@gmail.com" className="group p-8 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-all">
                            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all">
                                <IconSend className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Email Protocol</p>
                            <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">opendev-labs.help@gmail.com</p>
                        </a>
                        <a href="https://ebookstudio.vercel.app" className="group p-8 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-all">
                            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all">
                                <IconGlobe className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Digital Domain</p>
                            <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">ebookstudio.vercel.app</p>
                        </a>
                    </div>
                </section>
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 space-y-10">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Response Latency</h4>
                        <div className="flex items-end gap-3">
                            <p className="text-5xl font-black tracking-tighter text-zinc-100">&lt;24h</p>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2 shadow-glow-sm" />
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">Average turnaround time for support tickets.</p>
                    </div>

                    <div className="pt-8 border-t border-zinc-800 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Operational Hours</h4>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Mon — Fri</p>
                            <p className="text-xs text-zinc-500 font-medium tracking-wider">09:00 — 18:00 IST</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6">Social Integration</h4>
                    <div className="space-y-4">
                        {['Instagram', 'Twitter', 'LinkedIn'].map(platform => (
                            <div key={platform} className="flex items-center justify-between group cursor-pointer">
                                <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-100 transition-colors uppercase tracking-widest">{platform}</span>
                                <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center text-zinc-700 group-hover:text-zinc-100 transition-all">
                                    <IconActivity className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Note */}
        <footer className="pt-24 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">EbookStudio Enterprise Support</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-800">Part of the OpenDev-Labs Infrastructure</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <IconActivity className="w-4 h-4 text-zinc-500" />
            </div>
        </footer>

      </div>
    </div>
  );
};

export default ContactPage;