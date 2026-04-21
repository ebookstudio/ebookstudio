import React from 'react';
import { APP_NAME, IconCheck } from '../constants';
import MorphicEye from '../components/MorphicEye';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-black pt-32 pb-20 bg-dot-matrix">
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-20">
            <div className="flex justify-center mb-8">
                <MorphicEye className="w-20 h-20 border border-white/20 bg-black shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-full" isActive={true} />
            </div>
            <h1 className="type-display text-white mb-4">Privacy Policy</h1>
            <p className="type-tiny text-zinc-500 font-mono uppercase tracking-[0.3em]">
                Last Synchronized: {new Date().toLocaleDateString()}
            </p>
        </div>

        {/* Content Card */}
        <div className="glass-card-premium rounded-[40px] p-8 md:p-16 relative overflow-hidden">
             
             {/* Security Badge */}
             <div className="absolute top-0 right-0 p-8 opacity-50 hidden md:block">
                 <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="type-tiny font-bold text-emerald-400 uppercase tracking-widest">Quantum Encryption Active</span>
                 </div>
             </div>

             <div className="space-y-16 text-zinc-400 leading-relaxed">
                
                <section>
                    <h2 className="type-h3 text-white mb-6 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center type-tiny font-bold border border-white/10 text-white">01</span>
                        Initiation
                    </h2>
                    <p className="type-body">
                        At {APP_NAME}, accessible via <span className="text-white font-mono">ebook-engine.github.io</span>, the integrity of your neural assets and personal data is our primary directive. This Privacy Protocol outlines the parameters of data ingestion and retention.
                    </p>
                </section>

                <section>
                    <h2 className="type-h3 text-white mb-6 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center type-tiny font-bold border border-white/10 text-white">02</span>
                        Core Security Architecture
                    </h2>
                    <div className="glass-card-premium bg-white/[0.02] rounded-3xl p-8">
                        <p className="mb-6 type-tiny font-bold text-white uppercase tracking-widest">
                            Compliance with Global Security Standards
                        </p>
                        <ul className="space-y-5">
                            <li className="flex gap-4 type-tiny text-zinc-400">
                                <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span><strong className="text-white">Authentication:</strong> We utilize Google OAuth 2.0 for secure identity verification. Your credentials never touch our persistent storage.</span>
                            </li>
                            <li className="flex gap-4 type-tiny text-zinc-400">
                                <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span><strong className="text-white">Data Isolation:</strong> Manuscript drafts are processed within isolated secure enclaves. Long-term assets are encrypted at rest using AES-256.</span>
                            </li>
                            <li className="flex gap-4 type-tiny text-zinc-400">
                                <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span><strong className="text-white">Neural Processing:</strong> All AI-generated content via Gemini is transmitted through TLS 1.3 encrypted tunnels.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="type-h3 text-white mb-6 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center type-tiny font-bold border border-white/10 text-white">03</span>
                        Inbound Data Metrics
                    </h2>
                    <p className="mb-6 type-body">We monitor specific metrics to optimize your creative experience:</p>
                    <ul className="space-y-3 type-tiny text-zinc-500">
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                            Identity Metrics (Name, Email, Verified Avatar)
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                            System Telemetry (IP Address, Protocol Version, Duration)
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                            Protocol History (Acquisition logs and manuscript access)
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="type-h3 text-white mb-6 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center type-tiny font-bold border border-white/10 text-white">04</span>
                        Sovereign Rights
                    </h2>
                    <p className="type-body">
                        You maintain total sovereignty over your data. You may request a full export of your neural history or trigger a permanent purge of all associated records via your Control Dashboard at any time.
                    </p>
                </section>

             </div>

             {/* Footer Note */}
             <div className="mt-20 pt-10 border-t border-white/5 text-center">
                 <p className="type-tiny text-zinc-600 uppercase tracking-[0.5em]">
                     SECURED BY EBOOK-ENGINE ENCLAVE
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;