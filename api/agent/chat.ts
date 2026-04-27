// @ts-nocheck
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const config = {
  maxDuration: 300,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, action, title, summary, feedback, lastApprovedTitle } = req.body;

  try {
    const groqKey = (process.env.GROQ_API_KEY || "").trim();
    const googleKey = (process.env.VITE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
    
    let model;
    if (groqKey) {
        const groq = createGroq({ apiKey: groqKey });
        model = groq('llama-3.3-70b-versatile');
    } else {
        const customGoogle = createGoogleGenerativeAI({ apiKey: googleKey });
        model = customGoogle('gemini-1.5-flash');
    }

    const result = await streamText({
      model: model,
      system: `You are EbookStudio Agent - a $10M valuation AI co-author.
      
      YOUR PERSONALITY:
      - Obsessed with quality: "This will be worth every penny"
      - Conversational: Ask questions, show enthusiasm
      - Methodical: One page at a time, no rushing

      WORKFLOW RULES:
      - NEVER write more than 1 page at a time
      - ALWAYS create a page card using plan_page before writing content
      - After user approves, automatically plan the next page
      - Keep chat conversational while cards handle structure`,
      messages: messages || [],
      tools: {
        plan_page: tool({
          description: 'Creates a page card for the book outline.',
          parameters: z.object({
            pageNumber: z.number(),
            title: z.string(),
            summary: z.string(),
            estimatedWords: z.number(),
          }),
          execute: async (args) => {
            return { ...args, status: 'planned' };
          },
        }),
        write_page_content: tool({
          description: 'Generates full markdown content for an approved page card.',
          parameters: z.object({
            cardId: z.string(),
            title: z.string(),
            summary: z.string(),
          }),
          execute: async (args) => {
             return { success: true };
          }
        })
      },
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const fullStream = result.fullStream;
    for await (const chunk of fullStream) {
      if (chunk.type === 'text-delta') {
        const text = chunk.textDelta || chunk.text || "";
        if (text) res.write(`0:${JSON.stringify(text)}\n`);
      } else if (chunk.type === 'tool-call') {
        res.write(`9:${JSON.stringify({ toolCallId: chunk.toolCallId, toolName: chunk.toolName, args: chunk.args || chunk.input })}\n`);
      } else if (chunk.type === 'error') {
        console.error("AI SDK Stream Error Chunk:", chunk.error);
        res.write(`e:${JSON.stringify({ message: chunk.error?.message || String(chunk.error) })}\n`);
      }
    }

    res.end();
  } catch (error: any) {
    console.error("Agent Chat Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Agent stream failed", details: error.message });
    } else {
      res.write(`e:${JSON.stringify({ message: error.message })}\n`);
      res.end();
    }
  }
}
