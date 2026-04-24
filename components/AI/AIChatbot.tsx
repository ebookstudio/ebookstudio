import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
    IconChevronDown, IconSend
} from '../../constants';
import * as ReactRouterDOM from 'react-router-dom';
import CoAuthor from '../CoAuthor';
import { useChat } from 'ai/react';

const { useLocation } = ReactRouterDOM as any;

const AIChatbot: React.FC = () => {
  const { isChatbotOpen, toggleChatbot, currentUser } = useAppContext();
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    body: {
      userId: currentUser?.id,
      systemPrompt: "You are a professional Co-Author assistant. Help the author write their book with professional markdown."
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatbotOpen]);

  // Hide global chatbot on Studio page to avoid UI overlap with Studio Agent
  if (location.pathname === '/ebook-studio') {
      return null;
  }

  if (!isChatbotOpen) return null;

  return (
    <div className="fixed bottom-0 right-4 sm:right-8 z-[60] flex flex-col items-end">
        {/* === GLOBAL OVERLAY WINDOW === */}
        <div className="w-[90vw] md:w-[400px] h-[500px] md:h-[600px] max-h-[80vh] bg-[#09090b]/95 backdrop-blur-2xl rounded-t-3xl border-t border-x border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-up ring-1 ring-white/10">
             <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                    <CoAuthor className="w-10 h-10 rounded-lg border border-white/20 bg-[#222] shadow-sm" />
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">QUICK ASSIST</h2>
                    </div>
                </div>
                <button 
                    onClick={toggleChatbot}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                    <IconChevronDown className="w-5 h-5"/>
                </button>
            </header>
            
             <div className="flex-grow overflow-y-auto custom-scrollbar p-0 bg-[#09090b]">
                {messages.length === 0 && (
                    <div className="text-center text-neutral-500 text-sm mt-10 px-6">
                        <p>How can I help you navigate or create today?</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={msg.id} className="animate-fade-in border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                         <div className="px-5 py-6 flex gap-4 items-start">
                            {msg.role === 'assistant' && (
                                <CoAuthor className="w-8 h-8 rounded-lg flex-shrink-0 mt-1 border border-white/20 bg-[#222]" isActive={false} />
                            )}
                            <div className={`flex-1 space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white uppercase tracking-wide">Studio AI</span>
                                    </div>
                                )}
                                <div className={`text-sm leading-7 font-sans whitespace-pre-wrap ${msg.role === 'user' ? 'text-neutral-200 font-medium' : 'text-neutral-300'}`}>
                                    {msg.content}
                                    {isLoading && idx === messages.length - 1 && msg.role === 'assistant' && <span className="inline-block w-1.5 h-4 ml-1 bg-google-blue animate-pulse align-middle"></span>}
                                </div>
                            </div>
                         </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
             </div>

             <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                <input 
                    className="flex-grow bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-google-blue/50 transition-colors placeholder-neutral-600"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="p-3 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    <IconSend className="w-4 h-4" />
                </button>
             </form>
        </div>
    </div>
  );
};

export default AIChatbot;