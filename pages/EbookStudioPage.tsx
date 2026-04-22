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
} from '../services/aiService';
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
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-zinc-100/10 selection:text-zinc-100 font-sans">
        
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

        <div className="flex flex-1 overflow-hidden relative">
            
            {/* --- STUDIO SIDEBAR --- */}
            <aside className="hidden lg:flex w-[380px] bg-zinc-950 border-r border-zinc-900/50 flex-col z-20 shadow-[20px_0_40px_rgba(0,0,0,0.3)]">
                <div className="h-14 border-b border-zinc-900/50 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-100">Studio Intelligence</span>
                    </div>
                    <Badge variant="outline" className="bg-zinc-900/50 border-zinc-800 text-zinc-500 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">v4.0.2</Badge>
                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col bg-[#050505]">
                    {leftTab === 'chat' && (
                        <>
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-8">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center pt-20 text-center opacity-40">
                                            <IconBrain className="w-12 h-12 mb-4 text-zinc-500" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Co-Author Initialized</p>
                                            <p className="text-[9px] mt-2 text-zinc-600 max-w-[200px]">Send a message to begin your creative journey.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div key={msg.id} className="animate-fade-in">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Badge className={cn(
                                                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm border-none shadow-sm",
                                                        msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-950'
                                                    )}>
                                                        {msg.role === 'user' ? 'Author' : 'Co-Author'}
                                                    </Badge>
                                                    {msg.role === 'ai' && msg.isStreaming && (
                                                        <div className="flex gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse" />
                                                            <div className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse delay-75" />
                                                            <div className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse delay-150" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "text-[13px] leading-relaxed font-medium whitespace-pre-wrap selection:bg-zinc-100 selection:text-zinc-950",
                                                    msg.role === 'user' ? 'text-zinc-100' : 'text-zinc-300'
                                                )}>
                                                    {msg.attachments?.map((src, i) => (
                                                        <img key={i} src={src} className="h-40 w-auto rounded-lg mb-4 border border-zinc-800/50 shadow-2xl" />
                                                    ))}
                                                    {msg.text}
                                                    {msg.isToolUse && (
                                                        <div className="mt-4 flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-100 animate-pulse" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 italic">Synchronizing E-book Draft...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* --- PREMIUM INPUT INTERFACE --- */}
                            <div className="p-6 bg-[#050505] border-t border-zinc-900/50">
                                {attachmentPreviews.length > 0 && (
                                    <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {attachmentPreviews.map((src, idx) => (
                                            <div key={idx} className="relative group shrink-0">
                                                <img src={src} className="h-20 w-20 object-cover rounded-xl border border-zinc-800 shadow-2xl" />
                                                <button 
                                                    onClick={() => removeAttachment(idx)} 
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-950 rounded-full text-zinc-500 border border-zinc-800 hover:text-red-500 transition-all flex items-center justify-center shadow-2xl backdrop-blur-md"
                                                >
                                                    <IconX className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className={cn(
                                    "bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-2 transition-all duration-500 relative group",
                                    isBusy ? 'ring-2 ring-white/5 border-zinc-700 bg-zinc-900/50' : 'focus-within:border-zinc-600 focus-within:bg-zinc-900/40'
                                )}>
                                    <div className="flex items-end gap-2">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="w-10 h-10 rounded-xl bg-zinc-950/50 hover:bg-zinc-100 hover:text-zinc-950 flex items-center justify-center text-zinc-500 transition-all shrink-0 border border-zinc-800/50 active:scale-95"
                                            title="Attach File"
                                        >
                                            <IconPlus className="w-5 h-5" />
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,application/pdf" multiple />
                                        
                                        <button
                                            onMouseDown={startRecording} onMouseUp={stopRecording}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 border active:scale-95",
                                                isListening ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-glow-red animate-pulse' : 'bg-zinc-950/50 text-zinc-500 hover:text-zinc-100 border-zinc-800/50'
                                            )}
                                            title="Voice Dictation"
                                        >
                                            {isListening ? <IconStop className="w-4 h-4" /> : <IconMic className="w-4 h-4" />}
                                        </button>

                                        <textarea
                                            ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                                            placeholder={isListening ? "Listening to author..." : "Message Co-Author..."}
                                            className="flex-1 bg-transparent border-none outline-none text-[13px] py-3 px-2 max-h-48 min-h-[40px] resize-none font-medium placeholder:text-zinc-600 text-zinc-100 scrollbar-hide"
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                            disabled={isBusy}
                                        />
                                        
                                        <button 
                                            onClick={() => handleSendMessage()} 
                                            disabled={isBusy || (!input.trim() && attachments.length === 0)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-2xl active:scale-90",
                                                (input.trim() || attachments.length > 0) 
                                                    ? 'bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-105' 
                                                    : 'bg-zinc-800 text-zinc-600 opacity-50'
                                            )}
                                        >
                                            {isBusy ? <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div> : <IconSend className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Secure Uplink</span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 tabular-nums">{activePage.content.length} CHARS</span>
                                </div>
                            </div>
                        </>
                    )}

                    {leftTab === 'outline' && (
                         <ScrollArea className="flex-1 p-6">
                             <div className="space-y-4">
                                 {pages.map((p, idx) => (
                                     <button
                                        key={p.id} onClick={() => setActivePageId(p.id)}
                                        className={cn(
                                            "w-full text-left p-6 rounded-2xl border transition-all group relative overflow-hidden",
                                            activePageId === p.id 
                                                ? "bg-zinc-900 border-zinc-700 text-zinc-100 shadow-xl" 
                                                : "border-transparent text-zinc-600 hover:bg-zinc-900/50"
                                        )}
                                     >
                                         <div className="flex items-center justify-between mb-2">
                                             <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Chapter {idx + 1}</span>
                                             {activePageId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.3)]" />}
                                         </div>
                                         <span className="text-sm font-bold truncate block tracking-tight">{p.title}</span>
                                     </button>
                                 ))}
                                 <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newId = Date.now().toString();
                                        setPages([...pages, { id: newId, title: 'New Chapter', content: '', pageNumber: pages.length + 1 }]);
                                        setActivePageId(newId);
                                    }}
                                    className="w-full h-16 border-dashed border-zinc-800 text-zinc-700 hover:text-zinc-100 rounded-2xl mt-4 flex items-center justify-center gap-3 transition-all hover:border-zinc-700 bg-transparent text-[9px] font-bold uppercase tracking-widest"
                                 >
                                     <IconPlus className="w-4 h-4" /> 
                                     <span>Add Chapter</span>
                                 </Button>
                             </div>
                         </ScrollArea>
                    )}
                </div>
            </aside>

            {/* --- STUDIO EDITOR --- */}
            <main className="flex-1 flex flex-col relative bg-zinc-950">
                <div className="h-10 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-8 shrink-0">
                     <div className="flex items-center gap-4">
                         <Badge className="px-2 py-0.5 bg-zinc-900 text-zinc-500 text-[8px] font-bold uppercase tracking-widest border border-zinc-800 rounded">Drafting</Badge>
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{activePage.title}</span>
                     </div>
                     <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-zinc-700">
                             <div className={cn("w-1.5 h-1.5 rounded-full", isBusy ? 'bg-zinc-100 animate-pulse' : 'bg-zinc-800')} />
                             <span>{isBusy ? 'Syncing' : 'Connected'}</span>
                         </div>
                     </div>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="max-w-3xl mx-auto py-24 px-10">
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
