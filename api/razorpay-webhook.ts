import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!secret || !signature) {
        return res.status(400).send('Missing Secret or Signature');
    }

    // Verify Webhook Signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.error('Invalid Webhook Signature');
        return res.status(400).send('Invalid Signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    try {
        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;
            
            console.log(`[Webhook] Payment captured: ${paymentId} for Order: ${orderId}`);

            // Update purchase record in Neon
            await sql`
                UPDATE purchases
                SET status = 'completed', razorpay_payment_id = ${paymentId}
                WHERE razorpay_order_id = ${orderId}
            `;

            // --- 70/30 SPLIT & PAYOUT RECORDING ---
            // We expect seller_id to be passed in the notes during order creation
            const sellerId = payment.notes?.sellerId;
            const amountPaise = payment.amount; // amount in paise
            const amountRupees = amountPaise / 100;

            if (sellerId) {
                // Calculation: 
                // 1. Deduct 2% + 18% GST on fee (~2.36%)
                const gatewayFee = amountRupees * 0.02 * 1.18;
                const netAmount = amountRupees - gatewayFee;
                
                // 2. 70% for the writer
                const writerEarnings = Math.floor(netAmount * 0.70 * 100); // Store in paise for precision

                console.log(`[Webhook] Recording Payout for Seller: ${sellerId}, Amount: ${writerEarnings} paise`);

                // Retrieve Writer's UPI ID from Neon (assuming a 'users' or 'sellers' table)
                // For now, we'll use a placeholder or check if it's in notes
                const upiId = payment.notes?.payoutUpiId || 'UPI_PENDING';

                await sql`
                    INSERT INTO payouts (seller_id, amount, upi_id, status)
                    VALUES (${sellerId}, ${writerEarnings}, ${upiId}, 'pending')
                `;
            } else {
                console.warn(`[Webhook] No sellerId found in notes for Order: ${orderId}. Payout skip.`);
            }
        } 
        else if (event === 'subscription.charged') {
            const subscription = payload.subscription.entity;
            const razorpaySubId = subscription.id;
            const currentEnd = new Date(subscription.current_end * 1000);

            console.log(`[Webhook] Subscription charged: ${razorpaySubId}`);

            // Update subscription end date in Neon
            await sql`
                UPDATE subscriptions
                SET current_period_end = ${currentEnd.toISOString()}, status = 'active'
                WHERE razorpay_subscription_id = ${razorpaySubId}
            `;
        }
        else if (event === 'subscription.activated') {
            const subscription = payload.subscription.entity;
            const razorpaySubId = subscription.id;
            const currentEnd = new Date(subscription.current_end * 1000);

            console.log(`[Webhook] Subscription activated: ${razorpaySubId}`);

            await sql`
                UPDATE subscriptions
                SET status = 'active', current_period_end = ${currentEnd.toISOString()}
                WHERE razorpay_subscription_id = ${razorpaySubId}
            `;
        }

        return res.status(200).send('Webhook processed');
    } catch (error: any) {
        console.error('Webhook Processing Error:', error);
        return res.status(500).send('Internal Error');
    }
}
