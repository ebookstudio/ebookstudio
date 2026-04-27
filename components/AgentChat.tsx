import React, { useEffect, useRef, useState } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { cn } from '../lib/utils';
import { 
  IconSend, IconBrain, IconPlus, IconMic, IconLoader2 
} from '../constants';

export function AgentChat() {
  const { addPageCard } = useAgentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input?.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');
      
      const decoder = new TextDecoder();
      let aiMessage: any = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: '', 
        toolInvocations: [] 
      };
      
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            if (line.startsWith('0:')) {
              const text = JSON.parse(line.slice(2));
              aiMessage.content += text;
            } else if (line.startsWith('9:')) {
              const toolCall = JSON.parse(line.slice(2));
              if (toolCall.toolName === 'plan_page') {
                 addPageCard(toolCall.args);
                 aiMessage.toolInvocations.push({
                   toolCallId: toolCall.callId || Math.random().toString(),
                   state: 'result',
                   toolName: 'plan_page',
                   args: toolCall.args,
                   result: toolCall.args
                 });
              }
            }
          } catch (e) {
            console.error('Error parsing stream chunk', e);
          }
        }
        setMessages(prev => [...prev.slice(0, -1), { ...aiMessage }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: "I encountered a neural link interruption. Let me reset my context, please try asking that again." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 w-full lg:w-[420px] shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
            <IconBrain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 tracking-tight">Co-Author Agent</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active · $1M Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-zinc-700 flex items-center justify-center mb-4">
              <IconBrain className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Start a conversation to begin your book.</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">Neural Link Ready</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn(
            "flex flex-col animate-in fade-in slide-in-from-bottom-2",
            m.role === 'user' ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-zinc-100 text-zinc-950 rounded-br-sm font-medium" 
                : "bg-zinc-900 text-zinc-200 rounded-bl-sm border border-zinc-800"
            )}>
              {m.content}
              
              {m.toolInvocations?.map((invoc: any) => (
                <div key={invoc.toolCallId} className="mt-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500 italic">
                  {invoc.toolName === 'plan_page' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Architecting Page {invoc.args.pageNumber}: {invoc.args.title}...
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mt-1 px-1">
              {m.role === 'user' ? 'You' : 'Agent'}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-500 px-1">
            <IconLoader2 className="w-3 h-3 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Agent is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-zinc-950 border-t border-zinc-800 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="relative group">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your book idea..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4 pr-14 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-all resize-none h-24"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <button
            type="submit"
            disabled={!input?.trim() || isLoading}
            className={cn(
              "absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              input?.trim() && !isLoading 
                ? "bg-zinc-100 text-zinc-950 shadow-lg shadow-white/5" 
                : "bg-zinc-800 text-zinc-600"
            )}
          >
            {isLoading ? <IconLoader2 className="w-5 h-5 animate-spin" /> : <IconSend className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex gap-2">
            <button type="button" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <IconPlus className="w-4 h-4" />
            </button>
            <button type="button" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <IconMic className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            Enter to Send · Shift+Enter for New Line
          </div>
        </div>
      </form>
    </div>
  );
}
