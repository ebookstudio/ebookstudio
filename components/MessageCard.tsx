import React from 'react';
import { PageCard, useAgentStore } from '../stores/agentStore';
import { cn } from '../lib/utils';
import {
  IconCheck, IconSparkles, IconLoader2, IconChevronRight
} from '../constants';

export const MessageCard: React.FC<{ card: PageCard }> = ({ card }) => {
  const { generatePage } = useAgentStore();

  const isGenerating = card.status === 'generating';
  const isApproved   = card.status === 'approved';
  const isPlanned    = card.status === 'planned';

  return (
    <div className={cn(
      "w-full rounded-xl border transition-all duration-300",
      isApproved
        ? "bg-zinc-900/40 border-emerald-500/20"
        : isGenerating
          ? "bg-zinc-900 border-blue-500/30"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
    )}>
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60">
        {/* Status icon */}
        <div className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
          isApproved   ? "bg-emerald-500/20"                      : 
          isGenerating ? "bg-blue-500/10"                         : 
                         "bg-zinc-800"
        )}>
          {isApproved   && <IconCheck    className="w-3.5 h-3.5 text-emerald-400" />}
          {isGenerating && <IconLoader2  className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
          {isPlanned    && <IconSparkles className="w-3.5 h-3.5 text-zinc-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
            Page {card.pageNumber}
          </div>
          <h3 className="text-[11px] font-bold text-zinc-200 leading-snug truncate">
            {card.title}
          </h3>
        </div>

        {/* Status pill */}
        <div className={cn(
          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
          isApproved   ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
          isGenerating ? "text-blue-400   bg-blue-500/10   border-blue-500/20"      :
                         "text-zinc-500   bg-zinc-900      border-zinc-800"
        )}>
          {isApproved ? "Done" : isGenerating ? "Writing..." : "Planned"}
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="px-4 pt-2.5 pb-3">
        <p className="text-[11px] text-zinc-500 leading-relaxed">{card.summary}</p>
        <div className="mt-1 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
          ~{card.estimatedWords} words
        </div>
      </div>

      {/* ── Status body ── */}
      {isGenerating && (
        <div className="mx-4 mb-3 flex items-center gap-3 bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2.5">
          <IconLoader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Ghost writing in manuscript</div>
            <div className="text-[9px] text-zinc-600 mt-0.5">Watch the right panel as the AI writes live...</div>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2">
          <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Written to manuscript
          </div>
        </div>
      )}

      {/* ── Action ── */}
      <div className="px-4 pb-4">
        {isPlanned && (
          <button
            onClick={() => generatePage(card.id)}
            className="w-full flex items-center justify-center gap-2 h-9 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            Proceed
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {isGenerating && (
          <div className="w-full flex items-center justify-center gap-2 h-9 bg-zinc-800/60 border border-zinc-800 text-zinc-500 rounded-lg text-[11px] font-bold uppercase tracking-widest cursor-not-allowed">
            <IconLoader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            AI is writing...
          </div>
        )}

        {isApproved && (
          <div className="w-full flex items-center justify-center gap-2 h-9 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-lg text-[11px] font-black uppercase tracking-widest">
            <IconCheck className="w-3.5 h-3.5" />
            Approved
          </div>
        )}
      </div>
    </div>
  );
};
