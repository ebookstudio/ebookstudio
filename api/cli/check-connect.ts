import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const { deviceCode } = req.query;
  if (!deviceCode) return res.status(400).json({ error: 'Missing deviceCode' });

  try {
    const results = await sql`
      SELECT status, email, uid, id_token, refresh_token 
      FROM cli_connections 
      WHERE device_code = ${deviceCode as string}
      AND expires_at > CURRENT_TIMESTAMP
    `;

    if (results.length === 0) {
      return res.status(404).json({ error: 'Code expired or not found' });
    }

    const connection = results[0];

    if (connection.status === 'authorized') {
      // Return the tokens and then delete the entry (one-time use)
      await sql`DELETE FROM cli_connections WHERE device_code = ${deviceCode as string}`;
      return res.status(200).json(connection);
    }

    return res.status(200).json({ status: connection.status });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
