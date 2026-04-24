import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const PAYOUT_AUTH_TOKEN = process.env.PAYOUT_AUTH_TOKEN;

// Helper for direct Razorpay API calls
async function razorpayFetch(endpoint: string, options: any = {}) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
        throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment.');
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const url = `https://api.razorpay.com/v1${endpoint}`;
    console.log(`[Razorpay] Fetching: ${url}`);

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
            ...options.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        console.error(`[Razorpay] Error from ${endpoint}:`, data);
        throw new Error(data.error?.description || `Razorpay API Error (${response.status})`);
    }
    return data;
}

async function getOrCreateFundAccount(sellerId: string, upiId: string) {
    if (!sql) {
        console.warn(`[Payout] No database connection. Skipping DB check for ${sellerId}.`);
        return null; 
    }

    try {
        const [method] = await sql`
            SELECT razorpay_fund_account_id FROM seller_payment_methods 
            WHERE seller_id = ${sellerId} AND upi_id = ${upiId}
        ` as any[];

        if (method?.razorpay_fund_account_id) return method.razorpay_fund_account_id;
    } catch (e) {
        console.error(`[Payout] Database query failed:`, e);
        // Continue without DB cache
    }

    console.log(`[Payout] Step 1.1: Creating Contact for ${sellerId}`);
    const contact = await razorpayFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify({
            name: `Seller ${sellerId}`,
            email: `seller_${sellerId}@ebookstudio.app`,
            type: 'vendor',
            reference_id: sellerId
        })
    });

    console.log(`[Payout] Step 1.2: Creating Fund Account for Contact ${contact.id}`);
    const fundAccount = await razorpayFetch('/fund_accounts', {
        method: 'POST',
        body: JSON.stringify({
            contact_id: contact.id,
            account_type: 'vpa',
            vpa: { address: upiId }
        })
    });

    if (sql) {
        try {
            await sql`
                INSERT INTO seller_payment_methods (seller_id, razorpay_contact_id, razorpay_fund_account_id, upi_id)
                VALUES (${sellerId}, ${contact.id}, ${fundAccount.id}, ${upiId})
                ON CONFLICT (seller_id) DO UPDATE SET
                    razorpay_contact_id = EXCLUDED.razorpay_contact_id,
                    razorpay_fund_account_id = EXCLUDED.razorpay_fund_account_id,
                    upi_id = EXCLUDED.upi_id,
                    updated_at = CURRENT_TIMESTAMP
            `;
        } catch (e) {
            console.error(`[Payout] Failed to save payment method:`, e);
        }
    }

    return fundAccount.id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

        const authHeader = req.headers.authorization;
        
        if (!PAYOUT_AUTH_TOKEN) {
            console.error('[Payout] CRITICAL: PAYOUT_AUTH_TOKEN is not defined in the environment.');
        }

        if (authHeader !== `Bearer ${PAYOUT_AUTH_TOKEN}`) {
            console.error('[Payout] Unauthorized: Token mismatch or missing');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { amount, upiId, sellerId, purchaseId } = req.body;
        if (!amount || !upiId || !sellerId) return res.status(400).json({ error: 'Missing fields' });

        console.log(`[Payout] Starting payout process for ${sellerId}`);

        const fundAccountId = await getOrCreateFundAccount(sellerId, upiId);

        console.log(`[Payout] Step 2: Initiating Payout with Fund Account ${fundAccountId}`);
        const payout = await razorpayFetch('/payouts', {
            method: 'POST',
            body: JSON.stringify({
                account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
                fund_account_id: fundAccountId,
                amount: amount,
                currency: 'INR',
                mode: 'UPI',
                purpose: 'payout',
                queue_if_low_balance: true,
                reference_id: purchaseId || `payout_${Date.now()}`
            })
        });

        if (sql) {
            try {
                await sql`
                    UPDATE payouts 
                    SET razorpay_payout_id = ${payout.id}, status = ${payout.status}, updated_at = CURRENT_TIMESTAMP
                    WHERE purchase_id = ${purchaseId} OR sale_id = ${purchaseId}
                `;
            } catch (e) {
                console.error(`[Payout] Failed to update payout status in DB:`, e);
            }
        }

        return res.json({ success: true, payout_id: payout.id, status: payout.status });

    } catch (error: any) {
        console.error('[Payout] Failure:', error.message);
        return res.status(500).json({ error: 'Payout failed', details: error.message });
    }
}
