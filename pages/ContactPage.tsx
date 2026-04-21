
import React from 'react';
import { APP_NAME, IconSend, IconGlobe, IconInstagram } from '../constants';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-black pt-32 pb-20 bg-dot-matrix">
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-fade-in">
        
        <div className="text-center mb-20">
            <h1 className="type-display text-white mb-4">Contact Support</h1>
            <p className="type-body text-muted">Technical assistance and merchant inquiries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Card */}
            <div className="md:col-span-2 glass-card-premium rounded-[40px] p-8 md:p-12">
                <h3 className="type-h3 text-white mb-10">Nexus Point</h3>
                
                <div className="space-y-10">
                    <div>
                        <h4 className="type-tiny font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Merchant Identity</h4>
                        <p className="type-h3 text-white">{APP_NAME}</p>
                        <p className="type-tiny text-zinc-500 mt-1">Sovereign Entity by opendev-labs</p>
                    </div>

                    <div>
                        <h4 className="type-tiny font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Registered Operations</h4>
                        <p className="type-body text-zinc-300 leading-relaxed">
                            Gala No. 1, 1st Floor, Patanwala Estate,<br/>
                            LBS Marg, Ghatkopar West,<br/>
                            Mumbai - 400086, MH.
                        </p>
                    </div>

                    <div>
                        <h4 className="type-tiny font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Secure Channels</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center shadow-xl">
                                    <IconSend className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="type-tiny text-zinc-500 uppercase font-bold tracking-widest">Global Mail</p>
                                    <a href="mailto:opendev-labs.help@gmail.com" className="type-tiny font-bold text-white group-hover:text-sky-400 transition-colors">opendev-labs.help@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 text-white flex items-center justify-center shadow-xl">
                                    <IconGlobe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="type-tiny text-zinc-500 uppercase font-bold tracking-widest">Network</p>
                                    <a href="https://ebookstudio.vercel.app" target="_blank" rel="noopener noreferrer" className="type-tiny font-bold text-white group-hover:text-sky-400 transition-colors">ebookstudio.vercel.app</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="flex flex-col gap-8">
                <div className="glass-card-premium rounded-[40px] p-8 flex flex-col justify-between flex-grow">
                    <div>
                        <h3 className="type-h3 text-white mb-4">Response SLA</h3>
                        <p className="type-tiny text-zinc-400 leading-relaxed mb-8">
                            Our neural response team usually synchronizes within 24 hours. For critical payment issues, please attach your Protocol ID.
                        </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <p className="type-tiny font-bold text-zinc-500 uppercase tracking-widest mb-2">Live Window</p>
                        <p className="type-tiny font-bold text-white">Mon - Fri</p>
                        <p className="type-tiny text-zinc-500">09:00 - 18:00 IST</p>
                    </div>
                </div>

                {/* Social Profiles */}
                <div className="glass-card-premium rounded-[32px] p-8">
                     <h3 className="type-h3 text-white mb-6">Social Grid</h3>
                     <div className="space-y-5">
                        <a href="https://instagram.com/iamyash.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:text-rose-400 transition-all border border-white/5">
                                <IconInstagram className="w-5 h-5" />
                            </div>
                            <span className="type-tiny font-bold">@iamyash.io</span>
                        </a>
                        <a href="https://instagram.com/opendev-labs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors group">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:text-rose-400 transition-all border border-white/5">
                                <IconInstagram className="w-5 h-5" />
                            </div>
                            <span className="type-tiny font-bold">@opendev-labs</span>
                        </a>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;