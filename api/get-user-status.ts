import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Fetch Subscription Status
        const subscriptions = await sql`
            SELECT * FROM subscriptions WHERE user_id = ${userId} LIMIT 1
        `;
        
        // Fetch Payout History
        const payouts = await sql`
            SELECT * FROM payouts WHERE seller_id = ${userId} ORDER BY created_at DESC
        `;

        // Fetch Purchases (for Readers)
        const purchases = await sql`
            SELECT book_id FROM purchases WHERE reader_id = ${userId} AND status = 'completed'
        `;

        return res.status(200).json({
            subscription: subscriptions[0] || null,
            payoutHistory: payouts || [],
            purchasedBookIds: purchases.map(p => p.book_id)
        });
    } catch (error: any) {
        console.error('Fetch User Status Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
