import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
    IconShoppingCart, IconTrash, IconRazorpay, IconRocket, 
    IconStore, IconCreditCard, IconArrowRight, IconShieldCheck,
    IconChevronLeft
} from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import CoAuthor from '../components/CoAuthor';
import { razorpayService } from '../services/razorpayService';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

const CheckoutPage: React.FC = () => {
    const { cart, removeFromCart, currentUser, RAZORPAY_KEY_ID, clearCart, finalizePurchase } = useAppContext();
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

        try {
            // 1. Create Razorpay Order via Real API Service
            const firstBook = cart[0];
            const order = await razorpayService.createOrder(
                total, 
                currentUser.id, 
                cart.map(item => item.id),
                firstBook.sellerId,
                (firstBook as any).sellerUpiId // Assuming this exists or retrieve from context
            );

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "EbookStudio",
                description: `Acquisition of ${cart.length} High-Fidelity Publications`,
                image: "https://ebookstudio.vercel.app/logo.png",
                order_id: order.id,
                handler: async function (response: any) {
                    // 2. Verify Payment (Simulated)
                    const isVerified = await razorpayService.verifyPayment(response, order.id);
                    
                    if (isVerified) {
                        // 3. Finalize Purchase in App Context
                        await finalizePurchase([...cart]);
                        clearCart();
                        navigate('/dashboard');
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                },
                theme: {
                    color: "#09090b",
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment Failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment Error", error);
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-10">
                <div className="relative z-10 text-center max-w-lg animate-fade-in space-y-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-zinc-900 border border-border shadow-2xl">
                        <IconShoppingCart className="w-8 h-8 text-zinc-700" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-zinc-100 text-5xl font-bold tracking-tighter">Cart is empty.</h1>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                            Select premium high-fidelity publications from our secure marketplace.
                        </p>
                    </div>
                    <Button 
                        onClick={() => navigate('/store')}
                        className="h-12 px-12 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
                    >
                        Browse Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-64 relative overflow-hidden">
            <div className="container mx-auto px-8 max-w-7xl relative z-10">
                <header className="mb-24">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/store')}
                        className="p-0 text-zinc-600 hover:text-zinc-100 mb-8 group transition-colors font-bold text-[10px] uppercase tracking-[0.3em]"
                    >
                        <IconChevronLeft className="mr-3 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                        Marketplace
                    </Button>
                    <h1 className="text-zinc-100 text-6xl font-bold tracking-tighter leading-none">Checkout</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* --- CART ITEMS --- */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Order Manifest ({cart.length} items)</h3>
                        </div>
                        {cart.map((item) => (
                            <div key={item.id} className="bg-zinc-900 border border-border p-6 rounded-xl group hover:border-zinc-700 transition-all">
                                <div className="flex gap-8">
                                    <div className="w-24 h-32 flex-shrink-0 relative overflow-hidden rounded-md border border-border shadow-xl">
                                        <img src={item.coverImageUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <div className="flex justify-between items-start mb-4 gap-6">
                                            <div className="min-w-0">
                                                <h3 className="text-zinc-100 text-lg font-bold tracking-tight truncate">{item.title}</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Authored by {item.author}</p>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-8 h-8 rounded-md bg-zinc-950 text-zinc-800 hover:text-red-500 transition-all flex items-center justify-center border border-border"
                                            >
                                                <IconTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="px-2 py-0.5 bg-zinc-950 border border-border text-zinc-600 text-[8px] font-black uppercase tracking-widest rounded">
                                                {item.genre}
                                            </div>
                                            <span className="text-zinc-100 text-lg font-bold tracking-tight">${item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- SUMMARY --- */}
                    <div className="lg:col-span-5">
                        <div className="bg-zinc-900 border border-border p-8 lg:p-12 rounded-2xl sticky top-32 shadow-2xl space-y-10">
                            <h2 className="text-zinc-100 text-xl font-bold tracking-tight">Summary</h2>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Subtotal</span>
                                    <span className="text-zinc-100 font-bold text-lg tracking-tight">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Service Tax (18%)</span>
                                    <span className="text-zinc-100 font-bold text-lg tracking-tight">${tax.toFixed(2)}</span>
                                </div>
                                <Separator className="bg-zinc-800" />
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Amount</span>
                                    <span className="text-zinc-100 text-4xl font-bold tracking-tighter">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-zinc-950 border border-border space-y-4">
                                <div className="flex items-center gap-3">
                                    <IconShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-zinc-100 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Checkout</span>
                                </div>
                                <p className="text-zinc-600 text-[10px] font-medium leading-relaxed leading-relaxed">
                                    Transactions processed via industrial-grade encrypted payment protocols.
                                </p>
                            </div>

                            <Button 
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="w-full h-12 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 group"
                            >
                                {isProcessing ? (
                                    <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <IconCreditCard className="w-4 h-4" /> Finalize Acquisition
                                    </>
                                )}
                            </Button>
                            
                            <div className="text-center">
                                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-700">Protected by EbookStudio OS Architecture</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
