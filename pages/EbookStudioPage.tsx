import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useAgentStore } from '../stores/agentStore';
import { AgentChat } from '../components/AgentChat';
import { BookStructurePanel } from '../components/BookStructurePanel';
import { Button } from '../components/ui/button';
import NovelEditor from '../components/NovelEditor';
import { cn } from '../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

const BLANK_PAGE = `Start writing or click Proceed on a page in the structure panel to generate content...`;

// ─────────────────────────────────────────────────────────────────────────────
// GhostWritingCanvas — DOM-direct streaming, zero React re-renders
// ─────────────────────────────────────────────────────────────────────────────
const GhostWritingCanvas = React.forwardRef<
  { append: (text: string) => void; getText: () => string },
  { pageTitle?: string }
>(({ pageTitle }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fullTextRef  = React.useRef('');

  React.useImperativeHandle(ref, () => ({
    append(text: string) {
      fullTextRef.current += text;
      if (containerRef.current) {
        containerRef.current.innerText = fullTextRef.current;
        containerRef.current.parentElement?.scrollTo({
          top: containerRef.current.parentElement.scrollHeight,
          behavior: 'smooth'
        });
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
        <div className="flex justify-center pt-3">
          <div className="flex items-center gap-2 bg-zinc-950/90 border border-blue-500/25 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
              Co-Author is writing{pageTitle ? ` · ${pageTitle}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Raw DOM-written text — no parsing overhead */}
      <div
        ref={containerRef}
        className="max-w-[700px] mx-auto pt-12 pb-32 px-8 font-serif text-[1.15rem] text-zinc-300 leading-[2] whitespace-pre-wrap"
        style={{ minHeight: '80vh' }}
      />

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
});
GhostWritingCanvas.displayName = 'GhostWritingCanvas';

// ─────────────────────────────────────────────────────────────────────────────
// EbookStudioPage — 3-panel layout
// ─────────────────────────────────────────────────────────────────────────────
const EbookStudioPage: React.FC = () => {
  const { currentUser, addCreatedBook } = useAppContext();
  const navigate = useNavigate();
  const {
    pageCards,
    currentViewPageId,
    setCurrentViewPage,
    resetStore,
    registerManuscriptCallback,
  } = useAgentStore();
  const [draftId] = React.useState<string>(() => `draft-${Date.now()}`);
  const [savedOk, setSavedOk] = React.useState(false);

  // Clear stale state on every session start
  React.useEffect(() => {
    resetStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-page editor content — keyed by cardId
  const [pageContents, setPageContents] = React.useState<Record<string, string>>({});
  const [isGhostWriting, setIsGhostWriting] = React.useState(false);
  const [ghostPageTitle, setGhostPageTitle] = React.useState('');

  // Ghost canvas imperative handle
  const ghostRef = React.useRef<{ append: (t: string) => void; getText: () => string } | null>(null);

  // Track which cards we've already started writing
  const startedCards = React.useRef<Set<string>>(new Set());

  // Register the streaming callback
  React.useEffect(() => {
    registerManuscriptCallback((chunk, cardId) => {
      if (!startedCards.current.has(cardId)) {
        startedCards.current.add(cardId);
        // Resolve the page title for the ghost banner
        const card = useAgentStore.getState().pageCards.find(c => c.id === cardId);
        setGhostPageTitle(card?.title || '');
        setIsGhostWriting(true);
        requestAnimationFrame(() => {
          ghostRef.current?.append(chunk);
        });
      } else {
        ghostRef.current?.append(chunk);
      }
    });
    return () => registerManuscriptCallback(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When streaming finishes → save to per-page content, switch to editor
  React.useEffect(() => {
    const stillGenerating = pageCards.some(c => c.status === 'generating');
    if (!stillGenerating && isGhostWriting) {
      const timer = setTimeout(() => {
        const finalText = ghostRef.current?.getText() || '';
        if (finalText && currentViewPageId) {
          setPageContents(prev => ({ ...prev, [currentViewPageId]: finalText }));
        }
        setIsGhostWriting(false);
        setGhostPageTitle('');
      }, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCards, isGhostWriting]);

  // Sync approved page content from store into local pageContents
  React.useEffect(() => {
    pageCards.forEach(card => {
      if (card.status === 'approved' && card.content && !pageContents[card.id]) {
        setPageContents(prev => ({ ...prev, [card.id]: card.content! }));
      }
    });
  }, [pageCards]);

  // The content shown in the editor for the selected page
  const currentCard    = pageCards.find(c => c.id === currentViewPageId);
  const currentContent = currentViewPageId ? (pageContents[currentViewPageId] || BLANK_PAGE) : BLANK_PAGE;

  const handleContentChange = (val: string) => {
    if (currentViewPageId) {
      setPageContents(prev => ({ ...prev, [currentViewPageId]: val }));
    }
  };

  // Save to library WITHOUT navigating away
  const handleSave = () => {
    const approvedCards = pageCards.filter(c => c.status === 'approved');
    if (approvedCards.length === 0) return;
    const bookTitle = pageCards[0]?.title || 'Untitled Ebook';
    const finalBook: EBook = {
      id: draftId,
      title: bookTitle,
      author: currentUser?.name || 'Author',
      description: pageCards[2]?.summary || 'Authored with Studio-Grade AI Precision',
      price: 999,
      coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
      genre: 'Literature',
      sellerId: currentUser?.id || 'guest',
      publicationDate: new Date().toISOString().split('T')[0],
      pages: approvedCards.map(c => ({
        id: c.id,
        title: c.title,
        content: pageContents[c.id] || c.content || '',
        pageNumber: c.pageNumber
      })),
      isDraft: true
    };
    addCreatedBook(finalBook);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 4000);
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
          {/* Page navigation label */}
          {currentCard && !isGhostWriting && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                Page {currentCard.pageNumber}
              </span>
              <div className="w-px h-3 bg-zinc-800" />
              <span className="text-[10px] font-bold text-zinc-400 max-w-[160px] truncate">
                {currentCard.title}
              </span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              isGhostWriting ? "bg-blue-500 animate-ping" : "bg-emerald-500 animate-pulse"
            )} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {isGhostWriting ? 'Ghost Writing' : 'Neural Link'}
            </span>
          </div>

          <Button
            variant="outline" size="sm"
            onClick={handleExport}
            className="h-8 px-4 rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 hover:border-zinc-700 transition-all"
          >
            Publish Draft
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider"
          >
            Exit
          </Button>
          <div className="w-7 h-7 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
            {currentUser?.profileImageUrl
              ? <img src={currentUser.profileImageUrl} className="w-full h-full object-cover" />
              : <span className="text-[10px] font-bold text-zinc-600">{(currentUser?.name || 'U')[0]}</span>
            }
          </div>
        </div>
      </header>

      {/* ── THREE-PANEL BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Panel 1: AI Chat */}
        <AgentChat />

        {/* Panel 2: Book Structure */}
        <BookStructurePanel onSave={handleSave} savedOk={savedOk} />

        {/* Panel 3: Novel Editor / Ghost Canvas */}
        <main className="flex-1 flex flex-col bg-[#0d0d0f] overflow-hidden relative">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-3 border-b border-zinc-800/60 bg-[#0d0d0f] shrink-0">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                isGhostWriting ? "bg-blue-500 animate-pulse scale-125" : "bg-emerald-500"
              )} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {isGhostWriting ? 'Ghost Writing...' : currentCard ? `Page ${currentCard.pageNumber}` : 'Manuscript'}
              </span>
            </div>
            <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
              {isGhostWriting
                ? <span className="text-blue-400/70">AI is writing · please wait</span>
                : <span>Type <span className="text-zinc-500">/</span> for formatting</span>
              }
            </div>
          </div>

          {/* Ghost canvas (streaming phase) */}
          {isGhostWriting && (
            <GhostWritingCanvas ref={ghostRef} pageTitle={ghostPageTitle} />
          )}

          {/* Novel Editor (editing phase) */}
          {!isGhostWriting && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {currentViewPageId ? (
                <div className="max-w-[700px] mx-auto py-16 px-8">
                  <NovelEditor
                    key={currentViewPageId}
                    title={currentCard?.title || ''}
                    onTitleChange={() => {}}
                    content={currentContent}
                    onContentChange={handleContentChange}
                    onTriggerAI={(p) => console.log('AI:', p)}
                    onTriggerImageGen={(p) => console.log('Img:', p)}
                  />
                </div>
              ) : (
                /* Empty state — no page selected */
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 h-full">
                  <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6">
                    <span className="text-3xl">📄</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-400 max-w-xs">
                    Ask the AI to plan your book, then click Proceed on a page to generate it.
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-3">
                    {pageCards.length === 0 ? 'No pages planned yet' : `${pageCards.length} pages planned — select one`}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EbookStudioPage;
