import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
    IconChevronDown, IconSend, IconPlus, IconMic, IconX, IconSparkles
} from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { GenerateContentResponse } from '@google/genai';
import CoAuthor from './CoAuthor';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const { useLocation } = ReactRouterDOM as any;

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    isStreaming?: boolean;
}

const AIChatbot: React.FC = () => {
  const { geminiChat, initializeChat, isChatbotOpen, toggleChatbot } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (isChatbotOpen && !geminiChat) {
      initializeChat();
    }
  }, [isChatbotOpen, geminiChat, initializeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatbotOpen]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [userInput]);

  if (location.pathname === '/ebookstudio') return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || !geminiChat || isAiProcessing) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userInput };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = userInput;
    setUserInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; 
    setIsAiProcessing(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', isStreaming: true }]);

    try {
        const responseStream = await geminiChat.sendMessageStream({ message: currentInput });
        
        let fullText = '';
        for await (const chunk of responseStream) {
             const chunkText = (chunk as GenerateContentResponse).text;
             if (chunkText) {
                 fullText += chunkText;
                 setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
             }
        }
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));

    } catch (error) {
        console.error("Chat error", error);
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "Connection error. Please try again.", isStreaming: false } : m));
    } finally {
        setIsAiProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  return (
    <AnimatePresence>
        {isChatbotOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-8 right-8 z-[100] w-[90vw] md:w-[420px] h-[600px] max-h-[80vh] flex flex-col overflow-hidden rounded-2xl border border-border shadow-3xl bg-zinc-950/95 backdrop-blur-xl"
            >
                {/* --- HEADER --- */}
                <header className="flex items-center justify-between px-6 py-5 border-b border-border bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <CoAuthor size="sm" className="relative z-10" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-bold text-zinc-100 tracking-tight">Studio Intelligence</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Online • v2.0</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleChatbot}
                        className="p-2 hover:bg-zinc-800 rounded-md transition-all text-zinc-500 hover:text-zinc-100"
                    >
                        <IconChevronDown className="w-4 h-4"/>
                    </button>
                </header>
                
                {/* --- MESSAGES --- */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8 bg-zinc-950">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-6 opacity-40">
                            <IconSparkles className="w-8 h-8 text-zinc-800" />
                            <p className="text-sm font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">
                                Ready to assist with your <br /> publication manifest.
                            </p>
                        </div>
                    )}
                    <div className="space-y-10">
                        {messages.map(msg => (
                            <div key={msg.id} className="animate-fade-in">
                                <div className={cn(
                                    "flex gap-4 items-start",
                                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                )}>
                                    <div className="flex-shrink-0 mt-1">
                                         {msg.role === 'ai' ? <CoAuthor size="xs" /> : (
                                             <div className="w-6 h-6 rounded bg-zinc-800 border border-border flex items-center justify-center text-[10px] font-bold text-zinc-500">U</div>
                                         )}
                                    </div>
                                    <div className={cn(
                                        "flex-1 max-w-[85%] space-y-2",
                                        msg.role === 'user' ? 'text-right' : 'text-left'
                                    )}>
                                        <div className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest",
                                            msg.role === 'user' ? 'text-zinc-600' : 'text-zinc-500'
                                        )}>
                                            {msg.role === 'user' ? 'User Intent' : 'Intelligence Response'}
                                        </div>
                                        <div className={cn(
                                            "text-sm leading-relaxed font-medium whitespace-pre-wrap p-4 rounded-xl",
                                            msg.role === 'user' ? 'bg-zinc-900 text-zinc-100' : 'bg-transparent text-zinc-400'
                                        )}>
                                            {msg.text}
                                            {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1.5 bg-zinc-700 animate-pulse align-middle rounded-sm"></span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={messagesEndRef} />
                </div>

                {/* --- INPUT AREA --- */}
                <div className="p-6 bg-zinc-900/50 border-t border-border">
                    <div className="flex items-end gap-4 bg-zinc-950 border border-border rounded-xl p-3 focus-within:border-zinc-700 transition-all">
                        <textarea 
                            ref={textareaRef}
                            className="flex-grow bg-transparent text-zinc-100 text-sm font-medium placeholder-zinc-700 resize-none focus:outline-none max-h-32 custom-scrollbar py-2 px-1"
                            placeholder="Type a message..."
                            rows={1}
                            value={userInput}
                            onKeyDown={handleKeyDown}
                            onChange={e => setUserInput(e.target.value)}
                            disabled={isAiProcessing}
                            style={{ minHeight: '24px' }}
                        />
                        <button 
                            onClick={(e) => handleSendMessage(e)}
                            disabled={isAiProcessing || !userInput.trim()} 
                            className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center hover:bg-white active:scale-95 transition-all disabled:opacity-30 flex-shrink-0 shadow-lg"
                        >
                            <IconSend className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-center mt-4">
                         <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-700">Studio Intelligence Manifest v2.0</p>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default AIChatbot;
