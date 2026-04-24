import { VercelRequest, VercelResponse } from '@vercel/node';
import razorpayInstance from './razorpayClient';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { plan_id, userId, customer_email, notes } = req.body;

    if (!plan_id || !userId) {
        return res.status(400).json({ error: 'Plan ID and User ID are required' });
    }

    try {
        const options = {
            plan_id: plan_id,
            customer_notify: 1,
            total_count: 12, 
            quantity: 1,
            notes: notes || { userId, email: customer_email }
        };

        const subscription = await razorpayInstance.subscriptions.create(options);

        // Record pending subscription in Neon
        await sql`
            INSERT INTO subscriptions (user_id, plan_id, razorpay_subscription_id, status)
            VALUES (${userId}, ${plan_id}, ${subscription.id}, 'pending')
            ON CONFLICT (user_id) DO UPDATE 
            SET razorpay_subscription_id = ${subscription.id}, status = 'pending'
        `;

        return res.status(200).json(subscription);
    } catch (error: any) {
        console.error('Razorpay Subscription Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
