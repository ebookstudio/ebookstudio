import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function setup() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("No DATABASE_URL");
        process.exit(1);
    }
    const sql = neon(dbUrl);
    
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS free_ai_usage (
                user_id TEXT PRIMARY KEY,
                prompt_count INT DEFAULT 0,
                updated_at TIMESTAMPTZ DEFAULT now()
            );
        `;
        console.log("Table free_ai_usage created successfully.");
    } catch (error) {
        console.error("Error creating table:", error);
    }
}

setup();
