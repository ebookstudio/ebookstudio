import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EBook, EBookPage } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import {
    IconSparkles, IconSend, IconPlus, IconArrowLeft,
    IconX, IconMic, IconStop, IconCheck, IconBrain
} from '../constants';
import {
    createStudioSession, generateBookCover, transcribeAudio
} from '../services/geminiService';
import { Chat, Part } from '@google/genai';
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
  const { currentUser, addCreatedBook } = useAppContext();
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
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
        const initialContext = `You are the Co-Author AI assistant for ebookstudio.
        Current Author: ${currentUser?.name || 'Writer'}.
        Active Chapter: "${activePage.title}".
        Goal: Helping the author write a beautiful, professional e-book in simple, clear English.`;

        const session = createStudioSession(initialContext);
        if (session) {
            chatSessionRef.current = session;
            setMessages([{ id: 'sys-init', role: 'ai', text: "Hi! I'm Co-Author. I'm ready to help you write your next masterpiece!" }]);
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
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: "Auto-writing complete! Your book is ready." }]);
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
              const prompt = `Write Chapter ${targetPage.pageNumber}: "${targetPage.title}". Please write a detailed, immersive chapter of about 1000 words.`;
              handleSendMessage(undefined, prompt);
          }, 1000);
      }
  };

  const fileToPart = async (file: File): Promise<Part> => {
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
              return "Content saved.";
          }
          if (name === 'generate_image') {
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: `Creating your image: ${args.prompt}...` }]);
              const result = await generateBookCover(args.prompt, "Cinematic", activePage.title, currentUser?.name);
              if ('imageBytes' in result) {
                  const md = `\n\n![${args.prompt}](data:image/jpeg;base64,${result.imageBytes})\n\n`;
                  setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content: p.content + md } : p));
                  return "Image added to your book.";
              }
              return "Sorry, I couldn't create that image right now.";
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
              return `Outline created. Title: "${args.title}".`;
          }
          return "I've done that for you.";
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
          const parts: (string | Part)[] = [];
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
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isToolUse: true, text: m.text + "\n\n*Updating your book...*" } : m));
              const responses: Part[] = [];
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
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "I'm having a little trouble. Can you try again?", isStreaming: false } : m));
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
          handleSendMessage(undefined, `Please help me create an outline for my book "${pages[0].title}".`);
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
          title: pages[0].title || "Untitled",
          author: currentUser?.name || 'Author',
          description: 'Created with Co-Author AI',
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
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden selection:bg-purple-500/30 selection:text-white">
        
        <CinematicWriterOverlay 
            isOpen={isCinematicMode} 
            onClose={() => { setIsCinematicMode(false); setAutoPilotMode('idle'); setWriteQueue([]); }}
            content={lastAiMessage ? lastAiMessage.text : "Connecting to Co-Author..."}
            isStreaming={isBusy}
            chapterTitle={activePage.title}
        />

        {/* --- STUDIO HEADER --- */}
        <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 z-50 shrink-0 backdrop-blur-3xl">
            <div className="flex items-center gap-8">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')} 
                    className="group p-0 text-zinc-500 hover:text-white transition-colors"
                >
                    <IconArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" /> 
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Sanctuary</span>
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/10" />
                <div className="flex items-center gap-4">
                    <CoAuthor variant="logo" isActive={isBusy} className="w-8 h-8" />
                    <div>
                        <h1 className="text-xl font-serif font-black italic leading-none tracking-tight">Writing Studio.</h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-1 italic">Intelligence Amplified</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Button
                    onClick={handleAutoWrite}
                    disabled={isBusy || autoPilotMode !== 'idle'}
                    className="h-12 px-8 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50 font-black text-[10px] uppercase tracking-widest italic"
                >
                    {isBusy ? <IconSparkles className="w-4 h-4 animate-spin mr-3" /> : <IconBrain className="w-4 h-4 mr-3" />}
                    <span>{autoPilotMode !== 'idle' ? 'Processing...' : 'Auto-Writer'}</span>
                </Button>
                
                <Button 
                    onClick={handleExport} 
                    className="h-12 px-10 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl font-black text-[10px] uppercase tracking-widest italic"
                >
                    Save Masterpiece
                </Button>
            </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
            <div className="absolute inset-0 aurora-bg opacity-[0.05] pointer-events-none" />
            
            {/* --- STUDIO SIDEBAR --- */}
            <aside className="hidden lg:flex w-[420px] bg-white/[0.01] border-r border-white/5 flex-col z-20 shadow-3xl backdrop-blur-3xl">
                <div className="p-6 border-b border-white/5">
                    <Tabs value={leftTab} onValueChange={(v: any) => setLeftTab(v)}>
                        <TabsList className="w-full bg-white/5 h-12 p-1 rounded-2xl border border-white/5">
                            <TabsTrigger value="chat" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black italic transition-all">Co-Author</TabsTrigger>
                            <TabsTrigger value="outline" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black italic transition-all">Outline</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {leftTab === 'chat' && (
                        <>
                            <ScrollArea className="flex-1">
                                <div className="space-y-0">
                                    {messages.map((msg, idx) => (
                                        <div key={msg.id} className="py-12 px-10 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors group">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Badge className={cn(
                                                    "px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em] italic rounded-lg border-none",
                                                    msg.role === 'user' ? 'bg-zinc-900 text-zinc-500' : 'bg-purple-500/10 text-purple-400'
                                                )}>
                                                    {msg.role === 'user' ? 'Author' : 'Co-Author'}
                                                </Badge>
                                            </div>
                                            <div className={cn(
                                                "text-sm leading-relaxed font-medium whitespace-pre-wrap",
                                                msg.role === 'user' ? 'text-white' : 'text-zinc-500'
                                            )}>
                                                {msg.attachments?.map((src, i) => (
                                                    <img key={i} src={src} className="h-32 w-auto rounded-[2rem] mb-8 border border-white/10 shadow-3xl grayscale hover:grayscale-0 transition-all" />
                                                ))}
                                                {msg.text}
                                                {msg.isToolUse && (
                                                    <div className="mt-8 flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 italic">Synchronizing...</span>
                                                    </div>
                                                )}
                                                {msg.role === 'ai' && msg.isStreaming && idx === messages.length - 1 && (
                                                    <span className="inline-block w-1.5 h-4 ml-2 bg-purple-500 animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Chat Input Interface */}
                            <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-3xl">
                                {attachmentPreviews.length > 0 && (
                                    <div className="flex gap-4 mb-6 overflow-x-auto pb-4">
                                        {attachmentPreviews.map((src, idx) => (
                                            <div key={idx} className="relative group shrink-0">
                                                <img src={src} className="h-20 w-20 object-cover rounded-2xl border border-white/10 shadow-3xl" />
                                                <button 
                                                    onClick={() => removeAttachment(idx)} 
                                                    className="absolute -top-2 -right-2 w-7 h-7 bg-black rounded-full text-white border border-white/20 hover:bg-rose-500 transition-all flex items-center justify-center shadow-2xl"
                                                >
                                                    <IconX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className={cn(
                                    "bg-white/[0.02] border rounded-[2rem] p-5 flex items-end gap-4 shadow-3xl transition-all duration-500",
                                    isBusy ? 'border-purple-500/30 ring-8 ring-purple-500/5' : 'border-white/5 focus-within:border-white/10'
                                )}>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-600 hover:text-white transition-all shrink-0 shadow-inner"
                                    >
                                        <IconPlus className="w-6 h-6" />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,application/pdf" multiple />
                                    
                                    <button
                                        onMouseDown={startRecording} onMouseUp={stopRecording}
                                        className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0",
                                            isListening ? 'bg-rose-500 text-white scale-110 shadow-[0_0_40px_rgba(244,63,94,0.3)]' : 'bg-white/5 text-zinc-600 hover:text-white shadow-inner'
                                        )}
                                    >
                                        {isListening ? <IconStop className="w-5 h-5" /> : <IconMic className="w-5 h-5" />}
                                    </button>

                                    <textarea
                                        ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                                        placeholder={isListening ? "Listening..." : "Instruct Co-Author..."}
                                        className="flex-1 bg-transparent border-none outline-none text-white text-sm py-3 max-h-32 resize-none font-medium placeholder:text-zinc-800"
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                        disabled={isBusy}
                                    />
                                    
                                    <button 
                                        onClick={() => handleSendMessage()} 
                                        disabled={isBusy || (!input.trim() && attachments.length === 0)}
                                        className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 shrink-0 shadow-2xl"
                                    >
                                        {isBusy ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <IconSend className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-6 px-4">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800 italic">Studio Mode</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800 italic tabular-nums">{activePage.content.length} characters</span>
                                </div>
                            </div>
                        </>
                    )}

                    {leftTab === 'outline' && (
                         <ScrollArea className="flex-1 p-8">
                             <div className="space-y-6">
                                 {pages.map((p, idx) => (
                                     <button
                                        key={p.id} onClick={() => setActivePageId(p.id)}
                                        className={cn(
                                            "w-full text-left p-8 rounded-[2rem] border transition-all group relative overflow-hidden",
                                            activePageId === p.id 
                                                ? "bg-white/[0.03] border-white/10 text-white shadow-3xl" 
                                                : "border-transparent text-zinc-600 hover:bg-white/[0.02]"
                                        )}
                                     >
                                         <div className="flex items-center justify-between mb-4">
                                             <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic">Chapter {idx + 1}</span>
                                             {activePageId === p.id && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]" />}
                                         </div>
                                         <span className="text-xl font-serif font-black italic truncate block tracking-tight">{p.title}</span>
                                     </button>
                                 ))}
                                 <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newId = Date.now().toString();
                                        setPages([...pages, { id: newId, title: 'New Chapter', content: '', pageNumber: pages.length + 1 }]);
                                        setActivePageId(newId);
                                    }}
                                    className="w-full h-24 border-dashed border-white/5 text-zinc-800 hover:text-white rounded-[2rem] mt-8 flex items-center justify-center gap-4 transition-all hover:border-white/10 bg-transparent font-black text-[10px] uppercase tracking-widest italic"
                                 >
                                     <IconPlus className="w-5 h-5" /> 
                                     <span>Append Chapter</span>
                                 </Button>
                             </div>
                         </ScrollArea>
                    )}
                </div>
            </aside>

            {/* --- STUDIO EDITOR --- */}
            <main className="flex-1 flex flex-col relative bg-black">
                <div className="h-12 bg-white/[0.01] border-b border-white/[0.03] flex items-center justify-between px-10 shrink-0 backdrop-blur-3xl">
                     <div className="flex items-center gap-6">
                         <Badge className="px-4 py-1 bg-white/5 text-zinc-600 text-[9px] font-black uppercase tracking-widest border border-white/5 italic rounded-lg">Drafting</Badge>
                         <span className="text-xs font-black text-zinc-500 italic uppercase tracking-widest">{activePage.title}</span>
                     </div>
                     <div className="flex items-center gap-8">
                         <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 italic">
                             <div className={cn("w-2 h-2 rounded-full shadow-3xl", isBusy ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500')} />
                             <span>{isBusy ? 'Processing' : 'Steady'}</span>
                         </div>
                     </div>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="max-w-4xl mx-auto py-32 px-12">
                        <NovelEditor
                            title={activePage.title}
                            onTitleChange={(t) => setPages(prev => prev.map(p => p.id === activePageId ? {...p, title: t} : p))}
                            content={activePage.content}
                            onContentChange={(c) => setPages(prev => prev.map(p => p.id === activePageId ? {...p, content: c} : p))}
                            onTriggerAI={(p) => handleSendMessage(undefined, `Write content: ${p}`)}
                            onTriggerImageGen={(p) => handleSendMessage(undefined, `Generate image: ${p}`)}
                        />
                    </div>
                </ScrollArea>
            </main>
        </div>
    </div>
  );
};

export default EbookStudioPage;
