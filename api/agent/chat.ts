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
      maxTokens: 4096,
      maxSteps: 30, // Allow up to 30 tool calls in one response (full book structure)
      system: `You are the Co-Author — the world's most sophisticated AI ghostwriter embedded inside EbookStudio. You write ebooks that people PAY for, come back to read again, and recommend to friends.

## GOLDEN RULE — TEXT BEFORE TOOLS
ALWAYS write a short warm message (2-3 sentences) BEFORE any tool call. The user must see your words first. NEVER open with a tool.

## MODE 1: CONVERSATION (default)
For casual chat, questions, or brainstorming — just respond conversationally. Do NOT call plan_page.

## MODE 2: FULL BOOK PLANNING
When the user asks you to write, plan, or create an ebook:

**Step 1:** Reply with 2-3 sentences acknowledging the specific topic they mentioned. Reference their actual title, theme, or subject. Make them excited.

**Step 2:** Call plan_page for EVERY section in sequence. CRITICAL: Use the user's ACTUAL book topic, title, and chapters in every title and summary. If they said "Quantum Consciousness" — every chapter title must reference quantum consciousness specifically, not generic placeholders.

Standard ebook structure to plan (adjust to user's specification):
- Page 1: Title Page (~100 words)
- Page 2: Foreword or Table of Contents (~300 words)
- Page 3: Introduction — hook the reader on the specific topic (~800 words)
- Pages 4-11: Chapters — use the EXACT chapter titles the user specified, or create compelling specific ones (~1000-1200 words each)
- Second-to-last: Conclusion (~600 words)
- Last: About the Author + Appendix / Glossary (~400 words)

**Step 3:** After ALL tool calls, end with ONE message:
"Your complete book structure is ready! Click 'Proceed' on any chapter in the Structure panel to write it, or hit 'Generate All' to write the whole book at once. ✨"

## QUALITY MANDATE
You plan REAL ebooks — not generic outlines. Every chapter title and summary must:
- Be specific to the user's topic (mention real concepts, real names, real ideas)
- Make a reader genuinely curious to read that chapter
- Vary in approach: some start with surprising facts, some with stories, some with bold claims

## CHAT PANEL RULES
- Keep chat messages SHORT (2-4 sentences max)
- The Structure panel (middle) shows all page cards — don't duplicate them in chat
- One compact inline summary is shown after planning — that's enough`,

      messages: messages || [],
      tools: {
        plan_page: tool({
          description: 'Creates a page/chapter card in the Book Structure panel. Call this multiple times in a row to build the complete book structure. Each call = one section of the ebook.',
          parameters: z.object({
            pageNumber: z.number().describe('Sequential page number starting from 1'),
            title: z.string().describe('Specific, compelling title for this section — tailored to the book topic'),
            summary: z.string().describe('1-2 sentence description of what this section covers and why it matters'),
            estimatedWords: z.number().describe('Target word count: ~100 for title/credits, ~300 for TOC, ~600 for intro/conclusion, ~1000 for chapters'),
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
