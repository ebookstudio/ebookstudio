import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
    IconShoppingCart, IconTrash, IconRazorpay, IconRocket, 
    IconStore, IconCreditCard, IconArrowRight, IconShieldCheck,
    IconChevronLeft
} from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import MorphicEye from '../components/MorphicEye';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const { useNavigate } = ReactRouterDOM as any;

const CheckoutPage: React.FC = () => {
    const { cart, removeFromCart, currentUser, RAZORPAY_KEY_ID, clearCart } = useAppContext();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { 
            if (document.body.contains(script)) {
                document.body.removeChild(script); 
            }
        };
    }, []);

    const handleCheckout = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) return;

        setIsProcessing(true);

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: Math.round(total * 100), 
            currency: "INR",
            name: "EbookStudio Archive",
            description: `Archive Acquisition (${cart.length} Fragments)`,
            image: "https://ebookstudio.vercel.app/logo.png",
            handler: function (response: any) {
                clearCart();
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
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Sync Interrupted: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment Protocol Error", error);
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-8 selection:bg-white selection:text-black">
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[140px]" />
                    <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
                </div>
                
                <div className="relative z-10 text-center max-w-2xl">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-12">
                        <IconShoppingCart className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h1 className="text-white text-6xl font-black tracking-tighter mb-8 leading-tight">Your Neural Buffer is Empty.</h1>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mb-16 leading-loose max-w-sm mx-auto">
                        The archive awaits your selection. Synchronize fragments from the marketplace to initialize acquisition.
                    </p>
                    <Button 
                        onClick={() => navigate('/store')}
                        className="h-20 px-12 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
                    >
                        <IconStore className="w-4 h-4 mr-3" /> Browse Archive
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] pt-40 pb-64 selection:bg-white selection:text-black">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.02] rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
            </div>

            <div className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10">
                <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="max-w-3xl">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/store')}
                            className="p-0 text-zinc-600 hover:text-white mb-8 group transition-colors"
                        >
                            <IconChevronLeft className="mr-3 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Back to Store</span>
                        </Button>
                        <Badge variant="outline" className="px-6 py-1.5 border-white/10 text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] rounded-full bg-white/5 mb-8">
                            Transaction Protocol / v1.0
                        </Badge>
                        <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">Settlement.</h1>
                        <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                            Finalize the synchronization of {cart.length} archive fragments to your personal repository.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* --- CART ITEMS --- */}
                    <div className="lg:col-span-8">
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <Card key={item.id} className="bg-[#050505] border-white/5 rounded-[40px] overflow-hidden p-8 group hover:border-white/10 transition-all duration-500">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="w-full md:w-32 h-44 flex-shrink-0 relative">
                                            <img src={item.coverImageUrl} className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl" />
                                            <div className="absolute inset-0 rounded-2xl border border-white/5" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-white text-2xl font-black tracking-tighter mb-2">{item.title}</h3>
                                                    <p className="type-tiny opacity-40">Protocol by {item.author}</p>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-12 h-12 rounded-full bg-white/5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all p-0"
                                                >
                                                    <IconTrash className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <Badge variant="outline" className="px-4 py-1 border-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-600">
                                                    {item.genre}
                                                </Badge>
                                                <span className="text-white text-3xl font-black tracking-tighter">${item.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* --- SUMMARY --- */}
                    <div className="lg:col-span-4">
                        <Card className="bg-[#050505] border-white/10 rounded-[48px] p-10 sticky top-40 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-dot-matrix opacity-[0.05] pointer-events-none" />
                            <h2 className="text-white text-2xl font-black tracking-tighter mb-10 relative z-10">Protocol Summary</h2>
                            
                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-black">Subtotal Protocol</span>
                                    <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-black">Neural GST (18%)</span>
                                    <span className="text-white font-mono">${tax.toFixed(2)}</span>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Fee</span>
                                    <span className="text-white text-5xl font-black tracking-tighter leading-none">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 mb-12 relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <IconShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Encrypted Sync</span>
                                </div>
                                <p className="text-zinc-500 text-[9px] font-medium leading-relaxed">
                                    Your transaction is secured by industrial-grade cryptographic protocols via Razorpay.
                                </p>
                            </div>

                            <Button 
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="w-full h-20 rounded-full bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl group relative z-10"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <IconCreditCard className="w-4 h-4 mr-3" /> Initialize Ingestion
                                        <IconArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                            
                            <Button 
                                variant="ghost"
                                onClick={() => navigate('/store')}
                                className="w-full h-14 mt-4 rounded-full text-zinc-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest relative z-10"
                            >
                                Continue Browsing
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
