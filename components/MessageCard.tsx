import React from 'react';
import { PageCard, useAgentStore } from '../stores/agentStore';
import { cn } from '../lib/utils';
import { 
  IconCheck, IconSparkles, IconEdit, IconRefresh, IconClock, IconLoader2, IconChevronRight
} from '../constants';

export const MessageCard: React.FC<{ card: PageCard }> = ({ card }) => {
  const { generatePage, approvePage, regeneratePage, updatePageCard } = useAgentStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(card.content || '');

  const handleSave = () => {
    updatePageCard(card.id, { content: editContent });
    setIsEditing(false);
  };

  const statusConfig = {
    planned:    { dot: 'bg-zinc-600',    label: 'Planned',     labelClass: 'text-zinc-500 bg-zinc-900 border-zinc-800' },
    generating: { dot: 'bg-blue-500 animate-pulse', label: 'Writing...', labelClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    ready:      { dot: 'bg-emerald-500', label: 'Ready',       labelClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    approved:   { dot: 'bg-emerald-500', label: 'Approved',    labelClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  }[card.status];

  return (
    <div className={cn(
      "w-full rounded-xl border transition-all duration-300",
      card.status === 'approved'
        ? "bg-zinc-900/40 border-emerald-500/20"
        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
    )}>
      {/* ── Card Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60">
        {/* Page badge */}
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600 shrink-0">
          Pg {card.pageNumber}
        </div>
        <div className="w-px h-3 bg-zinc-800 shrink-0" />
        {/* Title */}
        <h3 className="flex-1 text-[11px] font-bold text-zinc-200 leading-snug truncate">
          {card.title}
        </h3>
        {/* Status pill */}
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0",
          statusConfig.labelClass
        )}>
          <div className={cn("w-1 h-1 rounded-full", statusConfig.dot)} />
          {statusConfig.label}
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[11px] text-zinc-500 leading-relaxed">{card.summary}</p>
        <div className="mt-1.5 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
          ~{card.estimatedWords} words
        </div>
      </div>

      {/* ── Live streaming content preview ── */}
      {card.content && card.status !== 'approved' && (
        <div className="mx-4 mb-3 relative group">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-40 bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-[11px] text-zinc-300 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
            />
          ) : (
            <div className="max-h-36 overflow-y-auto p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/60 text-[11px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {card.content}
              {card.status === 'generating' && (
                <span className="inline-block w-1.5 h-3 bg-blue-400 ml-0.5 animate-pulse align-middle rounded-sm" />
              )}
            </div>
          )}
          {card.status === 'ready' && !isEditing && (
            <button
              onClick={() => { setEditContent(card.content || ''); setIsEditing(true); }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
            >
              <IconEdit className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Edit</span>
            </button>
          )}
        </div>
      )}

      {/* ── Approved state ── */}
      {card.status === 'approved' && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2">
          <IconCheck className="w-3 h-3 shrink-0" />
          Written to manuscript
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="px-4 pb-4 flex gap-2">

        {/* PLANNED: Show compact Proceed button */}
        {card.status === 'planned' && (
          <button
            onClick={() => generatePage(card.id)}
            className="flex-1 flex items-center justify-center gap-2 h-9 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            Proceed
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* GENERATING: Disabled state */}
        {card.status === 'generating' && (
          <div className="flex-1 flex items-center justify-center gap-2 h-9 bg-zinc-800/60 text-zinc-500 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-zinc-800">
            <IconLoader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            Writing to manuscript...
          </div>
        )}

        {/* READY: Approve or retry */}
        {card.status === 'ready' && (
          <>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                Save Changes
              </button>
            ) : (
              <>
                <button
                  onClick={() => approvePage(card.id)}
                  className="flex-[2] flex items-center justify-center gap-2 h-9 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <IconCheck className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => regeneratePage(card.id, "Please try a different tone.")}
                  className="flex-1 h-9 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                  Retry
                </button>
              </>
            )}
          </>
        )}

        {/* APPROVED */}
        {card.status === 'approved' && (
          <div className="flex-1 flex items-center justify-center gap-2 h-9 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-lg text-[11px] font-black uppercase tracking-widest">
            <IconCheck className="w-3.5 h-3.5" />
            Approved
          </div>
        )}
      </div>
    </div>
  );
};
