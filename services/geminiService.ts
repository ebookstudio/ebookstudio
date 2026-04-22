import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { EBook, GeneratedImage, ChapterOutline } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';

// Lazy initialization to prevent app crash if API key is missing
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (genAI) return genAI;
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "";
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  
  genAI = new GoogleGenAI(apiKey);
  return genAI;
};

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

// --- AGENT TOOLS ---
const writeContentTool: FunctionDeclaration = {
    name: "write_content",
    description: "Writes content directly into the book editor.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            content: { type: Type.STRING, description: "The FULL markdown content." },
            summary: { type: Type.STRING, description: "A status." }
        },
        required: ["content"]
    }
};

const proposeBlueprintTool: FunctionDeclaration = {
    name: "propose_blueprint",
    description: "Propose a book title and chapter outline.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Proposed title." },
            outline: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING }
                    }
                }
            }
        },
        required: ["title", "outline"]
    }
};

const generateImageTool: FunctionDeclaration = {
    name: "generate_image",
    description: "Generates a high-quality visual asset.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt: { type: Type.STRING, description: "Visual description." }
        },
        required: ["prompt"]
    }
};

// --- CORE FUNCTIONS ---

export const analyzePdfContent = async (pdfBase64: string): Promise<any | null> => {
    try {
        const ai = getAI();
        if (!ai) return null;
        const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
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

export const createStudioSession = (initialContext: string): any => {
    try {
        const ai = getAI();
        if (!ai) return null;
        const model = ai.getGenerativeModel({ 
            model: GEMINI_TEXT_MODEL,
            systemInstruction: `IDENTITY: You are Co-Author for EbookStudio. MISSION: Write immersive books.`,
            tools: [{ functionDeclarations: [writeContentTool, proposeBlueprintTool, generateImageTool] }],
        });
        return model.startChat({ history: [] });
    } catch (e) {
        console.error("Failed to create studio session", e);
        return null;
    }
};

export const suggestBookPrice = async (bookDetails: any): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "499";
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const prompt = `Suggest a price in INR for "${bookDetails.title}". Return ONLY the number.`;
    const result = await model.generateContent(prompt);
    return result.response.text()?.replace(/[^0-9.]/g, '').trim() || "499";
  } catch (error) {
    return "499";
  }
};

export const generateBookCover = async (prompt: string, style: string = 'Cinematic', title: string = '', author: string = ''): Promise<GeneratedImage | { error: string }> => {
  try {
    const ai = getAI();
    if (!ai) return { error: "AI disabled." };
    const model = ai.getGenerativeModel({ model: GEMINI_IMAGE_MODEL });
    const refinedPrompt = `Book Visual: ${title} by ${author}. Request: ${prompt}. Style: ${style}.`;
    const result = await model.generateContent(refinedPrompt);
    const response = result.response;
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return { imageBytes: part.inlineData.data, prompt: prompt };
    return { error: "Generation failed." };
  } catch (error) {
    return { error: "Service unavailable." };
  }
};

export const generateTitleSuggestions = async (topic: string, genre: string, tone: string): Promise<string[]> => {
  try {
    const ai = getAI();
    if (!ai) return [];
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const prompt = `Generate 5 eBook titles for: ${topic}, ${genre}, ${tone}. Return JSON array.`;
    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJsonString(result.response.text() || "[]"));
  } catch (error) {
    console.error("Title generation failed", error);
    return [];
  }
};

export const generateBookOutline = async (title: string, genre: string, tone: string): Promise<ChapterOutline[]> => {
  try {
    const ai = getAI();
    if (!ai) return [];
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const prompt = `Create a 5-chapter outline for "${title}". Return JSON array with 'title' and 'summary'.`;
    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJsonString(result.response.text() || "[]"));
  } catch (error) {
    console.error("Outline generation failed", error);
    return [];
  }
};

export const generateFullChapterContent = async (chapterTitle: string, bookTitle: string, summary: string, tone: string): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "AI disabled.";
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const prompt = `Write chapter "${chapterTitle}" for "${bookTitle}". Summary: ${summary}. Tone: ${tone}. Markdown.`;
    const result = await model.generateContent(prompt);
    return result.response.text() || "";
  } catch (error) {
    console.error("Chapter content generation failed", error);
    return "Generation failed.";
  }
};

export const initializeGeminiChat = async (): Promise<any> => {
    return createStudioSession("Global Context");
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string | null> => {
  try {
    const ai = getAI();
    if (!ai) return null;
    const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const result = await model.generateContent([
        { inlineData: { mimeType: mimeType, data: audioBase64 } },
        { text: "Transcribe." }
    ]);
    return result.response.text() || null;
  } catch (e) {
    console.error("Transcription failed", e);
    return null;
  }
};
