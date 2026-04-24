import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const book = req.body;

    if (!book.id || !book.sellerId) {
        return res.status(400).json({ error: 'Book ID and Seller ID are required' });
    }

    try {
        // Upsert logic
        await sql`
            INSERT INTO books (
                id, title, author, description, price, 
                cover_image_url, genre, seller_id, is_draft, 
                content, pdf_url, updated_at
            )
            VALUES (
                ${book.id}, ${book.title}, ${book.author}, ${book.description}, ${book.price}, 
                ${book.coverImageUrl}, ${book.genre}, ${book.sellerId}, ${book.isDraft ?? true}, 
                ${JSON.stringify(book.pages || [])}, ${book.pdfUrl || null}, CURRENT_TIMESTAMP
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                author = EXCLUDED.author,
                description = EXCLUDED.description,
                price = EXCLUDED.price,
                cover_image_url = EXCLUDED.cover_image_url,
                genre = EXCLUDED.genre,
                is_draft = EXCLUDED.is_draft,
                content = EXCLUDED.content,
                pdf_url = EXCLUDED.pdf_url,
                updated_at = CURRENT_TIMESTAMP
        `;

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Save Book Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
