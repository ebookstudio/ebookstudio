import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') return res.status(405).end();
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  try {
    // Generate a clean 6-digit code (simple alphanumeric)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let deviceCode = '';
    for (let i = 0; i < 6; i++) {
      deviceCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await sql`
      INSERT INTO cli_connections (device_code, status, expires_at)
      VALUES (${deviceCode}, 'pending', ${expiresAt})
    `;

    return res.status(200).json({ deviceCode });
  } catch (error: any) {
    console.error('Init Connect Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
