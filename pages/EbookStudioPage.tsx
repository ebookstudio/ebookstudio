import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useAgentStore } from '../stores/agentStore';
import { AgentChat } from '../components/AgentChat';
import { Button } from '../components/ui/button';
import NovelEditor from '../components/NovelEditor';
import { cn } from '../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

const INTRO_TEMPLATE = `# Your Book Title

> *"A compelling quote or epigraph goes here."*

---

## Preface

Welcome to the beginning of something extraordinary. This introduction sets the tone for everything that follows — the ideas, the stories, and the insights that will unfold page by page.

Write a few lines here about what inspired this book, who it is for, and what the reader can expect from the journey ahead.

---

## What You Will Find Inside

- **Part One** — The foundation and core concepts
- **Part Two** — Deep dives and real-world application
- **Part Three** — Advanced insights and the path forward

---

## A Note to the Reader

This book was written with one person in mind: you. Whether you are a complete beginner or a seasoned expert, you will find value in these pages. Read at your own pace, take notes, and revisit chapters whenever you need to.

*Let's begin.*
`;

// ─────────────────────────────────────────────────────────────────────────────
// GhostWritingCanvas — a zero-reparse streaming view
// Appends text via DOM mutation, not React state, so zero re-renders during stream
// ─────────────────────────────────────────────────────────────────────────────
const GhostWritingCanvas = React.forwardRef<
  { append: (text: string) => void; getText: () => string },
  {}
