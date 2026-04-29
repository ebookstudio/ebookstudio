import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function setup() {
  console.log('Creating cli_connections table...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cli_connections (
        device_code TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'pending',
        email TEXT,
        uid TEXT,
        id_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `;
    console.log('✅ Table created successfully.');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  }
}

setup();
