import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { IconCheck, RAZORPAY_KEY_ID, IconBook, IconFeather } from '../constants';
import { UserType } from '../types';
import MorphicEye from '../components/MorphicEye';

const { useNavigate } = ReactRouterDOM as any;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingPage: React.FC = () => {
    const { currentUser, userType, upgradeToSeller, setCurrentUser } = useAppContext();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleSubscribe = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const loadRazorpay = () => {
            return new Promise((resolve) => {
                if (window.Razorpay) {
                    resolve(true);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            alert('Payment system synchronization failed.');
            return;
        }

        setIsProcessing(true);
        const amount = billingCycle === 'monthly' ? 444 : 4444;
        
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100, 
            currency: "INR",
            name: "EbookStudio",
            description: `Pro Access (${billingCycle})`,
            image: "https://ebookstudio.vercel.app/logo.png",
            handler: function (response: any) {
                upgradeToSeller();
                navigate('/dashboard');
                setIsProcessing(false);
            },
            prefill: {
                name: currentUser.name,
                email: currentUser.email,
            },
            theme: {
                color: "#000000",
            },
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Transaction Failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment initialization failed", error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-[#000000] font-sans overflow-hidden">
            
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-dot-matrix opacity-[0.3]" />
            </div>

            <div className="container mx-auto px-6 pt-48 pb-32 max-w-7xl relative z-10">
                {/* Header Section */}
                <div className="text-center mb-32 max-w-3xl mx-auto">
                    <div className="flex justify-center mb-10">
                        <MorphicEye variant="logo" className="w-12 h-12 opacity-50" />
                    </div>
                    <h1 className="type-display text-white text-6xl md:text-8xl font-black tracking-tight mb-8">
                        The Creator <br /> Protocol.
                    </h1>
                    <p className="type-body text-zinc-500 text-xl leading-relaxed">
                        Secure your sovereignty as a creator. Access professional neural tools and monetize your vision globally.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-16">
                        <div className="bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-3xl flex items-center shadow-2xl">
                            <button 
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-10 py-3 rounded-full type-tiny transition-all duration-700 ${billingCycle === 'monthly' ? 'bg-white text-black font-black' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button 
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-10 py-3 rounded-full type-tiny transition-all duration-700 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-black font-black' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Yearly <span className="bg-white/10 text-white/50 px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] uppercase">Save 15%</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Architecture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    
                    {/* Reader Tier */}
                    <div className="glass-card-premium p-16 flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-white border border-white/10 transition-transform group-hover:scale-110">
                                    <IconBook className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="type-h3 text-white text-sm uppercase tracking-[0.3em] font-black mb-1">Protocol</h3>
                                    <h4 className="type-h2 text-white text-3xl font-black">Reader</h4>
                                </div>
                            </div>
                            
                            <div className="mb-12">
                                <div className="flex items-baseline gap-2">
                                    <span className="type-display text-5xl text-white font-black">$0</span>
                                    <span className="type-tiny text-zinc-600 font-bold tracking-widest uppercase">/ Synchronized</span>
                                </div>
                            </div>

                            <ul className="space-y-6 mb-16">
                                {['Unlimited Reader Access', 'Cross-Device Library', 'Neutral Interface', 'Global Sync'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-zinc-500 text-sm font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button 
                            onClick={() => navigate('/store')}
                            className="btn-secondary w-full rounded-full py-6 text-xs"
                        >
                            Explore Store
                        </button>
                    </div>

                    {/* Writer Tier */}
                    <div className="glass-card-premium p-16 border-white/20 relative flex flex-col justify-between bg-white/[0.04] group">
                        {/* Elite Badge */}
                        <div className="absolute -top-4 right-12 px-6 py-2 bg-white text-black type-tiny font-black text-[9px] tracking-[0.3em] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            Premium Access
                        </div>

                        <div>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-16 rounded-[24px] bg-white text-black flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                                    <IconFeather className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="type-h3 text-zinc-400 text-sm uppercase tracking-[0.3em] font-black mb-1">Protocol</h3>
                                    <h4 className="type-h2 text-white text-3xl font-black">Writer</h4>
                                </div>
                            </div>
                            
                            <div className="mb-12">
                                <div className="flex items-baseline gap-2">
                                    <span className="type-display text-5xl text-white font-black">${billingCycle === 'monthly' ? '4.44' : '44.44'}</span>
                                    <span className="type-tiny text-zinc-400 font-bold tracking-widest uppercase">/ {billingCycle === 'monthly' ? 'Cycle' : 'Year'}</span>
                                </div>
                            </div>

                            <ul className="space-y-6 mb-16">
                                {[
                                    'Studio AI Neural Drafting', 
                                    'Unlimited Book Deployment', 
                                    'Custom Sovereign Domain', 
                                    '70% Revenue Accrual', 
                                    'Neural Content Analytics'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-white text-sm font-bold">
                                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                            <IconCheck className="w-3.5 h-3.5 text-black" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4">
                            {userType === UserType.SELLER ? (
                                <div className="btn-secondary w-full py-6 rounded-full opacity-50 cursor-default text-xs uppercase tracking-widest">
                                    Sovereignty Active
                                </div>
                            ) : (
                                <button 
                                    onClick={handleSubscribe}
                                    disabled={isProcessing}
                                    className="btn-primary w-full py-6 rounded-full text-xs font-black shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                                >
                                    {isProcessing ? 'Synchronizing...' : 'Initialize Creator Access'}
                                </button>
                            )}

                            {import.meta.env.DEV && (
                                <button 
                                    onClick={() => {
                                        if (!currentUser) {
                                            setCurrentUser({
                                                id: 'dev-user',
                                                name: 'Dev Author',
                                                email: 'dev@ebookstudio.io',
                                                isVerified: true,
                                                profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev'
                                            }, UserType.USER);
                                        }
                                        setTimeout(() => {
                                            upgradeToSeller();
                                            navigate('/dashboard');
                                        }, 100);
                                    }}
                                    className="type-tiny text-zinc-600 hover:text-white transition-colors py-2 tracking-[0.3em] font-black"
                                >
                                    [ Override System ]
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;

