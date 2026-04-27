import { VercelRequest, VercelResponse } from '@vercel/node';
import { streamText, tool } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("AI Chat Request started - ROBUST AI SDK VERSION");
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, systemPrompt, userId } = req.body;
    console.log(`Processing request for user: ${userId || 'anonymous'}`);

    const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
    const groqKey = (process.env.GROQ_API_KEY || "").trim();
    const googleKey = (process.env.VITE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();

    if (!groqKey && !googleKey) {
        console.error("AI SDK: No API Keys found");
        return res.status(500).json({ error: "Configuration Error: No API Keys found" });
    }

    // Ensure messages are in the correct format for the AI SDK
    let formattedMessages = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'ai' ? 'assistant' : 'user',
        content: m.content || m.text || ""
    }));

    // CRITICAL: Many providers (like Gemini) require the FIRST message to be from the 'user'.
    // If the history starts with an assistant message, we filter it out to avoid errors.
    if (formattedMessages.length > 0 && formattedMessages[0].role === 'assistant') {
        console.log("AI SDK: Trimming leading assistant message to satisfy provider requirements");
        formattedMessages = formattedMessages.slice(1);
    }

    if (formattedMessages.length === 0) {
        console.warn("AI SDK: No messages to process");
        return res.status(400).json({ error: "No messages provided" });
    }

    if (userId && sql) {
        try {
            await sql`
                INSERT INTO free_ai_usage (user_id, prompt_count) 
                VALUES (${userId}, 1)
                ON CONFLICT (user_id) 
                DO UPDATE SET prompt_count = free_ai_usage.prompt_count + 1
            `;
        } catch (dbError) {
            console.error("Database check failed:", dbError);
        }
    }

    const lastMessage = formattedMessages[formattedMessages.length - 1]?.content || "";
    const isFullBookRequest = lastMessage.includes("full ebook") || lastMessage.includes("Generate the full ebook") || (lastMessage.includes("8 chapters") && lastMessage.includes("12,000 words"));

    try {
        let model;
        if (groqKey) {
            console.log("AI SDK: Using Groq (Llama 3.3 70b)");
            const groq = createGroq({ apiKey: groqKey });
            model = groq('llama-3.3-70b-versatile');
        } else {
            console.log("AI SDK: Falling back to Gemini");
            const google = createGoogleGenerativeAI({ apiKey: googleKey });
            model = google('gemini-1.5-flash');
        }

        // --- INTERCEPTION LOGIC FOR SEQUENTIAL WORKFLOW ---
        if (isFullBookRequest) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.write(`0:${JSON.stringify("I'd love to help you write this masterpiece! However, to ensure the highest quality and stay within technical limits, I'll need to guide you through this chapter by chapter.\n\n")}\n`);
            res.write(`0:${JSON.stringify("Let's start by establishing the **Blueprint (Outline)** for your book. Once you approve the outline, we can generate each chapter one by one to ensure every page is detailed and professional.\n\n")}\n`);
            res.write(`0:${JSON.stringify("I am now proposing a 8-chapter blueprint based on your detailed request. Please review it in the Outline tab!")}\n`);
        }

        const result = await streamText({
            model, 
            system: `You are the EbookStudio Co-Author, a world-class literary agent and expert ghostwriter.
Your goal is to help the user create high-fidelity, professional-grade ebooks chapter by chapter.

CRITICAL RULES:
1. THE EDITOR IS LIVE: You have direct access to the user's manuscript editor via tools.
2. NEVER write the entire book at once. It will exceed the limit and fail.
3. CHAPTER BY CHAPTER: If a user asks for a full book, FIRST call 'propose_blueprint' to set the structure. Then, ask which chapter to write.
4. USE THE TOOLS: When writing a chapter, ALWAYS call 'write_content' with the chapter title and full markdown content (800-1500 words).
5. PROACTIVE: After writing a chapter, ask if they want to proceed to the next one.

TOOLS: write_content, generate_image, propose_blueprint.`,
            messages: formattedMessages,
            maxTokens: isFullBookRequest ? 1024 : 8192, // High limit for content, low for interception/planning
            temperature: 0.7,
            tools: {
                write_content: tool({
                    description: 'Update the content of the current chapter draft. Use this for ANY writing task.',
                    parameters: z.object({
                        title: z.string().optional().describe('The title of the chapter.'),
                        content: z.string().describe('The full markdown content to write to the editor (800-2000 words).'),
                    }),
                }),
                generate_image: tool({
                    description: 'Generate an AI Image for the book and integrate it into the draft.',
                    parameters: z.object({
                        prompt: z.string().describe('A detailed visual prompt for the image generation.'),
                    }),
                }),
                propose_blueprint: tool({
                    description: 'Propose a structured book title and chapter outline (blueprint).',
                    parameters: z.object({
                        book_title: z.string().describe('The proposed title of the book.'),
                        chapter_outline: z.array(z.object({
                            title: z.string(),
                            summary: z.string()
                        })).describe('An array of chapter objects for the outline.'),
                    }),
                }),
            },
        });

        if (!isFullBookRequest) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
        }

        const fullStream = result.fullStream;
        for await (const chunk of (fullStream as any)) {
            try {
                if (chunk.type === 'text-delta') {
                    // Supporting both 'text' and 'textDelta' for compatibility across SDK versions
                    const text = chunk.textDelta || chunk.text || "";
                    if (text) res.write(`0:${JSON.stringify(text)}\n`);
                } else if (chunk.type === 'tool-call') {
                    res.write(`9:${JSON.stringify({ toolCallId: chunk.toolCallId, toolName: chunk.toolName, args: chunk.args || chunk.input })}\n`);
                } else if (chunk.type === 'error') {
                    console.error("AI SDK Stream Error Chunk:", chunk.error);
                    res.write(`e:${JSON.stringify({ message: chunk.error?.message || String(chunk.error) })}\n`);
                }
            } catch (chunkError) {
                console.error("Error processing stream chunk:", chunkError);
            }
        }

        return res.end();
    } catch (error: any) {
        console.error("AI SDK Error:", error);
        // If we already started writing to the response, we can't send a 500 status
        if (!res.headersSent) {
            return res.status(500).json({ error: "AI processing failed", details: error.message });
        } else {
            res.write(`e:${JSON.stringify({ message: error.message })}\n`);
            return res.end();
        }
    }
}
