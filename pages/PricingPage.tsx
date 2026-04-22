import React, { useState } from 'react';
import { 
    IconCheck, IconArrowRight, IconArrowUpRight,
    IconBook, IconFeather, RAZORPAY_KEY_ID
} from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../types';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userType, upgradeToSeller, setCurrentUser } = useAppContext();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

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
          alert('Payment system failed to load.');
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary/30 pt-32 pb-64">
      
      {/* --- HEADER --- */}
      <section className="px-6 mb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-[1px] bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Pricing Plans</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">Choose your path</h1>
                <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                    Simple, transparent pricing for creators of all levels. Invest in your digital architecture.
                </p>
            </div>

            <div className="flex justify-center">
                <div className="bg-zinc-900 p-1.5 rounded-lg border border-border inline-block shadow-2xl">
                    <Tabs value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)} className="w-fit">
                        <TabsList className="bg-transparent border-none p-0 h-10">
                            <TabsTrigger value="monthly" className="h-8 px-6 rounded-md text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950 transition-all">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly" className="h-8 px-6 rounded-md text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950 transition-all">
                                Yearly <Badge className="ml-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 border-none rounded">Save 20%</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* --- PLANS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-48">
            {/* Reader Plan */}
            <div className="bg-zinc-900 border border-border p-12 lg:p-16 rounded-xl flex flex-col h-full space-y-12 transition-all hover:border-zinc-800">
                <div className="space-y-6">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-border flex items-center justify-center text-zinc-400">
                        <IconBook className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Reader</h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">Discover and collect premium digital assets from creators worldwide.</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold tracking-tighter leading-none">$0</span>
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">/ Lifetime</span>
                    </div>
                </div>

                <div className="space-y-6 flex-1 pt-4">
                    {['Unlimited Browsing', 'Personal Digital Library', 'Device Sync', 'Priority Support'].map((feature) => (
                        <div key={feature} className="flex items-center gap-4">
                            <IconCheck className="w-4 h-4 text-zinc-600" />
                            <span className="text-zinc-400 text-xs font-semibold tracking-wide uppercase">{feature}</span>
                        </div>
                    ))}
                </div>

                <Button 
                    onClick={() => navigate('/store')}
                    variant="outline"
                    className="w-full h-12 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Get Started
                </Button>
            </div>

            {/* Creator Plan */}
            <div className="bg-zinc-900 border-2 border-primary/20 p-12 lg:p-16 rounded-xl flex flex-col h-full space-y-12 relative shadow-[0_0_50px_rgba(255,255,255,0.03)]">
                <div className="absolute top-8 right-8">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md border-none">Most Popular</Badge>
                </div>
                
                <div className="space-y-6">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center">
                        <IconFeather className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight text-zinc-100">Professional</h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">Advanced tools for architects, writers, and serious digital creators.</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold tracking-tighter leading-none text-zinc-100">${billingCycle === 'monthly' ? '4.44' : '44.44'}</span>
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">/ {billingCycle === 'monthly' ? 'Month' : 'Year'}</span>
                    </div>
                </div>

                <div className="space-y-6 flex-1 pt-4">
                    {[
                        'Full Studio Access', 
                        'High-Fidelity Hosting', 
                        'Custom Creator Site', 
                        '100% Revenue Recall', 
                        'Advanced Analytics'
                    ].map((feature) => (
                        <div key={feature} className="flex items-center gap-4">
                            <IconCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-zinc-300 text-xs font-semibold tracking-wide uppercase">{feature}</span>
                        </div>
                    ))}
                </div>

                {userType === UserType.SELLER ? (
                    <Button disabled className="w-full h-12 bg-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-widest cursor-default">
                        Current Plan
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubscribe}
                        disabled={isProcessing}
                        className="w-full h-12 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                        {isProcessing ? 'Processing...' : <>Upgrade Now <IconArrowRight className="w-4 h-4" /></>}
                    </Button>
                )}
            </div>
        </div>

        {/* --- FAQ --- */}
        <div className="max-w-4xl mx-auto pt-24 pb-48">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
                <p className="text-sm text-zinc-500 font-medium">Everything you need to know about our premium plans.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription whenever you wish. Your access remains active until the end of the billing period." },
                    { q: "Is my data secure?", a: "Your work is your own. We use enterprise-grade encryption to ensure your assets remain private and protected." },
                    { q: "How do I get paid?", a: "Revenue from your sales is synchronized instantly. We take zero commission from your creative sales." },
                    { q: "What is Studio Access?", a: "The Studio is our high-fidelity creation environment, designed to amplify your reach and refine your digital assets." }
                ].map((faq, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-border p-8 rounded-xl space-y-4 transition-all hover:bg-zinc-900">
                        <h4 className="text-zinc-100 font-bold text-base leading-tight">{faq.q}</h4>
                        <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CTA --- */}
        <div className="text-center py-24 bg-zinc-900 border border-border rounded-xl space-y-12 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none">Ready to build?</h2>
                    <p className="text-zinc-500 text-lg font-medium max-w-xl mx-auto">Join the next generation of digital architects today.</p>
                </div>
                <Button 
                    onClick={() => navigate('/ebook-studio')}
                    className="h-12 px-12 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 mx-auto"
                >
                    Launch Studio <IconArrowUpRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