>((_, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fullTextRef   = React.useRef('');

  React.useImperativeHandle(ref, () => ({
    append(text: string) {
      fullTextRef.current += text;
      if (containerRef.current) {
        // Direct DOM append — zero React reconciliation overhead
        containerRef.current.innerText = fullTextRef.current;
        // Auto-scroll to bottom
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    },
    getText() {
      return fullTextRef.current;
    },
  }));

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0d0d0f]">
      {/* Animated top strip */}
      <div className="sticky top-0 z-20 w-full pointer-events-none">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent animate-pulse" />
        <div className="flex justify-center pt-2">
          <div className="flex items-center gap-2 bg-zinc-950/90 border border-blue-500/25 rounded-full px-3 py-1 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
              Co-Author is writing
            </span>
          </div>
        </div>
      </div>

      {/* Raw text render — no parsing, no re-renders */}
      <div
        ref={containerRef}
        className="max-w-[700px] mx-auto py-16 px-8 font-serif text-[1.15rem] text-zinc-300 leading-[2] whitespace-pre-wrap"
        style={{ minHeight: '60vh' }}
      />

      {/* Blinking cursor appended via CSS ::after */}
      <style>{`
        .ghost-cursor::after {
          content: '▋';
          color: #60a5fa;
          animation: blink 0.7s step-end infinite;
          margin-left: 2px;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
});
GhostWritingCanvas.displayName = 'GhostWritingCanvas';

// ─────────────────────────────────────────────────────────────────────────────
// EbookStudioPage
// ─────────────────────────────────────────────────────────────────────────────
const EbookStudioPage: React.FC = () => {
  const { currentUser, addCreatedBook } = useAppContext();
  const navigate = useNavigate();
  const { pageCards, resetStore, registerManuscriptCallback } = useAgentStore();
  const [draftId] = React.useState<string>(() => `draft-${Date.now()}`);

  // Clear stale state on every session start
  React.useEffect(() => {
    resetStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Two-phase rendering: ghost canvas during stream, NovelEditor when editing
  const [editorTitle,   setEditorTitle]   = React.useState('My Book');
  const [editorContent, setEditorContent] = React.useState(INTRO_TEMPLATE);
  const [isGhostWriting, setIsGhostWriting] = React.useState(false);

  // Ghost canvas imperative handle — so we can call .append() without React state
  const ghostRef = React.useRef<{ append: (t: string) => void; getText: () => string } | null>(null);

  // Track which cards we've already started writing
  const startedCards = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    registerManuscriptCallback((chunk, cardId) => {
      if (!startedCards.current.has(cardId)) {
        // First chunk for this card → switch to ghost canvas mode
        startedCards.current.add(cardId);
        setIsGhostWriting(true);
        // Let React render the ghost canvas, then start writing
        requestAnimationFrame(() => {
          ghostRef.current?.append(chunk);
        });
      } else {
        // Subsequent chunks → direct DOM append, ZERO React state updates
        ghostRef.current?.append(chunk);
      }
    });
    return () => registerManuscriptCallback(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When streaming finishes → hand the raw text to the NovelEditor once and switch back
  React.useEffect(() => {
    const stillGenerating = pageCards.some(c => c.status === 'generating');
    if (!stillGenerating && isGhostWriting) {
      // Small delay for the final chunk to flush to DOM
      const timer = setTimeout(() => {
        const finalText = ghostRef.current?.getText() || '';
        if (finalText) {
          setEditorContent(finalText);
        }
        setIsGhostWriting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCards]);

  const handleExport = () => {
    const approvedCards = pageCards.filter(c => c.status === 'approved');
    const pagesToExport = approvedCards.length > 0 ? approvedCards : pageCards;

    if (pagesToExport.length === 0) {
      alert("Please generate at least one page before publishing.");
      return;
    }

    const finalBook: EBook = {
      id: draftId,
      title: editorTitle || pageCards[0]?.title || "Untitled Masterpiece",
      author: currentUser?.name || 'Author',
      description: 'Authored with Studio-Grade AI Precision',
      price: 299,
      coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
      genre: 'Literature',
      sellerId: currentUser?.id || 'guest',
      publicationDate: new Date().toISOString().split('T')[0],
      pages: pagesToExport.map(c => ({
        id: c.id,
        title: c.title,
        content: editorContent,
        pageNumber: c.pageNumber
      })),
      isDraft: false
    };
    addCreatedBook(finalBook);
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 overflow-hidden font-sans text-zinc-100 selection:bg-zinc-100/10">

      {/* ── GLOBAL HEADER ── */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="w-4 h-4 rounded-full border-2 border-zinc-500 flex items-center justify-center group-hover:border-zinc-100 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-zinc-100 transition-colors" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-100">EbookStudio</span>
          </div>
          <div className="w-px h-4 bg-zinc-800 mx-2" />
          <h1 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            Production · $1M Edition
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              isGhostWriting ? "bg-blue-500 animate-ping" : "bg-emerald-500 animate-pulse"
            )} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {isGhostWriting ? 'Ghost Writing' : 'Neural Link Syncing'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-8 px-4 rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 hover:border-zinc-700 transition-all"
          >
            Publish Draft
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider"
          >
            Exit
          </Button>
          <div className="w-7 h-7 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
            {currentUser?.profileImageUrl ? (
              <img src={currentUser.profileImageUrl} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-zinc-600">{(currentUser?.name || 'U')[0]}</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* ── LEFT PANEL: AI CHAT + CARDS ── */}
        <AgentChat />

        {/* ── RIGHT PANEL ── */}
        <main className="flex-1 flex flex-col bg-[#0d0d0f] overflow-hidden relative h-full">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-3 border-b border-zinc-800/60 bg-[#0d0d0f] shrink-0">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                isGhostWriting ? "bg-blue-500 animate-pulse scale-125" : "bg-emerald-500"
              )} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {isGhostWriting ? 'Ghost Writing...' : 'Live Manuscript'}
              </span>
              {pageCards.filter(c => c.status === 'approved').length > 0 && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {pageCards.filter(c => c.status === 'approved').length} pages
                </span>
              )}
            </div>
            <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
              {isGhostWriting
                ? <span className="text-blue-400/70">AI is writing · please wait</span>
                : <span>Type <span className="text-zinc-500">/</span> for block options</span>
              }
            </div>
          </div>

          {/* Phase 1: Ghost Writing Canvas — zero-reparse, DOM-direct streaming */}
          {isGhostWriting && (
            <GhostWritingCanvas ref={ghostRef} />
          )}

          {/* Phase 2: NovelEditor — only mounted when not streaming */}
          {!isGhostWriting && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-[700px] mx-auto py-16 px-8">
                <NovelEditor
                  title={editorTitle}
                  onTitleChange={setEditorTitle}
                  content={editorContent}
                  onContentChange={setEditorContent}
                  onTriggerAI={(prompt) => console.log('AI trigger:', prompt)}
                  onTriggerImageGen={(prompt) => console.log('Image gen:', prompt)}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EbookStudioPage;
