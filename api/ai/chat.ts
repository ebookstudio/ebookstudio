import { VercelRequest, VercelResponse } from '@vercel/node';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const groq = createGroq({
  apiKey: (process.env.GROQ_API_KEY || "").trim(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("AI Chat Request received");
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, systemPrompt, userId } = req.body;
    console.log("Messages received:", JSON.stringify(messages, null, 2));

    // Ensure messages are in the correct format for the AI SDK
    const formattedMessages = messages.map((m: any) => ({
        role: m.role,
        content: m.content || m.text || ""
    }));

    if (userId && sql) {
        try {
            // First time setup fallback just in case
            await sql`
                CREATE TABLE IF NOT EXISTS free_ai_usage (
                    user_id TEXT PRIMARY KEY,
                    prompt_count INT DEFAULT 0,
                    updated_at TIMESTAMPTZ DEFAULT now()
                );
            `;

            const { rows } = await sql`
                SELECT prompt_count FROM free_ai_usage WHERE user_id = ${userId}
            `;
            let count = rows[0]?.prompt_count || 0;

            if (count >= 5) {
                const sub = await sql`
                    SELECT status FROM subscriptions 
                    WHERE user_id = ${userId} AND status = 'active'
                `;
                // Add your current_period_end logic if needed, currently simplifying to just status
                
                if (!sub.length) {
                    return res.status(403).json({ 
                        error: 'Free limit reached. Please subscribe to Studio Pro to continue using AI.',
                        requiresUpgrade: true 
                    });
                }
            }

            // Increment usage before calling AI
            await sql`
                INSERT INTO free_ai_usage (user_id, prompt_count) 
                VALUES (${userId}, 1)
                ON CONFLICT (user_id) 
                DO UPDATE SET prompt_count = free_ai_usage.prompt_count + 1
            `;
        } catch (dbError) {
            console.error("Database check failed:", dbError);
            // Optionally decide if you want to block or allow if DB fails
        }
    }

    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is missing");
        return res.status(500).json({ error: "Configuration Error: GROQ_API_KEY is missing" });
    }

    try {
        const result = await streamText({
            model: groq('llama-3.1-8b-instant'), 
            system: `You are the EbookStudio Co-Author, a world-class literary agent and expert ghostwriter. 
Your goal is to help the user create high-fidelity, professional-grade ebooks.

AGENTIC BEHAVIOR:
1. PROACTIVE INITIATIVE: If the user asks for a book about a topic, don't just say "okay". Propose a 5-chapter outline, suggest a target audience, and describe the tone.
2. EXPERT GUIDANCE: Offer advice on pacing, character development, and narrative hooks without being asked.
3. FORMATTING: Always use high-quality Markdown. Use headers, bold text for emphasis, and lists for clarity.
4. LITERARY VOICE: Adapt your tone to the genre. For quantum physics, be intellectual yet accessible. For poetry, be evocative and lyrical.
5. MEMORY: You remember the full conversation. Use previous context to maintain consistency.

Output should be direct, professional, and inspiring. Start by acknowledging the user's vision and then immediately provide high-value content or suggestions.`,
            messages: formattedMessages,
        });

        console.log("Streaming response started");
        return result.pipeTextStreamToResponse(res);
    } catch (error: any) {
        console.error("AI API Error Details:", error);
        return res.status(500).json({ error: "AI processing failed", details: error.message });
    }
}
