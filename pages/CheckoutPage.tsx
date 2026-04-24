import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
    IconShoppingCart, IconTrash, IconRazorpay, IconRocket, 
    IconStore, IconCreditCard, IconArrowRight, IconShieldCheck,
    IconChevronLeft, IconSparkles
} from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { razorpayService } from '../services/razorpayService';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutItem from '../components/CheckoutItem';

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

        // --- HELPER TO OPEN RAZORPAY MODAL ---
        const openRazorpayModal = (orderData: any, isDemo: boolean = false) => {
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency || "INR",
                name: "EbookStudio",
                description: isDemo 
                    ? `[DEMO MODE] Acquisition of ${cart.length} Publications`
                    : `Acquisition of ${cart.length} High-Fidelity Publications`,
                image: "https://ebookstudio.vercel.app/logo.png",
                order_id: orderData.id,
                handler: async function (response: any) {
                    if (isDemo) {
                        alert("Demo Payment Successful! In a real scenario, this would verify the payment and finalize the order.");
                        await finalizePurchase([...cart]);
                        clearCart();
                        navigate('/dashboard');
                    } else {
                        const isVerified = await razorpayService.verifyPayment(response, orderData.id);
                        if (isVerified) {
                            await finalizePurchase([...cart]);
                            clearCart();
                            navigate('/dashboard');
                        }
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                },
                theme: { color: "#09090b" },
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
        };

        try {
            const firstBook = cart[0];
            const order = await razorpayService.createOrder(
                total, 
                currentUser.id, 
                cart.map(item => item.id),
                firstBook.sellerId,
                (firstBook as any).sellerUpiId 
            );

            openRazorpayModal(order);

        } catch (error: any) {
            console.error("Payment Error", error);
            
            // Fallback for Local Development / Missing API
            if (window.location.hostname === 'localhost') {
                console.warn("API Error detected on localhost. Falling back to Razorpay Demo Mode for UI verification.");
                openRazorpayModal({
                    amount: Math.round(total * 100),
                    currency: "INR",
                    id: "" // Razorpay opens in standard mode without order_id
                }, true);
            } else {
                alert("Payment initialization failed: " + (error.message || "Unknown error"));
                setIsProcessing(false);
            }
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-matrix opacity-[0.05]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-100/[0.02] rounded-full blur-[100px] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center max-w-lg space-y-12"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <IconShoppingCart className="w-8 h-8 text-zinc-700" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-zinc-100 text-5xl font-bold tracking-tighter">Cart is empty.</h1>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                            Your acquisition manifest is currently clear. Select premium assets from our secure marketplace.
                        </p>
                    </div>
                    <Button 
                        onClick={() => navigate('/store')}
                        className="h-14 px-12 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95"
                    >
                        Browse Library
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-48 relative overflow-hidden selection:bg-zinc-100/10">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 bg-dot-matrix opacity-[0.03]" />
            <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-zinc-100/[0.015] rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-zinc-100/[0.01] rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12"
                >
                    <div className="space-y-8">
                        <button 
                            onClick={() => navigate('/store')}
                            className="flex items-center gap-3 text-zinc-600 hover:text-zinc-100 transition-all text-[9px] font-black uppercase tracking-[0.4em] group"
                        >
                            <IconChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
                            Back to Library
                        </button>
                        <h1 className="text-zinc-100 text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] animate-in fade-in slide-in-from-left duration-700">
                            Acquisition <br />
                            <span className="text-zinc-500">Manifest.</span>
                        </h1>
                    </div>
                    
                    <div className="hidden lg:flex flex-col items-end gap-3 text-right">
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md">
                            <IconShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Encrypted Terminal</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest max-w-[200px]">
                            Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
                        </p>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* --- MANIFEST LIST --- */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Inventory Split</span>
                                <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-black text-zinc-100">{cart.length}</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cart.map((item) => (
                                    <CheckoutItem key={item.id} item={item} onRemove={removeFromCart} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* --- FINALIZATION SUMMARY --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 lg:sticky lg:top-32"
                    >
                        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 p-10 lg:p-14 rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.6)] space-y-12 relative overflow-hidden group">
                            {/* Animated Border Accent */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            
                            <header className="space-y-2">
                                <h3 className="text-zinc-100 text-2xl font-black tracking-tight">Financial Summary</h3>
                                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Transaction Ledger Overview</p>
                            </header>
                            
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group/row">
                                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] group-hover/row:text-zinc-400 transition-colors">Gross Subtotal</span>
                                        <span className="text-zinc-400 font-bold text-lg tracking-tight group-hover/row:text-zinc-100 transition-colors">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center group/row">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] group-hover/row:text-zinc-400 transition-colors">Marketplace Tax</span>
                                            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest leading-none">18% Statutory GST</span>
                                        </div>
                                        <span className="text-zinc-400 font-bold text-lg tracking-tight group-hover/row:text-zinc-100 transition-colors">${tax.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <Separator className="bg-zinc-800/50" />
                                
                                <div className="flex justify-between items-end py-2">
                                    <div className="space-y-1">
                                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Final Valuation</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Quote Confirmed</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-zinc-100 text-5xl font-black tracking-tighter leading-none shadow-glow-sm">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <Button 
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full h-16 rounded-2xl transition-all duration-500 shadow-2xl flex items-center justify-center gap-4 group/btn",
                                        isProcessing 
                                            ? "bg-zinc-800 text-zinc-600" 
                                            : "bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                                    )}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Processing Securely...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Authorize Transaction</span>
                                            <IconArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                                
                                <div className="flex items-center justify-center gap-6 py-2 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                    <IconRazorpay className="h-4 w-auto text-zinc-100" />
                                    <div className="h-3 w-px bg-zinc-800" />
                                    <div className="flex items-center gap-2">
                                        <IconCreditCard className="w-4 h-4 text-zinc-100" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-100">PCI-DSS Level 1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 text-center border-t border-zinc-800/30">
                                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-800">Quantum Encrypted Checkout v4.2</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
