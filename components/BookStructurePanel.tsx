import React from 'react';
import { useAgentStore, PageCard } from '../stores/agentStore';
import { cn } from '../lib/utils';
import {
  IconCheck, IconSparkles, IconLoader2, IconChevronRight, IconBook, IconActivity
} from '../constants';

// Progress bar showing X of Y pages generated
const ProgressBar: React.FC<{ total: number; done: number }> = ({ total, done }) => {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
          {done} of {total} generated
        </span>
        <span className="text-[9px] font-bold text-zinc-600">{pct}%</span>
      </div>
      <div className="h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Compact page card for the structure panel
const StructureCard: React.FC<{
  card: PageCard;
  isActive: boolean;
  onSelect: () => void;
  onGenerate: () => void;
  isAnyGenerating: boolean;
}> = ({ card, isActive, onSelect, onGenerate, isAnyGenerating }) => {
  const isGenerating = card.status === 'generating';
  const isApproved   = card.status === 'approved';
  const isPlanned    = card.status === 'planned';

  return (
    <div
      onClick={isApproved ? onSelect : undefined}
      className={cn(
        "group relative rounded-xl border transition-all duration-200 overflow-hidden",
        isActive
          ? "border-zinc-600 bg-zinc-800/80 shadow-lg shadow-black/30"
          : isApproved
            ? "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70 cursor-pointer"
            : "border-zinc-800/60 bg-zinc-900/20",
        isGenerating && "border-blue-500/30 bg-blue-500/5"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-100 rounded-r" />
      )}

      <div className="px-3 py-2.5 flex items-center gap-2.5">
        {/* Page number badge — always visible on every card */}
        <div className={cn(
          "min-w-[28px] h-6 rounded flex items-center justify-center shrink-0 transition-all px-1",
          isApproved   ? "bg-emerald-500/15"  :
          isGenerating ? "bg-blue-500/10"      :
                         "bg-zinc-800/80"
        )}>
          {isApproved && <IconCheck className="w-3 h-3 text-emerald-400" />}
          {isGenerating && <IconLoader2 className="w-2.5 h-2.5 text-blue-400 animate-spin" />}
          {isPlanned && (
            <span className="text-[10px] font-black text-zinc-400">{card.pageNumber}</span>
          )}
          {/* Show page number for approved/generating too */}
          {!isPlanned && (
            <span className="text-[8px] font-bold text-zinc-600 ml-0.5">{card.pageNumber}</span>
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-zinc-200 truncate leading-tight">
            {card.title}
          </div>
          <div className="text-[9px] text-zinc-600 mt-0.5 font-medium">
            p.{card.pageNumber} · ~{card.estimatedWords}w
            {isApproved && (
              <span className="text-emerald-500 ml-1.5">• done</span>
            )}
            {isGenerating && (
              <span className="text-blue-400 ml-1.5">• writing...</span>
            )}
          </div>
        </div>

        {/* Quick-write arrow — shows title in tooltip */}
        {isPlanned && !isAnyGenerating && (
          <button
            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
            className="shrink-0 w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
            title={`Write: ${card.title}`}
          >
            <IconChevronRight className="w-3 h-3" />
          </button>
        )}

        {isApproved && isActive && (
          <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-100" />
        )}
      </div>

      {/* Planned hover: show title-aware write button */}
      {isPlanned && !isAnyGenerating && (
        <div className="px-3 pb-2.5 hidden group-hover:flex">
          <button
            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
            className="w-full flex items-center gap-1.5 h-7 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all px-2.5 overflow-hidden"
            title={`Write: ${card.title}`}
          >
            <IconSparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">Write · {card.title}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const BookStructurePanel: React.FC<{ onSave?: () => void; savedOk?: boolean }> = ({ onSave, savedOk }) => {
  const {
    pageCards,
    currentViewPageId,
    setCurrentViewPage,
    generatePage,
    generateAllPages,
    isLoading
  } = useAgentStore();

  const approvedCount  = pageCards.filter(c => c.status === 'approved').length;
  const plannedCount   = pageCards.filter(c => c.status === 'planned').length;
  const isAnyGenerating = pageCards.some(c => c.status === 'generating');

  if (pageCards.length === 0) {
    return (
      <div className="w-[240px] shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
        <div className="p-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <IconBook className="w-4 h-4 text-zinc-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600">
              Book Structure
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-40">
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
            <IconBook className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Chat with the AI to plan your book structure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[240px] shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBook className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
              Book Structure
            </span>
          </div>
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-wider">
            {pageCards.length} pages
          </span>
        </div>
        <ProgressBar total={pageCards.length} done={approvedCount} />
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {pageCards.map((card) => (
          <StructureCard
            key={card.id}
            card={card}
            isActive={card.id === currentViewPageId}
            onSelect={() => setCurrentViewPage(card.id)}
            onGenerate={() => generatePage(card.id)}
            isAnyGenerating={isAnyGenerating}
          />
        ))}
      </div>

      {/* Footer: Generate All + Save */}
      <div className="p-3 border-t border-zinc-800 shrink-0 space-y-2">
        {plannedCount > 0 && (
          <button
            onClick={generateAllPages}
            disabled={isAnyGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              isAnyGenerating
                ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800"
                : "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm hover:shadow-md active:scale-[0.98]"
            )}
          >
            {isAnyGenerating ? (
              <>
                <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <IconActivity className="w-3.5 h-3.5" />
                Generate All ({plannedCount})
              </>
            )}
          </button>
        )}

        {/* Save to Library — visible when at least 1 page is approved */}
        {approvedCount > 0 && onSave && (
          <button
            onClick={onSave}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
              savedOk
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.98]"
            )}
          >
            {savedOk ? (
              <>
                <IconCheck className="w-3.5 h-3.5" />
                Saved to Library!
              </>
            ) : (
              <>
                <IconBook className="w-3.5 h-3.5" />
                Save to Library ({approvedCount}/{pageCards.length})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
