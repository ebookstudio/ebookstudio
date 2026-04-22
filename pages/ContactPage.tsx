import React from 'react';
import { APP_NAME, IconSend, IconGlobe, IconInstagram } from '../constants';
import { Badge } from '../components/ui/badge';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-background pt-48 pb-32 selection:bg-white selection:text-black overflow-hidden">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-purple-600/5 rounded-full blur-[160px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-24">
            <h1 className="text-white text-5xl md:text-7xl font-serif font-bold italic mb-6">Contact Us</h1>
            <p className="text-zinc-500 text-lg font-medium italic">We're here to help you with anything you need.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Card */}
            <div className="lg:col-span-8 bg-white/5 border border-white/5 rounded-[3.5rem] p-12 md:p-16 backdrop-blur-3xl shadow-3xl">
                <h3 className="text-3xl text-white font-serif font-bold italic mb-12">Our Office</h3>
                
                <div className="space-y-12">
                    <div>
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-4 italic">Company Name</h4>
                        <p className="text-3xl text-white font-serif font-bold italic">{APP_NAME}</p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-4 italic">Registered Office</h4>
                        <p className="text-lg text-zinc-400 font-medium leading-relaxed italic">
                            Gala No. 1, 1st Floor, Patanwala Estate,<br/>
                            LBS Marg, Ghatkopar West,<br/>
                            Mumbai - 400086, MH.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-6 italic">Get in Touch</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <a href="mailto:opendev-labs.help@gmail.com" className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all shadow-inner">
                                <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                    <IconSend className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 italic">Email Support</p>
                                    <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors italic">opendev-labs.help@gmail.com</p>
                                </div>
                            </a>
                            <a href="https://ebookstudio.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all shadow-inner">
                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                    <IconGlobe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 italic">Website</p>
                                    <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors italic">ebookstudio.vercel.app</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-4 flex flex-col gap-10">
                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between flex-grow shadow-3xl backdrop-blur-2xl">
                    <div>
                        <h3 className="text-2xl text-white font-serif font-bold italic mb-6">Response Time</h3>
                        <p className="text-sm font-medium text-zinc-500 leading-relaxed italic mb-10">
                            We typically respond to all messages within 24 hours. For questions about your purchase, please include your Order ID.
                        </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 italic">Hours of Operation</p>
                        <p className="text-sm font-bold text-white italic mb-1">Mon - Fri</p>
                        <p className="text-xs font-medium text-zinc-500 italic">09:00 - 18:00 IST</p>
                    </div>
                </div>

                {/* Social Profiles */}
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 shadow-3xl backdrop-blur-2xl">
                     <h3 className="text-2xl text-white font-serif font-bold italic mb-8">Follow Us</h3>
                     <div className="space-y-6">
                        <a href="https://instagram.com/iamyash.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 text-zinc-500 hover:text-white transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-all border border-white/5 shadow-inner">
                                <IconInstagram className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold italic">@iamyash.io</span>
                        </a>
                        <a href="https://instagram.com/opendev-labs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 text-zinc-500 hover:text-white transition-all group">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-all border border-white/5 shadow-inner">
                                <IconInstagram className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold italic">@opendev-labs</span>
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