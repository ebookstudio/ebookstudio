import { create } from 'zustand';

export interface PageCard {
  id: string;
  type: "page_plan";
  status: "planned" | "generating" | "approved";
  pageNumber: number;
  title: string;
  summary: string;
  estimatedWords: number;
  content?: string; // Final generated content for this page
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AgentStore {
  messages: Message[];
  pageCards: PageCard[];
  currentViewPageId: string | null;
  isLoading: boolean;

  // Manuscript streaming callback — registered by EbookStudioPage
  _manuscriptCallback: ((chunk: string, cardId: string) => void) | null;

  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  addPageCard: (card: Omit<PageCard, 'id' | 'type' | 'status'>) => string;
  updatePageCard: (id: string, updates: Partial<PageCard>) => void;
  setCurrentViewPage: (id: string | null) => void;
  generatePage: (cardId: string) => Promise<void>;
  generateAllPages: () => Promise<void>;
  registerManuscriptCallback: (cb: ((chunk: string, cardId: string) => void) | null) => void;
  resetStore: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  messages: [],
  pageCards: [],
  currentViewPageId: null,
  isLoading: false,
  _manuscriptCallback: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setMessages: (messages) => set({ messages }),

  addPageCard: (cardData) => {
    const id = Math.random().toString(36).substring(7);
    const newCard: PageCard = {
      ...cardData,
      id,
      type: "page_plan",
      status: "planned",
    };
    set((state) => ({
      pageCards: [...state.pageCards, newCard]
    }));
    return id;
  },

  updatePageCard: (id, updates) => set((state) => ({
    pageCards: state.pageCards.map((card) =>
      card.id === id ? { ...card, ...updates } : card
    )
  })),

  setCurrentViewPage: (id) => set({ currentViewPageId: id }),

  registerManuscriptCallback: (cb) => set({ _manuscriptCallback: cb }),

  generatePage: async (cardId) => {
    const card = get().pageCards.find(c => c.id === cardId);
    if (!card) return;

    // Don't allow parallel generation
    const alreadyGenerating = get().pageCards.some(c => c.status === 'generating');
    if (alreadyGenerating) return;

    set({ isLoading: true });
    get().updatePageCard(cardId, { status: 'generating' });
    // Switch view to this page immediately
    set({ currentViewPageId: cardId });

    const writingPrompt = `Write the full content for the following book section.

Section Title: "${card.title}"
Description: ${card.summary}
Target Length: ${card.estimatedWords} words

Requirements:
- Write in a professional, engaging, literary style
- Use rich markdown formatting (## subheadings, **bold** for emphasis, > blockquotes for key ideas)
- Include a proper opening paragraph, developed body content, and a closing thought
- Do NOT include a title heading — just the body content starting from the first paragraph
- Return ONLY the written content, no meta-commentary or preamble`;

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: writingPrompt }]
        }),
      });

      if (!response.ok) throw new Error('API error');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      const callback = get()._manuscriptCallback;
      let fullContent = '';

      // Send page heading first
      const heading = `# ${card.title}\n\n`;
      if (callback) callback(heading, cardId);
      fullContent += heading;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const raw = decoder.decode(value, { stream: true });
        for (const line of raw.split('\n').filter(Boolean)) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              if (text) {
                fullContent += text;
                if (callback) callback(text, cardId);
              }
            } catch {}
          }
        }
      }

      // Save final content to the card and mark approved
      get().updatePageCard(cardId, { status: 'approved', content: fullContent });

    } catch (error) {
      console.error('Failed to generate page:', error);
      get().updatePageCard(cardId, { status: 'planned' });
    } finally {
      set({ isLoading: false });
    }
  },

  generateAllPages: async () => {
    const planned = get().pageCards.filter(c => c.status === 'planned');
    for (const card of planned) {
      await get().generatePage(card.id);
      // Small pause between pages
      await new Promise(r => setTimeout(r, 500));
    }
  },

  resetStore: () => set({
    messages: [],
    pageCards: [],
    currentViewPageId: null,
    isLoading: false,
    _manuscriptCallback: null,
  }),
}));
