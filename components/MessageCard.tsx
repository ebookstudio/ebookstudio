import React from 'react';
import { PageCard, useAgentStore } from '../stores/agentStore';
import { cn } from '../lib/utils';
import { 
  IconCheck, IconSparkles, IconEdit, IconRefresh, IconClock, IconLoader2 
} from '../constants';

export function MessageCard({ card }: { card: PageCard }) {
  const { generatePage, approvePage, regeneratePage, updatePageCard } = useAgentStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(card.content || '');

  const handleSave = () => {
    updatePageCard(card.id, { content: editContent });
    setIsEditing(false);
  };

  return (
    <div className={cn(
      "border rounded-2xl p-6 my-4 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-right-4",
      card.status === 'approved' ? "bg-zinc-900/50 border-emerald-500/30" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl",
            card.status === 'planned' && "bg-zinc-800 text-zinc-400",
            card.status === 'generating' && "bg-blue-500/20 text-blue-400",
            card.status === 'ready' && "bg-emerald-500/20 text-emerald-400",
            card.status === 'approved' && "bg-emerald-500 text-zinc-950"
          )}>
            {card.status === 'planned' && <IconClock className="w-5 h-5" />}
            {card.status === 'generating' && <IconLoader2 className="w-5 h-5 animate-spin" />}
            {card.status === 'ready' && <IconCheck className="w-5 h-5" />}
            {card.status === 'approved' && <IconCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Page {card.pageNumber}</div>
            <h3 className="font-bold text-zinc-100">{card.title}</h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{card.estimatedWords} words estimated</div>
          <div className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1",
            card.status === 'planned' && "bg-zinc-800 text-zinc-400",
            card.status === 'generating' && "bg-blue-500/20 text-blue-400",
            card.status === 'ready' && "bg-emerald-500/20 text-emerald-400",
            card.status === 'approved' && "bg-emerald-500/20 text-emerald-400"
          )}>
            {card.status}
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-zinc-400 italic">
        {card.summary}
      </div>
      
      {card.content && (
        <div className="relative group">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-96 bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-200 font-serif leading-relaxed focus:outline-none focus:ring-1 ring-emerald-500"
            />
          ) : (
            <div className="prose prose-invert prose-sm max-h-96 overflow-y-auto mb-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 font-serif leading-relaxed whitespace-pre-wrap text-zinc-300">
              {card.content}
            </div>
          )}
          
          {card.status === 'ready' && !isEditing && (
            <button 
              onClick={() => { setEditContent(card.content || ''); setIsEditing(true); }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-zinc-100"
            >
              <IconEdit className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      <div className="flex gap-3">
        {card.status === 'planned' && (
          <button 
            onClick={() => generatePage(card.id)} 
            className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
          >
            <IconSparkles className="w-4 h-4" />
            Generate Page
          </button>
        )}
        
        {card.status === 'generating' && (
          <button disabled className="flex-1 bg-zinc-800 text-zinc-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            <IconLoader2 className="w-4 h-4 animate-spin" />
            AI is writing...
          </button>
        )}

        {(card.status === 'ready') && (
          <>
            {isEditing ? (
              <button 
                onClick={handleSave} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
              >
                Save Changes
              </button>
            ) : (
              <>
                <button 
                  onClick={() => approvePage(card.id)} 
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <IconCheck className="w-4 h-4" />
                  Approve & Continue
                </button>
                <button 
                  onClick={() => regeneratePage(card.id, "Please try a different tone.")} 
                  className="flex-1 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <IconRefresh className="w-4 h-4" />
                  Retry
                </button>
              </>
            )}
          </>
        )}

        {card.status === 'approved' && (
          <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            <IconCheck className="w-4 h-4" />
            Approved
          </div>
        )}
      </div>
    </div>
  );
}
