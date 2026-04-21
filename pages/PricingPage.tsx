import React, { useState } from 'react';
import { 
    IconCheck, IconRocket, IconBrain, IconSparkles, 
    IconArrowRight, IconShieldCheck, IconZap,
    IconBook, IconFeather, RAZORPAY_KEY_ID
} from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MorphicEye from '../components/MorphicEye';

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
          alert('Payment system synchronization failed.');
          return;
      }

      setIsProcessing(true);
      // Pricing: $4.44 (approx 400 INR) monthly or $44.44 yearly
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
    <div className="min-h-screen bg-[#000000] pt-40 pb-64 selection:bg-white selection:text-black">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.02] rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
      </div>

      <div className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-32 max-w-4xl mx-auto">
            <div className="flex justify-center mb-12">
                <MorphicEye variant="hero" />
            </div>
            <Badge variant="outline" className="px-6 py-1.5 border-white/10 text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] rounded-full bg-white/5 mb-8">
                Economic Protocols / v3.5
            </Badge>
            <h1 className="text-white text-6xl md:text-9xl font-black tracking-tighter leading-none mb-12">Scale Your Mind.</h1>
            <p className="text-zinc-500 text-xl md:text-2xl font-medium leading-relaxed mb-16">
                Transparent resource allocation for the next generation of digital manuscripts. Choose your level of consciousness.
            </p>

            <div className="flex justify-center">
                <Tabs value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)} className="w-fit">
                    <TabsList className="bg-[#050505] border border-white/5 p-1 rounded-full h-16">
                        <TabsTrigger value="monthly" className="px-10 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Lunar Cycles</TabsTrigger>
                        <TabsTrigger value="yearly" className="px-10 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Solar Cycles <Badge className="ml-2 bg-emerald-500 text-black text-[8px] px-2 py-0">-20%</Badge></TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>

        {/* --- PLANS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-40">
            {/* Tier 1: Reader */}
            <Card className="bg-[#050505] border-white/5 rounded-[48px] overflow-hidden p-12 transition-all duration-700 group hover:border-white/10">
                <div className="mb-12">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-500 mb-10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <IconBook className="w-8 h-8" />
                    </div>
                    <h3 className="text-white text-3xl font-black tracking-tighter mb-4">Reader Node</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">Foundational access to the global archive.</p>
                </div>

                <div className="mb-12">
                    <div className="flex items-baseline gap-2">
                        <span className="text-white text-7xl font-black tracking-tighter leading-none">$0</span>
                        <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">/ Access Sync</span>
                    </div>
                </div>

                <div className="space-y-6 mb-16">
                    {['Unlimited Archive Access', 'HD Markdown Rendering', 'Cross-Device Sync', 'Neutral Interface'].map((feature) => (
                        <div key={feature} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                            <span className="text-zinc-400 text-xs font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <Button 
                    onClick={() => navigate('/store')}
                    className="w-full h-16 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
                >
                    Explore Repository
                </Button>
            </Card>

            {/* Tier 2: Creator */}
            <Card className="bg-[#050505] border-white/10 rounded-[48px] overflow-hidden p-12 transition-all duration-700 group hover:border-white/20 shadow-2xl relative">
                <div className="absolute top-10 right-10">
                    <Badge className="bg-white text-black px-4 py-1 text-[8px] font-black uppercase tracking-widest">Optimal</Badge>
                </div>
                
                <div className="mb-12 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white text-black flex items-center justify-center shadow-2xl mb-10 group-hover:scale-110 transition-transform duration-500">
                        <IconFeather className="w-8 h-8" />
                    </div>
                    <h3 className="text-white text-3xl font-black tracking-tighter mb-4">Creator Protocol</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">Full creative expansion for professional authors.</p>
                </div>

                <div className="mb-12 relative z-10">
                    <div className="flex items-baseline gap-2">
                        <span className="text-white text-7xl font-black tracking-tighter leading-none">${billingCycle === 'monthly' ? '4.44' : '44.44'}</span>
                        <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">/ {billingCycle === 'monthly' ? 'Cycle' : 'Annum'}</span>
                    </div>
                </div>

                <div className="space-y-6 mb-16 relative z-10">
                    {[
                        'Studio AI Neural Drafting', 
                        'Unlimited Book Deployment', 
                        'HD Cover Materialization', 
                        '70% Revenue Accrual', 
                        'Neural Content Analytics'
                    ].map((feature) => (
                        <div key={feature} className="flex items-center gap-4">
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <IconCheck className="w-3 h-3 text-black" />
                            </div>
                            <span className="text-white text-xs font-black uppercase tracking-wider">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="relative z-10">
                    {userType === UserType.SELLER ? (
                        <Button disabled className="w-full h-16 rounded-full bg-zinc-900 border border-white/5 text-zinc-600 font-black text-xs uppercase tracking-widest cursor-default opacity-50">
                            Sovereignty Active
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubscribe}
                            disabled={isProcessing}
                            className="w-full h-16 rounded-full bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl"
                        >
                            {isProcessing ? 'Authorizing...' : 'Initialize Creator Access'}
                        </Button>
                    )}
                </div>
            </Card>
        </div>

        {/* --- FAQ --- */}
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-white text-4xl font-black tracking-tighter mb-6">Protocol FAQ</h2>
                <p className="text-zinc-500 type-tiny uppercase tracking-widest">Clarifying the sovereign expansion.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { q: "How are neural tokens calculated?", a: "Each chapter synthesis consumes standard compute units based on length and complexity." },
                    { q: "Can I cancel my solar subscription?", a: "Protocols can be terminated at any time; access remains active until the end of the current cycle." },
                    { q: "Is my repository data private?", a: "All manuscripts are encrypted at rest and never used for global model fine-tuning without explicit consent." },
                    { q: "What is the revenue share?", a: "Creators keep 70% of all archive acquisition fees, with 30% supporting neural infrastructure." }
                ].map((faq, i) => (
                    <div key={i} className="p-10 rounded-[32px] bg-[#050505] border border-white/5 hover:border-white/10 transition-colors group">
                        <h4 className="text-white text-lg font-black tracking-tighter mb-4 group-hover:translate-x-2 transition-transform duration-500">{faq.q}</h4>
                        <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CTA FOOTER --- */}
        <div className="mt-64 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-12">
                <MorphicEye variant="logo" className="w-12 h-12" />
            </div>
            <h2 className="text-white text-5xl font-black tracking-tighter mb-8">Ready to Transcribe Reality?</h2>
            <Button 
                onClick={() => navigate('/studio')}
                className="h-20 px-16 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_80px_rgba(255,255,255,0.1)]"
            >
                Launch Sovereign Studio
            </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
