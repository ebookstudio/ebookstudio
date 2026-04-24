import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { bookId, price } = req.body;

    if (!bookId) {
        return res.status(400).json({ error: 'Book ID is required' });
    }

    try {
        if (!sql) {
            throw new Error("Database not connected");
        }

        await sql`
            UPDATE books 
            SET is_draft = false, price = ${price}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${bookId}
        `;

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Publish Book Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
