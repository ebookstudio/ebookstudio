import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const config = {
  maxDuration: 300,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { messages, action, title, summary, feedback, lastApprovedTitle } = req.body;

  // If it's a specific action from the store (non-streaming)
  if (action === 'write_page') {
    const { text } = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are a professional ebook writer. Write a detailed page for the book.
      Title: ${title}
      Summary: ${summary}
      Target length: 800-1500 words.
      Use professional, engaging markdown formatting.`,
      messages: messages || [],
    });
    
    // For specific non-streaming store actions, we might just return the text
    // But the prompt says "Use Vercel AI SDK's streamText for typewriter effect"
    // So maybe the store should also handle streaming?
    // Let's stick to streaming for the chat and maybe a simpler call for content generation
    // or use streamText and return the stream.
  }

  const result = streamText({
    model: google('gemini-1.5-flash'),
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
    messages,
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
          // This will be handled on the client side via tool results
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
           // We'll actually handle the writing in the chat or a separate call
           return { success: true };
        }
      })
    },
  });

  return result.toDataStreamResponse();
}
