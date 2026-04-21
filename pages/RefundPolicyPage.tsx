import React from 'react';
import { APP_NAME, IconWallet } from '../constants';

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-black pt-32 pb-20 bg-dot-matrix">
      <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-fade-in">
        
        <div className="text-center mb-20">
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-2xl">
                <IconWallet className="w-8 h-8 text-black" />
            </div>
            <h1 className="type-display text-white mb-4">Refund Protocol</h1>
            <p className="type-tiny text-zinc-500 font-mono uppercase tracking-[0.3em]">
                Digital Assets & Liquidations
            </p>
        </div>

        <div className="glass-card-premium rounded-[40px] p-8 md:p-16">
             <div className="space-y-12 text-zinc-400 leading-relaxed">
                  <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
                      <h3 className="type-tiny font-black text-rose-400 mb-3 uppercase tracking-[0.2em]">Mandatory Disclosure</h3>
                      <p className="type-body text-zinc-300">
                         Given the instantaneous nature of digital manuscripts, acquisitions are generally <strong className="text-white">final and non-refundable</strong> once the secure access token is generated.
                      </p>
                  </div>

                <section>
                    <h3 className="type-h3 text-white mb-4">1. Acquisition Cancellation</h3>
                    <p className="type-body">
                        Orders cannot be terminated once the payment sequence is completed and the manuscript is injected into your library.
                    </p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">2. Anomaly Resolution</h3>
                    <p className="type-body mb-6">We may authorize a credit reversal under the following critical failures:</p>
                    <ul className="space-y-3 type-tiny text-zinc-500">
                        <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-zinc-700"></div> Systemic corruption of the eBook file.</li>
                        <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-zinc-700"></div> Duplicate transaction logs for identical items.</li>
                    </ul>
                    <p className="mt-8 type-tiny text-zinc-600 italic">Anomalies must be reported within 168 hours (7 days) of acquisition.</p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">3. Reconciliation Timeline</h3>
                    <p className="type-body">
                        Authorized reversals are finalized within 5-7 terrestrial business days. Credits will be returned via the original gateway.
                    </p>
                </section>
             </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
