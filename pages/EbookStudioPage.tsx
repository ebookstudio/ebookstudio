import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook, EBookPage, UserType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import {
    IconSparkles, IconSend, IconPlus, IconArrowLeft,
    IconX, IconMic, IconStop, IconCheck, IconBrain, IconActivity
} from '../constants';
import {
    createStudioSession, generateBookCover, transcribeAudio
} from '../services/aiService';
import { razorpayService } from '../services/razorpayService';
import { Seller } from '../types';
import CoAuthor from '../components/CoAuthor';
import NovelEditor from '../components/NovelEditor';
import CinematicWriterOverlay from '../components/CinematicWriterOverlay';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const { useNavigate, useLocation } = ReactRouterDOM as any;

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    text: string;
    isStreaming?: boolean;
    isToolUse?: boolean;
    attachments?: string[];
}

const EbookStudioPage: React.FC = () => {
  const { currentUser, userType, addCreatedBook } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || '';

  // Layout State
  const [leftTab, setLeftTab] = useState<'chat' | 'outline'>('chat');
  const [isCinematicMode, setIsCinematicMode] = useState(false);

  // Project State
  const [pages, setPages] = useState<EBookPage[]>([
    { id: '1', title: 'Chapter 1: The Beginning', content: '', pageNumber: 1 }
  ]);
  const [activePageId, setActivePageId] = useState<string>('1');
  const activePage = useMemo(() => pages.find(p => p.id === activePageId) || pages[0], [pages, activePageId]);

  // AI & Audio State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Auto-Pilot State
  const [autoPilotMode, setAutoPilotMode] = useState<'idle' | 'planning' | 'writing_sequence'>('idle');
  const [writeQueue, setWriteQueue] = useState<string[]>([]);

  // Multimodal State
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Subscription Check for Sellers
    if (userType === UserType.SELLER) {
        const seller = currentUser as Seller;
        if (!razorpayService.checkSubscriptionStatus(seller.subscription)) {
            const confirm = window.confirm("Agentic AI Studio requires an active Studio Pro subscription. Would you like to upgrade now?");
            if (confirm) {
                navigate('/dashboard/pricing');
            } else {
                navigate('/dashboard');
            }
        }
    }

    if (!chatSessionRef.current) {
        const initialContext = `You are the Co-Author AI assistant for EbookStudio.
        Current Author: ${currentUser?.name || 'Writer'}.
        Active Chapter: "${activePage.title}".
        Goal: Helping the author write a beautiful, professional e-book with clarity and precision.`;

        const session = createStudioSession(initialContext);
        if (session) {
            chatSessionRef.current = session;
            setMessages([{ id: 'sys-init', role: 'ai', text: "Welcome to the Studio. I'm your Co-Author, ready to help you draft your masterpiece." }]);
            if (initialPrompt) {
                setTimeout(() => handleSendMessage(undefined, initialPrompt), 500);
            }
        }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, leftTab]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  useEffect(() => {
      if (!isBusy) {
          if (autoPilotMode === 'planning') {
              if (pages.length > 1) {
                  const incompleteIds = pages.map(p => p.id);
                  setWriteQueue(incompleteIds);
                  setAutoPilotMode('writing_sequence');
                  triggerNextWrite(incompleteIds);
              } else {
                  setAutoPilotMode('idle');
              }
          } else if (autoPilotMode === 'writing_sequence') {
              if (writeQueue.length > 0) {
                  triggerNextWrite(writeQueue);
              } else {
                  setAutoPilotMode('idle');
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: "Composition complete. Your draft is ready for review." }]);
              }
          }
      }
  }, [isBusy, autoPilotMode, pages]);

  const triggerNextWrite = (currentQueue: string[]) => {
      if (currentQueue.length === 0) return;
      const nextId = currentQueue[0];
      const remaining = currentQueue.slice(1);
      setWriteQueue(remaining);
      setActivePageId(nextId);

      const targetPage = pages.find(p => p.id === nextId);
      if (targetPage) {
          setTimeout(() => {
              const prompt = `Write Chapter ${targetPage.pageNumber}: "${targetPage.title}". Please generate a comprehensive, high-fidelity draft.`;
              handleSendMessage(undefined, prompt);
          }, 1000);
      }
  };

  const fileToPart = async (file: File): Promise<any> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              resolve({ inlineData: { data: base64String, mimeType: file.type } });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const newFiles = Array.from(e.target.files);
          setAttachments(prev => [...prev, ...newFiles]);
          const newPreviews = newFiles.map((file: File) => URL.createObjectURL(file as Blob));
          setAttachmentPreviews(prev => [...prev, ...newPreviews]);
      }
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
      setAttachmentPreviews((prev: string[]) => {
          if (prev[index]) {
              URL.revokeObjectURL(prev[index]);
          }
          return prev.filter((_, i) => i !== index);
      });
  };

  const executeStudioTool = async (name: string, args: any): Promise<string> => {
      try {
          if (name === 'write_content') {
              setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content: args.content } : p));
              return "Draft updated.";
          }
          if (name === 'generate_image') {
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: `Generating visual asset: ${args.prompt}...` }]);
              const result = await generateBookCover(args.prompt, "Cinematic", activePage.title, currentUser?.name);
              if ('imageBytes' in result) {
                  const md = `\n\n![${args.prompt}](data:image/jpeg;base64,${result.imageBytes})\n\n`;
                  setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content: p.content + md } : p));
                  return "Visual asset integrated.";
              }
              return "Generation failed.";
          }
          if (name === 'propose_blueprint') {
              const newPages: EBookPage[] = args.outline.map((chapter: any, idx: number) => ({
                  id: Date.now().toString() + idx,
                  title: chapter.title,
                  content: `> **Summary**: ${chapter.summary}\n\n`,
                  pageNumber: idx + 1
              }));
              setPages(newPages);
              if (newPages.length > 0) setActivePageId(newPages[0].id);
              return `Outline established. Title: "${args.title}".`;
          }
          return "Instruction processed.";
      } catch (error: any) {
          return `Error: ${error.message}`;
      }
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideInput?: string) => {
      const text = overrideInput || input;
      if(!text.trim() && attachments.length === 0) return;

      const currentAttachments = [...attachments];
      const currentPreviews = [...attachmentPreviews];

      setInput('');
      setAttachments([]);
      setAttachmentPreviews([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

      if (!autoPilotMode || autoPilotMode === 'idle') {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, attachments: currentPreviews }]);
      }
      setIsBusy(true);

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', isStreaming: true }]);

      try {
          if (!chatSessionRef.current) throw new Error("Connection lost");
          const parts: (string | any)[] = [];
          if (text.trim()) parts.push({ text });
          for (const file of currentAttachments) {
              parts.push(await fileToPart(file));
          }

          const result = await chatSessionRef.current.sendMessageStream({ message: parts as any });
          let fullText = "";
          let finalFunctionCalls: any[] | undefined = undefined;

          for await (const chunk of result) {
              if (chunk.text) {
                  fullText += chunk.text;
                  setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
              }
              if (chunk?.functionCalls) finalFunctionCalls = chunk.functionCalls;
          }

          if (finalFunctionCalls && finalFunctionCalls.length > 0) {
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isToolUse: true, text: m.text + "\n\n*Synchronizing draft...*" } : m));
              const responses: any[] = [];
              for (const call of finalFunctionCalls) {
                  responses.push({ functionResponse: { name: call.name, response: { result: await executeStudioTool(call.name, call.args) } } });
              }
              const toolResult = await chatSessionRef.current.sendMessageStream({ message: responses });
              let toolOutputText = "";
              for await (const chunk of toolResult) {
                  if (chunk.text) {
                      toolOutputText += chunk.text;
                      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText + (fullText ? "\n\n" : "") + toolOutputText, isToolUse: false } : m));
                  }
              }
          }
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
      } catch (e) {
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "The studio encountered an interruption. Please retry.", isStreaming: false } : m));
      } finally {
          setIsBusy(false);
      }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            setIsBusy(true);
            try {
                const text = await transcribeAudio(base64, 'audio/webm');
                if (text) setInput(prev => prev + (prev ? " " : "") + text);
            } catch (err) {}
            setIsBusy(false);
        };
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsListening(true);
    } catch (err) { alert("Please allow microphone access."); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isListening) { mediaRecorderRef.current.stop(); setIsListening(false); } };

  const handleAutoWrite = () => {
      setIsCinematicMode(true);
      const needsOutline = pages.length <= 1 && pages[0].content.length < 200;
      if (needsOutline) {
          setAutoPilotMode('planning');
          handleSendMessage(undefined, `Assist me in drafting an outline for "${pages[0].title}".`);
      } else {
          const incompleteIds = pages.map(p => p.id);
          setWriteQueue(incompleteIds);
          setAutoPilotMode('writing_sequence');
          triggerNextWrite(incompleteIds);
      }
  };

  const handleExport = () => {
      addCreatedBook({
          id: `gen-${Date.now()}`,
          title: pages[0].title || "Untitled Masterpiece",
          author: currentUser?.name || 'Author',
          description: 'Authored with AI Precision',
          price: 0,
          coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
          genre: 'Draft',
          sellerId: currentUser?.id || 'guest',
          publicationDate: new Date().toISOString().split('T')[0],
          pages: pages
      });
      navigate('/dashboard');
  };

  const lastAiMessage = messages.slice().reverse().find(m => m.role === 'ai');

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-zinc-100/10 selection:text-zinc-100 font-sans relative z-[100]">
        
        <CinematicWriterOverlay 
            isOpen={isCinematicMode} 
            onClose={() => { setIsCinematicMode(false); setAutoPilotMode('idle'); setWriteQueue([]); }}
            content={lastAiMessage ? lastAiMessage.text : "Connecting to Co-Author..."}
            isStreaming={isBusy}
            chapterTitle={activePage.title}
        />

        {/* --- STUDIO HEADER --- */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
            <div className="flex items-center gap-6">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')} 
                    className="group h-9 px-3 text-zinc-500 hover:text-zinc-100 transition-colors"
                >
                    <IconArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" /> 
                    <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
                </Button>
                <Separator orientation="vertical" className="h-4 bg-zinc-800" />
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-zinc-100 rounded flex items-center justify-center">
                         <span className="text-zinc-950 font-black text-xs">E</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Studio Workspace</h1>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    onClick={handleAutoWrite}
                    disabled={isBusy || autoPilotMode !== 'idle'}
                    className="h-9 px-4 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest"
                >
                    {isBusy ? <IconSparkles className="w-3 h-3 animate-spin mr-2" /> : <IconBrain className="w-3 h-3 mr-2" />}
                    <span>{autoPilotMode !== 'idle' ? 'Composing...' : 'Auto-Draft'}</span>
                </Button>
                
                <Button 
                    onClick={handleExport} 
                    className="h-9 px-5 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    Save Draft
                </Button>
            </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative min-h-0">
            
            {/* --- PREMIUM STUDIO SIDEBAR (FIXED ARCHITECTURE) --- */}
            <aside className="hidden lg:flex fixed top-16 left-0 bottom-0 w-[380px] bg-zinc-950 border-r border-zinc-900/50 flex-col z-[40] shadow-[20px_0_60px_rgba(0,0,0,0.5)]">
                
                {/* Sidebar Header */}
                <div className="h-14 border-b border-zinc-900/50 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-xl shrink-0 z-20">
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-zinc-100 shadow-[0_0_12px_rgba(255,255,255,0.6)] animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-100">Intelligence Unit</span>
                    </div>
                    <Badge variant="outline" className="bg-zinc-900/50 border-zinc-800 text-zinc-500 text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5">v4.0.2</Badge>
                </div>

                {/* Main Sidebar Content Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col bg-[#020202]">
                    
                    {/* Tab Switcher */}
                    <div className="p-4 border-b border-zinc-900/30 flex justify-center shrink-0 bg-zinc-950/50 z-20">
                        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/50 w-full max-w-[280px]">
                            <button 
                                onClick={() => setLeftTab('chat')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                    leftTab === 'chat' ? "bg-zinc-100 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-zinc-600 hover:text-zinc-300"
                                )}
                            >
                                Co-Author
                            </button>
                            <button 
                                onClick={() => setLeftTab('outline')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                    leftTab === 'outline' ? "bg-zinc-100 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-zinc-600 hover:text-zinc-300"
                                )}
                            >
                                Blueprint
                            </button>
                        </div>
                    </div>
                    
                    {/* Content Logic */}
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        {leftTab === 'chat' && (
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Message History */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                                    <div className="p-6 space-y-10">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                                <div className="w-16 h-16 rounded-3xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800/50 mb-6 shadow-2xl">
                                                    <IconBrain className="w-8 h-8 text-zinc-600" />
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Neural Link Ready</p>
                                                <p className="text-[10px] text-zinc-600 max-w-[220px] leading-relaxed">Initiate conversation with your Co-Author to begin the architectural drafting process.</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, idx) => (
                                                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={cn(
                                                            "w-1 h-4 rounded-full",
                                                            msg.role === 'user' ? "bg-zinc-700" : "bg-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                                        )} />
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                                            {msg.role === 'user' ? 'Author' : 'Co-Author'}
                                                        </span>
                                                        {msg.role === 'ai' && msg.isStreaming && (
                                                            <div className="flex gap-1 items-center ml-2">
                                                                <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" />
                                                                <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce delay-75" />
                                                                <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce delay-150" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "text-[13px] leading-[1.7] font-medium selection:bg-zinc-100 selection:text-zinc-950",
                                                        msg.role === 'user' ? 'text-zinc-300 pl-4 border-l border-zinc-900' : 'text-zinc-100'
                                                    )}>
                                                        {msg.attachments?.map((src, i) => (
                                                            <div key={i} className="mb-6 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group relative cursor-zoom-in">
                                                                <img src={src} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        ))}
                                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                                        {msg.isToolUse && (
                                                            <div className="mt-6 flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                                                <div className="w-2 h-2 rounded-full bg-zinc-100 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 italic">Executing Architectural Integration...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} className="h-4" />
                                    </div>
                                </div>

                                {/* --- REDESIGNED PREMIUM INPUT (SCREENSHOT STYLE) --- */}
                                <div className="shrink-0 p-3 bg-[#010101] border-t border-zinc-900/40 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
                                    {attachmentPreviews.length > 0 && (
                                        <div className="flex gap-2.5 mb-3 overflow-x-auto pb-2 scrollbar-hide px-2">
                                            {attachmentPreviews.map((src, idx) => (
                                                <div key={idx} className="relative group shrink-0">
                                                    <img src={src} className="h-12 w-12 object-cover rounded-xl border border-zinc-800 shadow-2xl transition-all group-hover:border-zinc-500" />
                                                    <button 
                                                        onClick={() => removeAttachment(idx)} 
                                                        className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-zinc-950 rounded-full text-zinc-500 border border-zinc-800 hover:text-red-500 transition-all flex items-center justify-center shadow-2xl backdrop-blur-xl z-20"
                                                    >
                                                        <IconX className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className={cn(
                                        "bg-zinc-900/30 border border-zinc-800/60 rounded-[24px] px-4 py-2.5 transition-all duration-500 relative group flex flex-col gap-1.5",
                                        isBusy ? 'ring-1 ring-white/10 border-zinc-700 bg-zinc-900/50' : 'focus-within:border-zinc-700/80 focus-within:bg-zinc-900/40 shadow-inner'
                                    )}>
                                        <textarea
                                            ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                                            placeholder={isListening ? "Listening..." : "Type your message here..."}
                                            className="w-full bg-transparent border-none outline-none text-[13px] leading-relaxed py-0.5 min-h-[32px] max-h-32 resize-none font-medium placeholder:text-zinc-600 text-zinc-100 scrollbar-hide selection:bg-zinc-100 selection:text-zinc-950"
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                            disabled={isBusy}
                                        />

                                        <div className="flex items-center justify-between pt-0.5">
                                            <div className="flex items-center gap-0.5">
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()} 
                                                    className="w-7 h-7 rounded-full bg-transparent hover:bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all active:scale-90"
                                                    title="Attach Asset"
                                                >
                                                    <IconPlus className="w-3.5 h-3.5" />
                                                </button>
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,application/pdf" multiple />
                                                
                                                <div className="w-px h-3 bg-zinc-800/80 mx-1" />

                                                <button className="w-7 h-7 rounded-full bg-transparent hover:bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all active:scale-90">
                                                    <IconSparkles className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="w-px h-3 bg-zinc-800/80 mx-1" />

                                                <button className="w-7 h-7 rounded-full bg-transparent hover:bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all active:scale-90">
                                                    <IconBrain className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onMouseDown={startRecording} onMouseUp={stopRecording}
                                                    className={cn(
                                                        "w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90",
                                                        isListening ? 'bg-red-500/10 text-red-500' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                                                    )}
                                                    title="Voice Command"
                                                >
                                                    {isListening ? <IconStop className="w-3.5 h-3.5 animate-pulse" /> : <IconMic className="w-3.5 h-3.5" />}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleSendMessage()} 
                                                    disabled={isBusy || (!input.trim() && attachments.length === 0)}
                                                    className={cn(
                                                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90",
                                                        (input.trim() || attachments.length > 0) 
                                                            ? 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                                            : 'bg-zinc-800/50 text-zinc-700 opacity-20'
                                                    )}
                                                >
                                                    {isBusy ? <div className="w-3 h-3 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin"></div> : <IconSend className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-2.5 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Neural Sync Active</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 tabular-nums">
                                            {activePage.content.length.toLocaleString()} CHARS
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {leftTab === 'outline' && (
                             <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                 <div className="flex items-center justify-between mb-10 pl-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Master Blueprint</h3>
                                    <Button variant="ghost" size="sm" className="h-8 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-100 hover:bg-zinc-900 transition-all rounded-xl border border-zinc-900">Sync</Button>
                                 </div>
                                 <div className="space-y-3">
                                     {pages.map((p, idx) => (
                                         <button 
                                            key={p.id} 
                                            onClick={() => setActivePageId(p.id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-500 group relative overflow-hidden",
                                                activePageId === p.id 
                                                    ? "bg-zinc-100 text-zinc-950 shadow-[0_20px_40px_rgba(255,255,255,0.1)] translate-x-1" 
                                                    : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/40"
                                            )}
                                         >
                                             <div className={cn(
                                                 "text-[10px] font-black opacity-40 group-hover:opacity-100 transition-opacity",
                                                 activePageId === p.id ? "text-zinc-950" : "text-zinc-700"
                                             )}>
                                                 {String(idx + 1).padStart(2, '0')}
                                             </div>
                                             <span className="text-[12px] font-black flex-1 truncate tracking-tight">{p.title}</span>
                                             {activePageId === p.id && <div className="w-2 h-2 rounded-full bg-zinc-950 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* --- STUDIO EDITOR (REPOSITIONED & OFFSET) --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative lg:ml-[380px] z-10">
                <div className="h-12 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50 flex items-center justify-between px-10 shrink-0 z-20">
                     <div className="flex items-center gap-6">
                         <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Active Node</span>
                         </div>
                         <span className="text-[11px] font-bold text-zinc-400 tracking-tight">{activePage.title}</span>
                     </div>
                     <div className="flex items-center gap-8">
                         <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">
                             <div className={cn("w-2 h-2 rounded-full shadow-glow", isBusy ? 'bg-zinc-100 animate-pulse' : 'bg-zinc-800')} />
                             <span>{isBusy ? 'Processing' : 'Synchronized'}</span>
                         </div>
                     </div>
                </div>
                
                <ScrollArea className="flex-1 custom-scrollbar">
                    <div className="max-w-4xl mx-auto py-28 px-12">
                        <div className="mb-20">
                             <input 
                                type="text"
                                value={activePage.title}
                                onChange={(e) => setPages(prev => prev.map(p => p.id === activePageId ? {...p, title: e.target.value} : p))}
                                className="w-full bg-transparent border-none outline-none text-5xl font-black tracking-tighter placeholder:text-zinc-900 text-zinc-100 mb-6 focus:ring-0"
                                placeholder="Blueprint Title..."
                             />
                             <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700">
                                 <div className="flex items-center gap-3">
                                     <IconActivity className="w-4 h-4" />
                                     <span>Draft v1.0.4</span>
                                 </div>
                                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                 <span>{activePage.content.split(/\s+/).filter(Boolean).length.toLocaleString()} Words</span>
                             </div>
                        </div>

                        <NovelEditor
                            title={activePage.title}
                            onTitleChange={(t) => setPages(prev => prev.map(p => p.id === activePageId ? {...p, title: t} : p))}
                            content={activePage.content}
                            onContentChange={(c) => setPages(prev => prev.map(p => p.id === activePageId ? {...p, content: c} : p))}
                            onTriggerAI={(p) => handleSendMessage(undefined, `Expand architecture: ${p}`)}
                            onTriggerImageGen={(p) => handleSendMessage(undefined, `Visualize node: ${p}`)}
                        />
                    </div>
                </ScrollArea>
                
                {/* Visual Accent */}
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-zinc-100/[0.02] blur-[150px] rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </main>
        </div>
    </div>
  );
};

export default EbookStudioPage;
