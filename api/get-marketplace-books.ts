import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const books = await sql`
            SELECT * FROM books WHERE is_draft = false ORDER BY created_at DESC
        `;

        const mappedBooks = books.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            description: b.description,
            price: Number(b.price),
            coverImageUrl: b.cover_image_url,
            genre: b.genre,
            sellerId: b.seller_id,
            isDraft: b.is_draft,
            pages: typeof b.content === 'string' ? JSON.parse(b.content) : b.content,
            pdfUrl: b.pdf_url,
            publicationDate: b.created_at
        }));

        return res.status(200).json(mappedBooks);
    } catch (error: any) {
        console.error('Get Marketplace Books Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
