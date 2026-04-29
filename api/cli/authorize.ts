import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const { deviceCode, idToken, refreshToken, email, uid } = req.body;

  if (!deviceCode || !idToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the code exists and is pending
    const check = await sql`
      SELECT status FROM cli_connections WHERE device_code = ${deviceCode} AND expires_at > CURRENT_TIMESTAMP
    `;

    if (check.length === 0) {
      return res.status(404).json({ error: 'Code expired or not found' });
    }

    if (check[0].status !== 'pending') {
      return res.status(400).json({ error: 'Code already used or invalid' });
    }

    // Update with authorization data
    await sql`
      UPDATE cli_connections 
      SET status = 'authorized', 
          id_token = ${idToken}, 
          refresh_token = ${refreshToken}, 
          email = ${email}, 
          uid = ${uid}
      WHERE device_code = ${deviceCode}
    `;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
