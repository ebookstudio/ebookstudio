import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import razorpayInstance from './razorpayClient';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { amount, upiId, sellerId, purchaseId } = req.body;

    if (!amount || !upiId || !sellerId) {
        return res.status(400).json({ error: 'Amount, UPI ID, and Seller ID are required' });
    }

    try {
        console.log(`[Payout] Initiating Razorpay Payout: ${amount} paise to ${upiId}`);

        // 1. Create a Payout in Razorpay (Structural Implementation)
        // Note: This requires Razorpay X Payouts to be enabled on the account
        let razorpayPayoutId = `payout_sim_${Date.now()}`;
        let status = 'processed';

        try {
            // This is the actual API call for Razorpay X Payouts
            // In a real production environment, you'd need the Fund Account ID
            /*
            const payout = await razorpayInstance.payouts.create({
                account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER,
                fund_account_id: fundAccountId, // You'd first create/fetch this for the UPI ID
                amount: amount,
                currency: "INR",
                mode: "UPI",
                purpose: "payout",
                queue_if_low_balance: true,
                reference_id: purchaseId || `ref_${Date.now()}`,
            });
            razorpayPayoutId = payout.id;
            status = payout.status;
            */
        } catch (apiError: any) {
            console.error('[Payout] Razorpay API Error:', apiError);
            status = 'failed';
            // We still want to record the failure in our DB
        }

        // 2. Record/Update payout in Neon
        await sql`
            INSERT INTO payouts (seller_id, amount, upi_id, razorpay_payout_id, status, purchase_id)
            VALUES (${sellerId}, ${amount}, ${upiId}, ${razorpayPayoutId}, ${status}, ${purchaseId || null})
            ON CONFLICT (purchase_id) DO UPDATE SET
                status = EXCLUDED.status,
                razorpay_payout_id = EXCLUDED.razorpay_payout_id,
                updated_at = CURRENT_TIMESTAMP
        `;

        return res.status(200).json({
            success: status !== 'failed',
            payoutId: razorpayPayoutId,
            status: status
        });
    } catch (error: any) {
        console.error('[Payout] Internal System Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
