import React from 'react';
import { APP_NAME, IconBook } from '../constants';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-black pt-32 pb-20 bg-dot-matrix">
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-20">
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-2xl">
                <IconBook className="w-8 h-8 text-black" />
            </div>
            <h1 className="type-display text-white mb-4">Terms of Service</h1>
            <p className="type-tiny text-zinc-500 font-mono uppercase tracking-[0.3em]">
                Protocol Established: {new Date().toLocaleDateString()}
            </p>
        </div>

        {/* Content Card */}
        <div className="glass-card-premium rounded-[40px] p-8 md:p-16">
             <div className="space-y-16 text-zinc-400 leading-relaxed">
                
                <section>
                    <h3 className="type-h3 text-white mb-4">1. Neural Access Protocol</h3>
                    <p className="type-body">
                        By accessing <span className="text-white font-mono">ebook-engine.github.io</span>, you agree to be bound by these Terms of Service. If you do not agree to the operational parameters of this Agreement, you are not authorized to utilize this platform.
                    </p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">2. Intellectual Assets</h3>
                    <p className="type-body">
                        The Platform and its original architecture, features, and core functionality are owned by {APP_NAME} and are protected by international intellectual property laws.
                    </p>
                    <p className="mt-6 type-tiny text-zinc-500 bg-white/[0.02] p-6 rounded-2xl border border-white/5 italic">
                        <strong className="text-white">Note on Synthesized Content:</strong> Manuscripts generated via our AI-assisted studio belong to the user, subject to the limited use requirements of the underlying model providers.
                    </p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">3. External Synchronizations</h3>
                    <p className="type-body">
                        Our application integrates with Google API Services. Usage of these features constitutes acceptance of Google's Global Terms of Service.
                    </p>
                    <ul className="space-y-3 mt-6 type-tiny text-zinc-500">
                        <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-zinc-700"></div> Data is never transferred for external surveillance.</li>
                        <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-zinc-700"></div> Data is never commercialized for third-party brokerage.</li>
                        <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-zinc-700"></div> No usage of data for cross-platform advertising.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">4. Identity Integrity</h3>
                    <p className="type-body">
                        Upon account initiation, you must provide verified information. Failure to maintain identity integrity constitutes a breach of protocol, resulting in immediate suspension of access.
                    </p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">5. Liability Thresholds</h3>
                    <p className="type-body">
                        {APP_NAME} shall not be liable for any indirect, incidental, or systemic damages resulting from the use or inability to use our neural studio or marketplace.
                    </p>
                </section>

             </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;