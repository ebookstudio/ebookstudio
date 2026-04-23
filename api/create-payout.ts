import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { amount, upiId, sellerId } = req.body;

    if (!amount || !upiId || !sellerId) {
        return res.status(400).json({ error: 'Amount, UPI ID, and Seller ID are required' });
    }

    try {
        console.log(`[API] Initiating Payout of ${amount} to ${upiId} for seller ${sellerId}`);
        
        // Mock Payout ID for now
        const payoutId = `payout_${Date.now()}`;

        // Record payout in Neon
        await sql`
            INSERT INTO payouts (seller_id, amount, upi_id, razorpay_payout_id, status)
            VALUES (${sellerId}, ${amount}, ${upiId}, ${payoutId}, 'processed')
        `;

        return res.status(200).json({
            id: payoutId,
            status: 'processed',
            amount: amount,
            upiId: upiId,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Razorpay Payout Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
