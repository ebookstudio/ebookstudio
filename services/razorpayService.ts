import { RAZORPAY_KEY_ID } from '../constants';
import { Purchase, Payout, SubscriptionStatus, Seller, User, EBook } from '../types';

// Simulation Mode Utility
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const razorpayService = {
  // --- Payment Collection (Orders) ---
  
  createOrder: async (amount: number, userId: string, bookIds: string[], sellerId?: string, upiId?: string) => {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount, 
        userId,
        bookIds,
        sellerId,
        upiId,
        notes: { 
          userId, 
          bookIds: JSON.stringify(bookIds),
          sellerId: sellerId || '',
          payoutUpiId: upiId || ''
        } 
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return await response.json();
  },

  verifyPayment: async (paymentResponse: any, orderId: string): Promise<boolean> => {
    // Webhook will handle the actual verification and database update.
    // Client-side verification is just for immediate UI feedback.
    console.log(`[Client] Payment captured for Order ${orderId}`);
    return true; 
  },

  initiatePayout: async (seller: Seller, amount: number): Promise<Payout> => {
    if (!seller.payoutUpiId) {
      throw new Error("Writer UPI ID not found. Payout failed.");
    }

    const response = await fetch('/api/create-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, upiId: seller.payoutUpiId, sellerId: seller.id })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payout initiation failed');
    }

    return await response.json();
  },

  createSubscription: async (planId: string, userId: string, customerEmail: string): Promise<SubscriptionStatus> => {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId, userId, customer_email: customerEmail, notes: { userId } })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subscription');
    }

    const subscription = await response.json();

    return {
      isActive: true,
      planId: planId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      razorpaySubscriptionId: subscription.id
    };
  },

  checkSubscriptionStatus: (subscription?: SubscriptionStatus): boolean => {
    if (!subscription || !subscription.isActive) return false;
    const now = new Date();
    const expiry = new Date(subscription.endDate);
    return now <= expiry;
  },

  // --- Commission Calculation (70/30 Split) ---

  calculateSplit: (amount: number) => {
    const gatewayFee = amount * 0.02 * 1.18; // 2% + 18% GST on fee
    const netAmount = amount - gatewayFee;
    
    const platformCommission = netAmount * 0.30;
    const writerEarnings = netAmount * 0.70;

    return {
      total: amount,
      gatewayFee,
      netAmount,
      platformCommission,
      writerEarnings
    };
  }
};
