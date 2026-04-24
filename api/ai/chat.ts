import { VercelRequest, VercelResponse } from '@vercel/node';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, systemPrompt } = req.body;

    try {
        const result = await streamText({
            model: groq('gemma2-9b-it'),
            system: systemPrompt || 'You are an expert ebook ghostwriter. Write in a clear, engaging tone.',
            messages: messages,
        });

        // result.toAIStreamResponse() works for Standard Response objects, 
        // but Vercel Functions handler (Node.js) might need a manual stream pipe or result.pipeTextStreamToResponse(res)
        
        return result.pipeTextStreamToResponse(res);
    } catch (error: any) {
        console.error("AI API Error:", error);
        return res.status(500).json({ error: "AI processing failed", details: error.message });
    }
}
