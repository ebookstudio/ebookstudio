import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { IconTrash, IconStore, IconCreditCard } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import MorphicEye from '../components/MorphicEye';

const { useNavigate } = ReactRouterDOM as any;

const CheckoutPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    setTimeout(() => {
        clearCart();
        navigate('/dashboard'); 
        setIsProcessing(false);
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#000000]">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.2]" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="mb-16">
                 <MorphicEye variant="hero" className="w-40 h-40 opacity-20" />
            </div>
            <h1 className="type-display text-white text-5xl font-black tracking-tight mb-6">Archive Empty</h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-12">No neural fragments detected in acquisition queue</p>
            <button
                onClick={() => navigate('/store')}
                className="btn-primary rounded-full px-12 py-5 text-xs font-black"
            >
                Initialize Repository Browse
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pt-48 pb-32">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
          <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-dot-matrix opacity-[0.1]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Acquisition Protocol Alpha</span>
              </div>
              <h1 className="type-display text-white text-6xl md:text-7xl font-black tracking-tighter">Your Queue</h1>
          </div>
          <div className="text-right">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">
                  Session Identity: {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Fragment Queue */}
          <div className="lg:col-span-7 space-y-10">
            {cart.map((item) => (
              <div 
                  key={item.id} 
                  className="group flex flex-col sm:flex-row items-center gap-12 p-8 glass-card-premium rounded-[40px] border-white/5 hover:border-white/10 transition-all duration-700"
              >
                <div className="shrink-0 relative">
                    <img 
                      src={item.coverImageUrl} 
                      alt={item.title} 
                      className="w-32 h-48 object-cover rounded-2xl shadow-2xl grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" 
                    />
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
                        <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                            {item.genre}
                        </span>
                    </div>
                    <h3 className="text-white text-2xl font-black mb-3 tracking-tight leading-none">{item.title}</h3>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-10">Creator: {item.author}</p>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-[9px] font-black text-zinc-700 hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 transition-colors"
                    >
                      <IconTrash className="w-3.5 h-3.5" /> Purge from Protocol
                    </button>
                </div>

                <div className="text-right sm:pl-10 sm:border-l border-white/5">
                    <p className="text-white text-3xl font-black tracking-tighter">${item.price.toFixed(2)}</p>
                    <p className="text-[8px] text-zinc-700 uppercase mt-2 font-black tracking-widest">Base Accrual</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ledger Interface */}
          <div className="lg:col-span-5">
              <div className="glass-card-premium p-12 rounded-[60px] sticky top-40 border-white/10 shadow-2xl group overflow-hidden">
                  
                  <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/[0.02] rounded-full blur-[100px] transition-all duration-1000 group-hover:bg-white/[0.05]" />

                  <h2 className="text-white text-sm uppercase tracking-[0.4em] font-black mb-16 opacity-30">
                      Ledger Finalization
                  </h2>

                  <div className="space-y-8 mb-16">
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Subtotal</span>
                          <span className="text-white font-black tracking-tighter">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Neural Fee (8%)</span>
                          <span className="text-white font-black tracking-tighter">${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="h-[1px] bg-white/5" />
                      <div className="flex justify-between items-end pt-4">
                          <span className="text-zinc-400 text-sm font-black uppercase tracking-[0.2em]">Total</span>
                          <span className="text-white text-6xl font-black tracking-tighter leading-none">${totalAmount.toFixed(2)}</span>
                      </div>
                  </div>

                  {isLoggedIn ? (
                      <button
                          onClick={handlePayment}
                          disabled={isProcessing}
                          className="btn-primary w-full py-6 rounded-full flex items-center justify-center gap-4 text-xs font-black shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                      >
                          {isProcessing ? (
                              <span className="animate-pulse tracking-[0.2em]">Authorizing...</span>
                          ) : (
                              <>
                                  <IconCreditCard className="w-5 h-5" /> 
                                  Execute Acquisition
                              </>
                          )}
                      </button>
                  ) : (
                      <button
                          onClick={() => navigate('/login')}
                          className="btn-secondary w-full py-6 rounded-full text-xs font-black tracking-widest"
                      >
                          Identify to Initialize
                      </button>
                  )}

                  <div className="mt-12 flex items-center justify-center gap-4 opacity-20">
                      <div className="h-[1px] flex-grow bg-white/10" />
                      <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.5em]">Secured Protocol</span>
                      <div className="h-[1px] flex-grow bg-white/10" />
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
