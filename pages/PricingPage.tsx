import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { IconCheck, IconSparkles, RAZORPAY_KEY_ID, APP_NAME, IconStar, IconBook, IconRocket, IconFeather } from '../constants';
import { UserType } from '../types';

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

        // Load Razorpay Script
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
            alert('Could not load payment gateway. Please try again.');
            return;
        }

        setIsProcessing(true);

        // Note: Amount remains for Razorpay logic but UI shows USD for global appeal
        const amount = billingCycle === 'monthly' ? 444 : 4444;
        
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100, 
            currency: "INR",
            name: "EbookStudio",
            description: `Pro Creator Subscription (${billingCycle})`,
            image: "https://raw.githubusercontent.com/atherosai/OpenStore.io/main/vite.svg",
            handler: function (response: any) {
                upgradeToSeller();
                alert(`Welcome to the Writer Dashboard! Payment ID: ${response.razorpay_payment_id}`);
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
                alert(`Payment Failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment initialization failed", error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-black font-sans">
            
            {/* === Background Effects === */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                 <div className="absolute inset-0 bg-dot-matrix opacity-20"></div>
            </div>

            <div className="container mx-auto px-6 pt-32 pb-24 animate-fade-in max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <h1 className="type-display text-gradient mb-6">
                        Choose Your Plan
                    </h1>
                    <p className="type-body text-muted max-w-2xl mx-auto">
                        Start for free or upgrade to sell your own books and unlock professional AI-powered tools.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-12">
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex items-center backdrop-blur-md">
                            <button 
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-8 py-2.5 rounded-xl type-tiny transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button 
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-8 py-2.5 rounded-xl type-tiny transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Yearly <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-bold">SAVE 15%</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    
                    {/* 1. Reader Plan */}
                    <div className="glass-card-premium p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10">
                                    <IconBook className="w-6 h-6" />
                                </div>
                                <h3 className="type-h2">Reader</h3>
                            </div>
                            
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="type-display text-4xl">$0</span>
                                    <span className="type-tiny text-dim">/ forever</span>
                                </div>
                            </div>

                            <p className="type-small text-muted mb-10">
                                Discover unlimited stories, read free books, and build your personal digital library.
                            </p>

                            <ul className="space-y-4 mb-12">
                                {['Read Unlimited Books', 'Build Your Library', 'Cross-Device Sync', 'Access Free Content'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 type-small text-zinc-300">
                                        <IconCheck className="w-4 h-4 text-zinc-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button 
                            onClick={() => navigate('/store')}
                            className="btn-secondary w-full"
                        >
                            Explore Store
                        </button>
                    </div>

                    {/* 2. Creator Plan */}
                    <div className="glass-card-premium p-10 border-white/20 relative flex flex-col justify-between bg-white/[0.03]">
                        {/* Most Popular Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black type-tiny rounded-full shadow-xl">
                            Most Popular
                        </div>

                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl">
                                    <IconFeather className="w-6 h-6" />
                                </div>
                                <h3 className="type-h2">Writer</h3>
                            </div>
                            
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="type-display text-4xl">${billingCycle === 'monthly' ? '4.44' : '44.44'}</span>
                                    <span className="type-tiny text-dim">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                </div>
                            </div>

                            <p className="type-small text-muted mb-10">
                                Unleash your creativity with Studio AI, publish your books, and start earning today.
                            </p>

                            <ul className="space-y-4 mb-12">
                                {[
                                    'Studio AI Neural Engine', 
                                    'Publish Unlimited Books', 
                                    'Custom Creator Site', 
                                    'Earn 70% Revenue Share', 
                                    'Advanced Analytics'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 type-small text-white">
                                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                            <IconCheck className="w-3 h-3 text-black" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            {userType === UserType.SELLER ? (
                                <div className="btn-secondary w-full opacity-50 cursor-default">
                                    Active Plan
                                </div>
                            ) : (
                                <button 
                                    onClick={handleSubscribe}
                                    disabled={isProcessing}
                                    className="btn-primary w-full"
                                >
                                    {isProcessing ? 'Processing...' : 'Go Professional'}
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
                                    className="type-tiny text-zinc-600 hover:text-zinc-400 transition-colors py-2"
                                >
                                    Instant Upgrade (Dev)
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

