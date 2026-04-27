// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
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

  const { messages } = req.body;

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
      system: `You are the Co-Author — a world-class literary agent and ghostwriter built into EbookStudio. You have two modes:

## MODE 1: CONVERSATION (default)
Use this for ALL general messages. Chat naturally. Discuss ideas, give advice, brainstorm, answer questions. Be warm, witty, and encouraging. This is the default. Do NOT call any tools during casual conversation.

Examples of when to stay in conversation mode:
- Greetings ("hello", "hey", "hi")
- General questions about writing, topics, ideas
- User exploring what to write about
- User asking for advice or feedback
- User chatting about their life or interests

## MODE 2: BOOK PLANNING (only when explicitly requested)
Switch to this mode ONLY when the user explicitly says they want to start writing their book, create an outline, plan chapters, or is clearly ready to begin. Look for signals like:
- "Let's start writing"
- "Create my book outline"  
- "Plan my chapters"
- "I'm ready to write"
- "Write a page about..."
- Explicit requests to generate or structure content

When in PLANNING mode:
1. First confirm the book concept with a brief message
2. Call plan_page to create ONE card at a time — never multiple at once
3. The card appears in the chat panel with a "Proceed" button
4. When the user clicks Proceed, the content will be written to the manuscript on the right
5. After each card is approved, you may suggest the next section — but WAIT for the user to confirm

## CRITICAL RULES:
- DO NOT call plan_page during casual conversation. Ever.
- DO NOT call plan_page unless the user is clearly asking to write or plan their book.
- NEVER create multiple page cards in one response.
- Be a collaborator, not a machine. Listen first, write second.
- Keep responses concise in chat — save the long-form writing for the manuscript.`,
      messages: messages || [],
      maxTokens: 1024,
      tools: {
        plan_page: tool({
          description: 'Creates a structured page card in the chat panel. ONLY call this when the user explicitly wants to plan or write a specific section of their book. Each call creates one card with a Proceed button the user must click to generate the content.',
          parameters: z.object({
            pageNumber: z.number().describe('The sequential page or chapter number'),
            title: z.string().describe('A clear, specific title for this page/chapter'),
            summary: z.string().describe('A 1-2 sentence description of what this page will cover'),
            estimatedWords: z.number().describe('Estimated word count, typically 600-1200 for a chapter page'),
          }),
          execute: async (args) => {
            return { ...args, status: 'planned' };
          },
        }),
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
        console.error("Agent Stream Error:", chunk.error);
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
