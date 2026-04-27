import { create } from 'zustand';

export interface PageCard {
  id: string;
  type: "page_plan";
  status: "planned" | "generating" | "ready" | "approved";
  pageNumber: number;
  title: string;
  summary: string;
  estimatedWords: number;
  content?: string;
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
  
  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  addPageCard: (card: Omit<PageCard, 'id' | 'type' | 'status'>) => string;
  updatePageCard: (id: string, updates: Partial<PageCard>) => void;
  generatePage: (cardId: string) => Promise<void>;
  approvePage: (cardId: string) => Promise<void>;
  regeneratePage: (cardId: string, feedback: string) => Promise<void>;
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

  generatePage: async (cardId) => {
    const card = get().pageCards.find(c => c.id === cardId);
    if (!card) return;

    set({ isLoading: true });
    get().updatePageCard(cardId, { status: 'generating' });

    try {
      // Build a writing prompt from the card details
      // We use the main chat API but with a direct writing instruction
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

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: writingPrompt }
          ]
        }),
      });

      if (!response.ok) throw new Error('API error');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(Boolean)) {
          if (line.startsWith('0:')) {
            try { fullContent += JSON.parse(line.slice(2)); } catch {}
          }
        }
        // Stream content into card in real time for live preview
        get().updatePageCard(cardId, { content: fullContent });
      }

      get().updatePageCard(cardId, { status: 'ready', content: fullContent });
    } catch (error) {
      console.error('Failed to generate page:', error);
      get().updatePageCard(cardId, { status: 'planned' });
    } finally {
      set({ isLoading: false });
    }
  },

  approvePage: async (cardId) => {
    const card = get().pageCards.find(c => c.id === cardId);
    if (!card) return;

    get().updatePageCard(cardId, { status: 'approved' });
    
    set((state) => ({
      currentBook: {
        ...state.currentBook,
        approvedPages: [...state.currentBook.approvedPages, card.content || '']
      }
    }));

    // Automatically trigger next page planning via AI
    const lastMessage = get().messages[get().messages.length - 1];
    await fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'plan_next',
        lastApprovedTitle: card.title,
        history: get().messages
      }),
    });
  },

  regeneratePage: async (cardId, feedback) => {
    const card = get().pageCards.find(c => c.id === cardId);
    if (!card) return;

    set({ isLoading: true });
    get().updatePageCard(cardId, { status: 'generating' });

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate_page',
          cardId,
          title: card.title,
          feedback,
          history: get().messages
        }),
      });

      const data = await response.json();
      if (data.content) {
        get().updatePageCard(cardId, { 
          status: 'ready', 
          content: data.content 
        });
      }
    } catch (error) {
      console.error('Failed to regenerate page:', error);
      get().updatePageCard(cardId, { status: 'ready' });
    } finally {
      set({ isLoading: false });
    }
  },

  resetStore: () => set({
    messages: [],
    pageCards: [],
    currentBook: { title: '', pages: [], approvedPages: [] },
    isLoading: false
  })
}));
