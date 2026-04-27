import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useAgentStore } from '../stores/agentStore';
import { AgentChat } from '../components/AgentChat';
import { MessageCard } from '../components/MessageCard';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { IconActivity } from '../constants';

const { useNavigate } = ReactRouterDOM as any;

const EbookStudioPage: React.FC = () => {
  const { currentUser, addCreatedBook } = useAppContext();
  const navigate = useNavigate();
  const { pageCards, currentBook } = useAgentStore();
  const [draftId] = React.useState<string>(() => `draft-${Date.now()}`);

  const handleExport = () => {
      if (pageCards.length === 0) {
          alert("Please generate at least one page before exporting.");
          return;
      }
      
      const approvedCards = pageCards.filter(c => c.status === 'approved');
      if (approvedCards.length === 0) {
          const confirm = window.confirm("You have no approved pages. Do you want to export all generated pages instead?");
          if (!confirm) return;
      }

      const pagesToExport = approvedCards.length > 0 ? approvedCards : pageCards.filter(c => c.content);

      const finalBook: EBook = {
          id: draftId,
          title: pageCards[0]?.title || "Untitled Masterpiece",
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
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-6 z-30">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-500 flex items-center justify-center group-hover:border-zinc-100 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-zinc-500 group-hover:bg-zinc-100 transition-colors" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-zinc-100">EbookStudio</span>
                </div>
                <div className="w-px h-4 bg-zinc-800 mx-2" />
                <h1 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Production · $1M Edition</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Link Syncing</span>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')}
                    className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider"
                >
                    Exit
                </Button>
                <div className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {currentUser?.profileImageUrl ? (
                        <img src={currentUser.profileImageUrl} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-bold text-zinc-600">{(currentUser?.name || 'U')[0]}</span>
                    )}
                </div>
            </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* LEFT PANEL: CHAT */}
            <AgentChat />

            {/* RIGHT PANEL: MESSAGE CARDS */}
            <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative h-full">
                <div className="py-5 px-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <IconActivity className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-lg text-zinc-100 tracking-tight">
                            Book Architecture
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                         <Button 
                            variant="outline"
                            onClick={handleExport} 
                            className="h-10 px-6 rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-xl"
                        >
                            Publish Draft
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 bg-zinc-950">
                    <div className="max-w-3xl mx-auto py-12 px-8">
                        {pageCards.length === 0 ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
                                    <IconActivity className="w-8 h-8 text-zinc-700" />
                                </div>
                                <h4 className="text-xl font-bold text-zinc-400 mb-2">No pages planned yet</h4>
                                <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                                    Start chatting with the AI on the left to outline your book and plan your first pages.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <div className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        Timeline · {pageCards.length} Pages Planned
                                    </div>
                                    <div className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        {pageCards.filter(c => c.status === 'approved').length} Approved
                                    </div>
                                </div>
                                
                                {pageCards.map((card) => (
                                    <MessageCard key={card.id} card={card} />
                                ))}

                                {/* Future Slot Placeholder */}
                                <div className="border-2 border-dashed border-zinc-900 rounded-2xl h-32 flex items-center justify-center text-zinc-800">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Next page will be planned automatically</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>
    </div>
  );
};

export default EbookStudioPage;
