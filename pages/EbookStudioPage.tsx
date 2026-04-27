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

// Typewriter helper — streams text char by char into a React state setter
function typewriterAppend(
  fullText: string,
  setter: React.Dispatch<React.SetStateAction<string>>,
  speedMs = 18
) {
  let i = 0;
  const interval = setInterval(() => {
    if (i < fullText.length) {
      setter(prev => prev + fullText[i]);
      i++;
    } else {
      clearInterval(interval);
    }
  }, speedMs);
  return interval;
}

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

const EbookStudioPage: React.FC = () => {
  const { currentUser, addCreatedBook } = useAppContext();
  const navigate = useNavigate();
  const { pageCards, currentBook, resetStore } = useAgentStore();
  const [draftId] = React.useState<string>(() => `draft-${Date.now()}`);

  // Clear stale page cards and chat on every Studio session start
  React.useEffect(() => {
    resetStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Right panel Novel Editor state
  const [editorTitle, setEditorTitle] = React.useState('My Book');
  const [editorContent, setEditorContent] = React.useState(INTRO_TEMPLATE);

  // When a page gets approved, typewrite its content into the editor
  const approvedPagesRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    const newlyApproved = pageCards.filter(
      c => c.status === 'approved' && c.content && !approvedPagesRef.current.has(c.id)
    );
    if (newlyApproved.length > 0) {
      newlyApproved.forEach(c => {
        approvedPagesRef.current.add(c.id);
        // Prepend the section header then stream the body
        const header = `\n\n## ${c.title}\n\n`;
        setEditorContent(prev => prev + header);
        // Stream the body with a typewriter animation
        typewriterAppend(c.content || '', setEditorContent, 12);
      });
    }
  }, [pageCards]);

  const handleExport = () => {
    const approvedCards = pageCards.filter(c => c.status === 'approved');
    const pagesToExport = approvedCards.length > 0 ? approvedCards : pageCards.filter(c => c.content);

    if (pagesToExport.length === 0) {
      alert("Please generate and approve at least one page before publishing.");
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
        content: c.content || '',
        pageNumber: c.pageNumber
      })),
      isDraft: false
    };
    addCreatedBook(finalBook);
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 overflow-hidden font-sans text-zinc-100 selection:bg-zinc-100/10">
        
        {/* --- GLOBAL STUDIO HEADER --- */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-6 z-30">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-500 flex items-center justify-center group-hover:border-zinc-100 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-zinc-100 transition-colors" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-zinc-100">EbookStudio</span>
                </div>
                <div className="w-px h-4 bg-zinc-800 mx-2" />
                <h1 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Production · $1M Edition</h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Link Syncing</span>
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

            {/* LEFT PANEL: AI CHAT + MESSAGE CARDS */}
            <AgentChat />

            {/* RIGHT PANEL: NOVEL EDITOR */}
            <main className="flex-1 flex flex-col bg-[#0d0d0f] overflow-hidden relative h-full">
                {/* Editor top bar */}
                <div className="flex items-center justify-between px-8 py-3 border-b border-zinc-800/60 bg-[#0d0d0f] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Manuscript</span>
                        {pageCards.filter(c => c.status === 'approved').length > 0 && (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                {pageCards.filter(c => c.status === 'approved').length} pages approved
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                        Type <span className="text-zinc-500">/</span> for block options
                    </div>
                </div>

                {/* Actual Novel Editor canvas */}
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
            </main>
        </div>
    </div>
  );
};

export default EbookStudioPage;
