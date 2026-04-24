import { VercelRequest, VercelResponse } from '@vercel/node';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("AI Chat Request received");
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, systemPrompt } = req.body;
    console.log("Messages count:", messages?.length);

    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is missing");
        return res.status(500).json({ error: "Configuration Error: GROQ_API_KEY is missing" });
    }

    try {
        const result = await streamText({
            model: groq('llama-3.1-8b-instant'), // Using a very reliable model ID
            system: systemPrompt || 'You are an expert ebook ghostwriter. Write in a clear, engaging tone.',
            messages: messages,
        });

        console.log("Streaming response started");
        return result.pipeTextStreamToResponse(res);
    } catch (error: any) {
        console.error("AI API Error Details:", error);
        return res.status(500).json({ error: "AI processing failed", details: error.message });
    }
}
