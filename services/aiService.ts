import { GoogleGenAI } from "@google/genai";
import { ChapterOutline, GeneratedImage } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';

// Configuration
const OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet:beta"; // Top tier creative model
const FALLBACK_MODEL = "google/gemini-2.0-flash-exp:free";

// Lazy initialization for Gemini
let genAI: any = null;

const getOpenRouterKey = () => import.meta.env.VITE_OPENROUTER_API_KEY || "";
const getGeminiKey = () => import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "";

// Helper to clean JSON strings from Markdown code blocks
const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) cleaned = jsonBlockMatch[1];
  const firstBrace = cleaned.search(/[{[]/);
  let lastIndex = -1;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    if (cleaned[i] === '}' || cleaned[i] === ']') {
      lastIndex = i;
      break;
    }
  }
  if (firstBrace !== -1 && lastIndex !== -1 && lastIndex > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastIndex + 1);
  }
  return cleaned;
};

// --- MULTI-PROVIDER REQUEST HANDLER ---

const callAI = async (prompt: string, systemInstruction?: string, jsonMode: boolean = false): Promise<string> => {
    const openRouterKey = getOpenRouterKey();
    
    if (openRouterKey) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://ebookstudio.vercel.app",
                    "X-Title": "EbookStudio"
                },
                body: JSON.stringify({
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        ...(systemInstruction ? [{ "role": "system", "content": systemInstruction }] : []),
                        { "role": "user", "content": prompt }
                    ],
                    ...(jsonMode ? { "response_format": { "type": "json_object" } } : {})
                })
            });
            const data = await response.json();
            return data.choices?.[0]?.message?.content || "";
        } catch (e) {
            console.error("OpenRouter Request Failed, falling back to Gemini if available...", e);
        }
    }

    // Fallback to Gemini
    const geminiKey = getGeminiKey();
    if (geminiKey) {
        try {
            if (!genAI) genAI = new GoogleGenAI(geminiKey);
            const model = genAI.getGenerativeModel({ 
                model: GEMINI_TEXT_MODEL,
                systemInstruction: systemInstruction 
            });
            const result = await model.generateContent(prompt);
            return result.response.text() || "";
        } catch (e) {
            console.error("Gemini Fallback Failed", e);
        }
    }

    throw new Error("No AI providers available. Check your API keys.");
};

// --- CORE FUNCTIONS ---

export const generateTitleSuggestions = async (topic: string, genre: string, tone: string): Promise<string[]> => {
    try {
        const prompt = `Generate 5 high-value eBook titles for: ${topic}, Genre: ${genre}, Tone: ${tone}. Return a JSON array of strings only.`;
        const response = await callAI(prompt, "You are a professional book naming expert.", true);
        return JSON.parse(cleanJsonString(response));
    } catch (error) {
        console.error("Title generation failed", error);
        return ["Untitled Masterpiece"];
    }
};

export const generateBookOutline = async (title: string, genre: string, tone: string): Promise<ChapterOutline[]> => {
    try {
        const prompt = `Create a 5-chapter professional outline for a book titled "${title}". Genre: ${genre}, Tone: ${tone}. Return a JSON array where each object has 'title' and 'summary'.`;
        const response = await callAI(prompt, "You are a senior literary editor.", true);
        return JSON.parse(cleanJsonString(response));
    } catch (error) {
        console.error("Outline generation failed", error);
        return [];
    }
};

export const generateFullChapterContent = async (chapterTitle: string, bookTitle: string, summary: string, tone: string): Promise<string> => {
    try {
        const prompt = `Write the full content for the chapter "${chapterTitle}" in the book "${bookTitle}". Context: ${summary}. Tone: ${tone}. Use professional markdown formatting. Aim for 800+ words.`;
        return await callAI(prompt, "You are a world-class non-fiction author.");
    } catch (error) {
        console.error("Chapter content generation failed", error);
        return "Content generation unavailable.";
    }
};

export const suggestBookPrice = async (bookDetails: any): Promise<string> => {
    try {
        const prompt = `Based on these book details: ${JSON.stringify(bookDetails)}, suggest a professional retail price in INR. Return ONLY the number.`;
        const response = await callAI(prompt, "You are a book marketing specialist.");
        return response.replace(/[^0-9.]/g, '').trim() || "499";
    } catch (error) {
        return "499";
    }
};

export const analyzePdfContent = async (pdfBase64: string): Promise<any | null> => {
    // PDF analysis still requires Gemini's native multimodal support if possible
    // For now, we use Gemini if the key is present
    const geminiKey = getGeminiKey();
    if (!geminiKey) return null;

    try {
        if (!genAI) genAI = new GoogleGenAI(geminiKey);
        const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
        const prompt = `Analyze this PDF. Extract Title, Author, Genre, and a Description (100 words). Return JSON.`;
        const result = await model.generateContent([
            { inlineData: { mimeType: "application/pdf", data: base64Data } },
            { text: prompt }
        ]);
        return JSON.parse(cleanJsonString(result.response.text() || "{}"));
    } catch (e) {
        console.error("PDF Analysis failed", e);
        return null;
    }
};

// Image generation usually requires a specific provider (e.g., DALL-E or Midjourney)
// We'll keep the Gemini Image Model fallback for now
export const generateBookCover = async (prompt: string, style: string = 'Cinematic', title: string = '', author: string = ''): Promise<GeneratedImage | { error: string }> => {
    const geminiKey = getGeminiKey();
    if (!geminiKey) return { error: "Image generation requires Gemini API key." };

    try {
        if (!genAI) genAI = new GoogleGenAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_IMAGE_MODEL });
        const refinedPrompt = `Book Visual: ${title} by ${author}. Request: ${prompt}. Style: ${style}. High Resolution.`;
        const result = await model.generateContent(refinedPrompt);
        const response = result.response;
        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData?.data) return { imageBytes: part.inlineData.data, prompt: prompt };
        return { error: "Generation failed." };
    } catch (error) {
        return { error: "Service unavailable." };
    }
};

// Enhanced session mock for chat compatibility
export const initializeGeminiChat = async (): Promise<any> => {
    console.log("Chat initialized using OpenRouter/Gemini provider");
    return {
        sendMessageStream: async ({ message }: { message: any }) => {
            const prompt = Array.isArray(message) ? message.map((m: any) => m.text || "").join("\n") : (message.text || message);
            const response = await callAI(prompt, "You are a professional Co-Author assistant. Help the author write their book with professional markdown.");
            
            // Return an async generator to simulate streaming
            return (async function* () {
                // Return the response in one chunk for now (or split by words for effect)
                yield { text: response };
            })();
        }
    };
};

export const createStudioSession = (initialContext: string): any => {
    return {
        sendMessageStream: async ({ message }: { message: any }) => {
            const prompt = Array.isArray(message) ? message.map((m: any) => m.text || "").join("\n") : (message.text || message);
            const response = await callAI(prompt, initialContext);
            return (async function* () {
                yield { text: response };
            })();
        }
    };
};
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    console.log("Audio transcription requested", mimeType);
    return "Audio transcription is currently in maintenance mode.";
};
