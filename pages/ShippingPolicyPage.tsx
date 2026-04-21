import React from 'react';
import { APP_NAME, IconRocket } from '../constants';

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative bg-black pt-32 pb-20 bg-dot-matrix">
      <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-fade-in">
        
        <div className="text-center mb-20">
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-2xl">
                <IconRocket className="w-8 h-8 text-black" />
            </div>
            <h1 className="type-display text-white mb-4">Distribution Protocol</h1>
            <p className="type-tiny text-zinc-500 font-mono uppercase tracking-[0.3em]">
                Instant Neural Delivery
            </p>
        </div>

        <div className="glass-card-premium rounded-[40px] p-8 md:p-16">
             <div className="space-y-12 text-zinc-400 leading-relaxed">
                
                <section>
                    <h3 className="type-h3 text-white mb-4">1. Instant Synthesis</h3>
                    <p className="type-body">
                        {APP_NAME} is a digital marketplace. We do not engage in physical logistics. Upon successful transaction, manuscript delivery is <strong className="text-white">instantaneous</strong>.
                    </p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">2. Access Nodes</h3>
                    <ul className="space-y-4 type-tiny text-zinc-500">
                        <li className="flex gap-4">
                            <strong className="text-white shrink-0">Library:</strong> 
                            <span>Integrated into your Personal Collection immediately.</span>
                        </li>
                        <li className="flex gap-4">
                            <strong className="text-white shrink-0">Email:</strong> 
                            <span>A secure access token is dispatched to your registered relay.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">3. Logistics Overhead</h3>
                    <p className="type-body">
                        There are <strong className="text-white">zero shipping fees</strong> associated with any protocol on {APP_NAME}.
                    </p>
                </section>

                <section>
                    <h3 className="type-h3 text-white mb-4">4. Transmission Latency</h3>
                    <p className="type-body">
                         If manuscript injection does not occur within 300 seconds of payment, please verify your spam filters or initiate a support request.
                    </p>
                </section>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
