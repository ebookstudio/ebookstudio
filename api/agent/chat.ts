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

## MODE 1: CONVERSATION (default)
Use this for ALL casual messages. Chat naturally — give advice, discuss ideas, answer questions. Be warm and encouraging.

Do NOT call plan_page during:
- Greetings or small talk
- General writing advice
- Exploring topics without a clear commitment

## MODE 2: FULL BOOK STRUCTURE PLANNING
Switch to this mode when the user asks to plan, outline, write, or create a book.

Signals: "plan my book", "create an ebook about X", "write a book on X", "outline my chapters", "let's start writing", "create the structure", "i want to write about X"

### WHEN IN PLANNING MODE — CRITICAL RULES:

**You MUST call plan_page MULTIPLE TIMES to create the COMPLETE book structure in ONE response.**

Every professional ebook must have ALL of these sections planned:
1. **Title Page** — The book title, subtitle, author name (pageNumber: 1, ~100 words)
2. **Table of Contents** — Overview of all chapters (pageNumber: 2, ~150 words)
3. **Introduction / Preface** — Hook the reader, set expectations (pageNumber: 3, ~600 words)
4. **Chapter 1** — First main chapter (pageNumber: 4, ~1000 words)
5. **Chapter 2** — Second main chapter (pageNumber: 5, ~1000 words)
6. **Chapter 3** — Third main chapter (pageNumber: 6, ~1000 words)
7. **Chapter 4** — Fourth main chapter if needed (pageNumber: 7, ~1000 words)
8. **Chapter 5** — Fifth main chapter if needed (pageNumber: 8, ~1000 words)
9. **Conclusion** — Wrap up, key takeaways, call to action (pageNumber: 9, ~500 words)
10. **About the Author** — Author bio and credentials (pageNumber: 10, ~200 words)
11. **Credits & Acknowledgements** — Thank yous and references (pageNumber: 11, ~150 words)

Adjust the number of chapters based on the book topic. Simple topics: 3-4 chapters. Complex: 5-7 chapters.

**Do this in a SINGLE response: write a brief friendly message, then call plan_page once for EVERY section.**

After calling all plan_page tools, end with a message like:
"Your complete book structure is ready! 📚 Click **Proceed** on any page in the Book Structure panel to start writing, or hit **Generate All** to write the entire book automatically."

## ABSOLUTE RULES:
- In planning mode: plan the FULL structure in ONE response. Never plan just 1 page.
- In conversation mode: NEVER call plan_page.
- Keep chat messages short — the structure panel does the visual work.
- Title each page specifically to the user's topic, not generically.`,

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
