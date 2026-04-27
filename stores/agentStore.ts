import { create } from 'zustand';

export interface PageCard {
  id: string;
  type: "page_plan";
  status: "planned" | "generating" | "approved";
  pageNumber: number;
  title: string;
  summary: string;
  estimatedWords: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AgentStore {
  messages: Message[];
  pageCards: PageCard[];
  currentBook: {
    title: string;
    pages: any[];
    approvedPages: string[];
  };
  isLoading: boolean;

  // Manuscript streaming callback — registered by EbookStudioPage
  _manuscriptCallback: ((chunk: string, cardId: string) => void) | null;

  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  addPageCard: (card: Omit<PageCard, 'id' | 'type' | 'status'>) => string;
  updatePageCard: (id: string, updates: Partial<PageCard>) => void;
  generatePage: (cardId: string) => Promise<void>;
  registerManuscriptCallback: (cb: ((chunk: string, cardId: string) => void) | null) => void;
  resetStore: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  messages: [],
  pageCards: [],
  currentBook: {
    title: '',
    pages: [],
    approvedPages: [],
  },
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

  registerManuscriptCallback: (cb) => set({ _manuscriptCallback: cb }),

  generatePage: async (cardId) => {
    const card = get().pageCards.find(c => c.id === cardId);
    if (!card) return;

    set({ isLoading: true });
    get().updatePageCard(cardId, { status: 'generating' });

    const writingPrompt = `Write the full content for the following book section.

Section Title: "${card.title}"
Description: ${card.summary}
Target Length: ${card.estimatedWords} words

Requirements:
- Write in a professional, engaging, literary style
- Use rich markdown formatting (## subheadings, **bold** for emphasis, > blockquotes for key ideas)
- Include a proper opening paragraph, developed body content, and a closing thought
- Do NOT include a title heading — just the body content
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

      // Send the heading to the manuscript first
      const heading = `\n\n## ${card.title}\n\n`;
      if (callback) callback(heading, cardId);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(Boolean)) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              // Stream each chunk directly to the Novel Editor via callback
              if (callback && text) callback(text, cardId);
            } catch {}
          }
        }
      }

      // Auto-approve the card when writing is complete
      get().updatePageCard(cardId, { status: 'approved' });

    } catch (error) {
      console.error('Failed to generate page:', error);
      // Revert to planned so user can retry
      get().updatePageCard(cardId, { status: 'planned' });
    } finally {
      set({ isLoading: false });
    }
  },

  resetStore: () => set({
    messages: [],
    pageCards: [],
    currentBook: { title: '', pages: [], approvedPages: [] },
    isLoading: false,
    _manuscriptCallback: null,
  }),
}));
