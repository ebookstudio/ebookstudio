
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { IconShoppingCart, IconTrash, IconRazorpay, BORDER_CLASS, RAZORPAY_KEY_ID, IconRocket, IconStore, IconCreditCard } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Seller } from '../types'; 
import MorphicEye from '../components/MorphicEye';

const { useNavigate } = ReactRouterDOM as any;

const CheckoutPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Enforce Login
  const isLoggedIn = currentUser && currentUser.id !== 'guest';

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.08; 
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  
  const handlePayment = async () => {
    if (!isLoggedIn) {
        navigate('/login'); 
        return;
    }
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
        alert(`Transaction Successful! Manuscript access granted.`);
        clearCart();
        navigate('/dashboard'); 
        setIsProcessing(false);
    }, 2000);
  };

  // --- EMPTY STATE: VOID DETECTED ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black bg-dot-matrix">
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
            <div className="mb-12">
                 <MorphicEye className="w-40 h-40 bg-zinc-950 border border-zinc-900 rounded-full shadow-2xl" isActive={false} />
            </div>
            
            <h1 className="type-display text-white mb-4">Cart Void</h1>
            <p className="type-tiny text-zinc-500 font-mono uppercase tracking-[0.4em] mb-12">No active manuscripts detected in queue</p>
            
            <button
                onClick={() => navigate('/store')}
                className="btn-primary px-12 py-4"
            >
                <IconStore className="w-4 h-4" /> Browse Library
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-dot-matrix pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
          <div>
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="type-tiny font-black text-zinc-500 uppercase tracking-widest">Secure Acquisition Protocol</span>
              </div>
              <h1 className="type-display text-white">Your Cart</h1>
          </div>
          <div className="text-right hidden md:block">
              <p className="type-tiny text-zinc-500 font-mono uppercase tracking-widest">
                  Batch ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* --- LEFT: CART ITEMS --- */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div 
                  key={item.id} 
                  className="group flex flex-col sm:flex-row items-center gap-8 p-8 glass-card-premium rounded-[32px] hover:bg-white/[0.04] transition-all duration-500 animate-fade-in"
              >
                {/* Cover */}
                <div className="shrink-0 relative group/cover">
                    <img 
                      src={item.coverImageUrl} 
                      alt={item.title} 
                      className="w-28 h-40 object-cover rounded-xl shadow-2xl border border-zinc-800 group-hover/cover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                        <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 type-tiny font-bold text-zinc-400 uppercase tracking-widest">
                            {item.genre}
                        </span>
                    </div>
                    <h3 className="type-h3 text-white mb-2">{item.title}</h3>
                    <p className="type-tiny text-zinc-500 font-mono uppercase tracking-widest mb-6">Author: {item.author}</p>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="type-tiny font-black text-rose-500 hover:text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
                    >
                      <IconTrash className="w-3.5 h-3.5" /> Remove from Cart
                    </button>
                </div>

                {/* Price */}
                <div className="text-right sm:pl-8 sm:border-l sm:border-zinc-900">
                    <p className="type-h2 text-white font-light">${item.price.toFixed(2)}</p>
                    <p className="type-tiny text-zinc-600 uppercase mt-2 font-bold tracking-widest">Unit Price</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- RIGHT: PAYMENT HUD --- */}
          <div className="lg:col-span-1">
              <div className="glass-card-premium p-10 rounded-[40px] sticky top-32 shadow-2xl overflow-hidden group">
                  
                  {/* Subtle Background Interaction */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-[100px] group-hover:bg-white/[0.08] transition-colors duration-1000"></div>

                  <h2 className="type-h3 text-white mb-10 border-b border-zinc-900 pb-6 uppercase tracking-widest">
                      Ledger Summary
                  </h2>

                  <div className="space-y-6 mb-10">
                      <div className="flex justify-between items-center">
                          <span className="type-tiny text-zinc-500 font-bold uppercase tracking-widest">Subtotal</span>
                          <span className="type-body text-white font-mono">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="type-tiny text-zinc-500 font-bold uppercase tracking-widest">Protocol Fee (8%)</span>
                          <span className="type-body text-white font-mono">${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-zinc-900 my-4"></div>
                      <div className="flex justify-between items-end">
                          <span className="type-h3 text-white">Grand Total</span>
                          <span className="type-display text-white text-4xl">${totalAmount.toFixed(2)}</span>
                      </div>
                  </div>

                  {isLoggedIn ? (
                      <button
                          onClick={handlePayment}
                          disabled={isProcessing}
                          className="btn-primary w-full py-5 flex items-center justify-center gap-3 group/btn"
                      >
                          {isProcessing ? (
                              <span className="animate-pulse">Synchronizing...</span>
                          ) : (
                              <>
                                  <IconCreditCard className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> 
                                  Complete Acquisition
                              </>
                          )}
                      </button>
                  ) : (
                      <button
                          onClick={() => navigate('/login')}
                          className="btn-secondary w-full py-5"
                      >
                          Identify to Proceed
                      </button>
                  )}

                  <div className="mt-8 flex items-center justify-center gap-3">
                      <IconRocket className="w-4 h-4 text-emerald-500" />
                      <span className="type-tiny text-zinc-600 font-black uppercase tracking-[0.2em]">Instant Neural Injection</span>
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
