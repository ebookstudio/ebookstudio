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

    // ── Build rich context for this specific page ──────────────────────────

    const allCards = get().pageCards;
    const bookTitle = allCards[0]?.title || card.title;

    // Full book structure so the AI knows where this page sits
    const bookStructure = allCards
      .map(c => `  ${c.pageNumber}. ${c.title} — ${c.summary}`)
      .join('\n');

    // Summary of already-generated pages so the AI doesn't repeat content
    const previousPages = allCards
      .filter(c => c.status === 'approved' && c.content && c.id !== cardId)
      .map(c => `[Page ${c.pageNumber}: ${c.title}]\n${c.content?.slice(0, 400)}...`)
      .join('\n\n');

    // Per-section type guidance based on page number and title keywords
    const titleLower = card.title.toLowerCase();
    let sectionGuidance = '';

    if (card.pageNumber === 1 || titleLower.includes('title')) {
      sectionGuidance = `FORMAT: This is the Title Page. Write it like a real published Kindle ebook:
- Book title (large, bold)
- A compelling subtitle
- Author byline
- A one-line publisher tagline
- A short copyright notice placeholder
Keep it elegant, minimal, and professional. ~100 words.`;
    } else if (titleLower.includes('table of contents') || titleLower.includes('contents')) {
      sectionGuidance = `FORMAT: This is the Table of Contents. List every chapter from the book structure above with:
- Chapter number and exact title
- A 1-sentence teaser of what the reader will gain from that chapter
Make it enticing — the TOC should make readers want to skip ahead to every chapter.`;
    } else if (titleLower.includes('introduction') || titleLower.includes('preface') || titleLower.includes('foreword')) {
      sectionGuidance = `FORMAT: This is the Introduction. Structure it like a bestselling nonfiction intro:
1. Open with a bold, counterintuitive hook or story that grabs immediately
2. State the central problem or mystery this book addresses
3. Explain why this topic matters RIGHT NOW in 2025-2026
4. Give a clear "this book will teach you X, Y, Z" promise
5. Brief roadmap of chapters
Write with urgency, authority, and genuine curiosity. This must hook the reader so hard they cannot put the book down.`;
    } else if (titleLower.includes('conclusion') || titleLower.includes('epilogue')) {
      sectionGuidance = `FORMAT: This is the Conclusion. Write it like a powerful TED talk ending:
1. Callback to the opening hook from the introduction
2. Synthesize the 3 most important insights from ALL chapters
3. A "so what?" — why does this matter to the reader's real life?
4. A specific, actionable challenge or call-to-action for the reader
5. An inspiring final paragraph that leaves the reader uplifted and changed
Do NOT repeat chapter summaries word-for-word. Synthesize and elevate.`;
    } else if (titleLower.includes('about the author') || titleLower.includes('author')) {
      sectionGuidance = `FORMAT: About the Author page — write in third person, confident and human:
- Name, expertise, and credentials
- Why they are uniquely qualified to write this specific book
- One personal detail that makes them relatable
- Where to find them online / follow their work
- Keep it to 150-200 words. Warm but authoritative.`;
    } else if (titleLower.includes('credits') || titleLower.includes('acknowledgements') || titleLower.includes('references') || titleLower.includes('appendix') || titleLower.includes('glossary')) {
      sectionGuidance = `FORMAT: This is the back matter (Credits/Acknowledgements/References/Glossary).
Write real, useful content appropriate to the section type:
- For Glossary: define 8-12 key technical terms from the book with clear, plain-English definitions
- For References: list 8-10 specific books, papers, or sources relevant to the book topic
- For Acknowledgements: warm, specific thank-yous (author, editor, readers, inspirations)
Make this section feel like a real published book, not filler.`;
    } else {
      // Standard chapter
      const chapterNum = card.pageNumber - 2; // offset for title/TOC
      sectionGuidance = `FORMAT: This is Chapter ${chapterNum} of the ebook. Write it like a chapter in a $15 bestselling nonfiction book:

STRUCTURE (follow this precisely):
1. **Opening Hook** (1 paragraph): A surprising fact, story, or question specific to THIS chapter's topic
2. **Core Concept** (2-3 paragraphs): Explain the main idea of this chapter clearly. Use vivid analogies. No jargon without explanation.
3. **Deep Dive** (3-4 paragraphs): Go deeper. Provide specific evidence, examples, research, or case studies. Be specific — cite real concepts, real mechanisms, real implications.
4. **Real-World Application** (1-2 paragraphs): How does this apply to the reader's life, career, or worldview?
5. **Chapter Summary** (3 sentences): The three most important things to remember from this chapter.

CRITICAL: This chapter must cover DIFFERENT content than previous chapters. Do not repeat what was already explained. Build on it.
Write with authority, warmth, and intellectual excitement. Make the reader feel smarter after reading this.`;
    }

    const writingPrompt = `You are ghostwriting a professional, publishable ebook. Every word must justify its place — this is a $11 commercial ebook that readers will buy and recommend.

═══ BOOK CONTEXT ═══
Book Title: ${bookTitle}
Total Pages: ${allCards.length}

Complete Book Structure:
${bookStructure}

═══ WHAT HAS ALREADY BEEN WRITTEN ═══
${previousPages || '(This is the first page being written)'}

═══ YOUR TASK ═══
You are writing: Page ${card.pageNumber} — "${card.title}"
Summary of this page: ${card.summary}
Target word count: ${card.estimatedWords} words

${sectionGuidance}

═══ WRITING RULES ═══
- Return ONLY the written content — no meta-commentary, no "here is the content:", no preamble
- Do NOT write a title heading (the page title is handled separately)
- Use markdown formatting: **bold** for key terms, ## for subheadings within the chapter, > for important quotes or callouts
- Write as if your career depends on this being excellent
- Be specific, original, and insightful — not generic or simulated
- Every paragraph must add unique value the reader cannot get elsewhere`;


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
