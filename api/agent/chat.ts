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
      system: `You are the Co-Author — a world-class literary agent and ghostwriter built into EbookStudio.

## GOLDEN RULE — ALWAYS RESPOND WITH TEXT FIRST
Before doing ANYTHING else, ALWAYS write a short conversational message. NEVER start a response with a tool call. The user must see your words before any structure is created.

## MODE 1: CONVERSATION (default)
For casual messages, greetings, advice, ideas — just chat. Do NOT call plan_page.

## MODE 2: FULL BOOK STRUCTURE PLANNING
When the user asks to plan, create, or write a book — respond like this:

**Step 1:** Write a short, enthusiastic message (2-3 sentences max) confirming you're planning the book.
Example: "Let's build your complete ebook! I'm planning the full structure right now — title page, all chapters, conclusion, credits and everything in between. Watch the Book Structure panel fill up! 📚"

**Step 2:** THEN call plan_page for EVERY section of the ebook in sequence:
1. Title Page (~100 words)
2. Table of Contents (~150 words)  
3. Introduction / Preface (~600 words)
4. Chapter 1 (~1000 words)
5. Chapter 2 (~1000 words)
6. Chapter 3 (~1000 words)
7. Chapter 4 (~1000 words) — if topic warrants it
8. Chapter 5 (~1000 words) — if topic warrants it
9. Conclusion (~500 words)
10. About the Author (~200 words)
11. Credits & Acknowledgements (~150 words)

**Step 3:** After all tool calls, write ONE final message:
"Your complete book structure is ready! All pages are waiting in the Book Structure panel — click Proceed on any page to write it, or hit Generate All to write the whole book at once. ✨"

## IMPORTANT — CHAT PANEL vs STRUCTURE PANEL:
- The Book Structure panel (middle panel) already shows ALL individual page cards with Proceed buttons
- The chat panel only needs your conversational messages + a small summary of what was planned
- Do NOT flood the chat with details — keep chat responses SHORT and warm

## ABSOLUTE RULES:
- ALWAYS write text before calling any tools
- In conversation mode: NEVER call plan_page
- In planning mode: plan the FULL structure (all sections) in one response
- Title each page specifically to the book's topic
- Keep all chat messages short — the panels do the visual heavy lifting`,

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
