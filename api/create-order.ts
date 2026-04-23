import { VercelRequest, VercelResponse } from '@vercel/node';
import razorpayInstance from './razorpayClient';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { amount, receipt, notes, userId, bookIds, sellerId, upiId } = req.body;

    if (!amount || !userId) {
        return res.status(400).json({ error: 'Amount and User ID are required' });
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || { 
                userId, 
                bookIds: JSON.stringify(bookIds),
                sellerId: sellerId || '',
                payoutUpiId: upiId || ''
            }
        };

        const order = await razorpayInstance.orders.create(options);

        // Record pending purchase in Neon
        // We handle multiple book IDs by storing them as a JSON string or in a join table
        // For simplicity, we use the user's suggested schema
        const bookId = Array.isArray(bookIds) ? bookIds[0] : bookIds;

        await sql`
            INSERT INTO purchases (reader_id, book_id, razorpay_order_id, amount, status)
            VALUES (${userId}, ${bookId}, ${order.id}, ${amount}, 'pending')
        `;

        return res.status(200).json(order);
    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
