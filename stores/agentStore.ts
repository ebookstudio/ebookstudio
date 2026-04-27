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
  addPageCard: (card: Omit<PageCard, 'id' | 'type' | 'status'>) => void;
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
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write_page',
          cardId,
          title: card.title,
          summary: card.summary,
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
