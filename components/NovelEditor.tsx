import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    IconH1, IconH2, IconList, IconQuote, IconSparkles, IconImage, 
    IconMinus, IconX, IconArrowUp, IconChevronRight
} from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Block {
    id: string;
    type: 'h1' | 'h2' | 'p' | 'ul' | 'blockquote' | 'image' | 'image-prompt';
    content: string;
}

interface NovelEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  content: string;
  onContentChange: (val: string) => void;
  onTriggerAI: (prompt: string) => void;
  onTriggerImageGen: (prompt: string) => void;
}

const NovelEditor: React.FC<NovelEditorProps> = ({ 
    title, 
    onTitleChange, 
    content, 
    onContentChange,
    onTriggerAI,
    onTriggerImageGen
}) => {
  const parseMarkdown = useCallback((md: string): Block[] => {
      if (!md) return [{ id: Date.now().toString(), type: 'p', content: '' }];
      const lines = md.split('\n');
      const blocks: Block[] = [];
      
      for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed && lines.length > 1) continue;

          if (line.startsWith('# ')) blocks.push({ id: Math.random().toString(), type: 'h1', content: line.replace('# ', '') });
          else if (line.startsWith('## ')) blocks.push({ id: Math.random().toString(), type: 'h2', content: line.replace('## ', '') });
          else if (line.startsWith('- ')) blocks.push({ id: Math.random().toString(), type: 'ul', content: line.replace('- ', '') });
          else if (line.startsWith('> ')) blocks.push({ id: Math.random().toString(), type: 'blockquote', content: line.replace('> ', '') });
          else if (line.startsWith('![')) {
              const match = line.match(/\((.*?)\)/);
              if (match) blocks.push({ id: Math.random().toString(), type: 'image', content: match[1] });
          }
          else blocks.push({ id: Math.random().toString(), type: 'p', content: line });
      }
      if (blocks.length === 0) blocks.push({ id: Date.now().toString(), type: 'p', content: '' });
      return blocks;
  }, []);

  const serializeToMarkdown = useCallback((blocks: Block[]) => {
      return blocks.map(b => {
          if (b.type === 'h1') return `# ${b.content}`;
          if (b.type === 'h2') return `## ${b.content}`;
          if (b.type === 'ul') return `- ${b.content}`;
          if (b.type === 'blockquote') return `> ${b.content}`;
          if (b.type === 'image') return `![Image](${b.content})`;
          if (b.type === 'image-prompt') return ''; 
          return b.content;
      }).join('\n\n');
  }, []);

  const [blocks, setBlocks] = useState<Block[]>(() => parseMarkdown(content));
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [menuQuery, setMenuQuery] = useState('');
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);
  const isTypingRef = useRef(false);

  useEffect(() => {
      if (isTypingRef.current) return;
      const currentMd = serializeToMarkdown(blocks);
      if (content !== currentMd) setBlocks(parseMarkdown(content));
  }, [content, parseMarkdown, serializeToMarkdown]);

  useEffect(() => {
      const newMarkdown = serializeToMarkdown(blocks);
      if (newMarkdown !== content && !blocks.some(b => b.type === 'image-prompt')) {
          onContentChange(newMarkdown);
      }
  }, [blocks, onContentChange, serializeToMarkdown, content]);

  const MENU_ITEMS = [
    { label: "Heading 1", type: 'h1', icon: IconH1, desc: "Primary section header" },
    { label: "Heading 2", type: 'h2', icon: IconH2, desc: "Secondary section header" },
    { label: "Bullet List", type: 'ul', icon: IconList, desc: "Create a simple list" },
    { label: "Quote", type: 'blockquote', icon: IconQuote, desc: "Capture a callout" },
    { label: "Paragraph", type: 'p', icon: IconMinus, desc: "Standard text block" },
    { label: "AI Writing Assistant", action: 'ai', icon: IconSparkles, desc: "Generate content with AI", highlight: true },
    { label: "AI Image Generator", action: 'img', icon: IconImage, desc: "Generate visual assets", highlight: true },
  ];

  const filteredMenuItems = MENU_ITEMS.filter(item => 
      item.label.toLowerCase().includes(menuQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(menuQuery.toLowerCase())
  );

  const openMenu = () => {
      const blockEl = blockRefs.current[activeBlockIndex];
      if (blockEl) {
          const rect = blockEl.getBoundingClientRect();
          const editorContainer = blockEl.closest('.editor-container');
          if (editorContainer) {
              const containerRect = editorContainer.getBoundingClientRect();
              setMenuPosition({ 
                  top: (rect.bottom - containerRect.top) + 12, 
                  left: (rect.left - containerRect.left) 
              });
              setMenuOpen(true);
              setMenuQuery('');
              setMenuSelectedIndex(0);
          }
      }
  };

  const closeMenu = () => {
      setMenuOpen(false);
      setMenuQuery('');
      setMenuSelectedIndex(0);
  };

  const executeCommand = (item: typeof MENU_ITEMS[0]) => {
      const newBlocks = [...blocks];
      newBlocks[activeBlockIndex].content = ''; 
      
      if (item.action) {
          if (item.action === 'img') {
              newBlocks[activeBlockIndex].type = 'image-prompt';
              setBlocks(newBlocks);
              closeMenu();
          } else {
              setBlocks(newBlocks);
              closeMenu();
              const userPrompt = window.prompt("AI Instruction:");
              if (userPrompt) onTriggerAI(userPrompt);
          }
      } else {
          newBlocks[activeBlockIndex].type = item.type as Block['type'];
          setBlocks(newBlocks);
          closeMenu();
          setTimeout(() => blockRefs.current[activeBlockIndex]?.focus(), 50);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (menuOpen) {
          if (e.key === 'ArrowDown') { e.preventDefault(); setMenuSelectedIndex(prev => (prev + 1) % filteredMenuItems.length); return; }
          if (e.key === 'ArrowUp') { e.preventDefault(); setMenuSelectedIndex(prev => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length); return; }
          if (e.key === 'Enter') { e.preventDefault(); if (filteredMenuItems[menuSelectedIndex]) executeCommand(filteredMenuItems[menuSelectedIndex]); return; }
          if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const newBlock: Block = { id: Date.now().toString(), type: 'p', content: '' };
          const newBlocks = [...blocks];
          newBlocks.splice(index + 1, 0, newBlock);
          setBlocks(newBlocks);
          setActiveBlockIndex(index + 1);
          setTimeout(() => blockRefs.current[index + 1]?.focus(), 50);
      }
      else if (e.key === 'Backspace' && blocks[index].content === '') {
          if (blocks.length > 1) {
              e.preventDefault();
              const newBlocks = [...blocks];
              newBlocks.splice(index, 1);
              setBlocks(newBlocks);
              const nextIndex = Math.max(0, index - 1);
              setActiveBlockIndex(nextIndex);
              setTimeout(() => blockRefs.current[nextIndex]?.focus(), 50);
          }
      }
      else if (e.key === 'ArrowUp') {
          if (index > 0) { e.preventDefault(); setActiveBlockIndex(index - 1); blockRefs.current[index - 1]?.focus(); }
      }
      else if (e.key === 'ArrowDown') {
          if (index < blocks.length - 1) { e.preventDefault(); setActiveBlockIndex(index + 1); blockRefs.current[index + 1]?.focus(); }
      }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>, index: number) => {
      isTypingRef.current = true;
      const text = e.currentTarget.innerText;
      const newBlocks = [...blocks];
      newBlocks[index].content = text;
      setBlocks(newBlocks);
      
      if (text.endsWith('/')) openMenu();
      else if (menuOpen && !text.includes('/')) closeMenu();
      else if (menuOpen) {
          const slashIndex = text.lastIndexOf('/');
          setMenuQuery(text.substring(slashIndex + 1));
      }
      setTimeout(() => { isTypingRef.current = false; }, 100);
  };

  return (
    <div className="editor-container w-full max-w-4xl mx-auto min-h-screen relative flex flex-col pt-24 pb-64">
        
        <div className="px-12 mb-16">
             <input 
                type="text" 
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full bg-transparent text-5xl md:text-6xl font-bold text-zinc-100 border-none outline-none placeholder-zinc-800 tracking-tight"
                placeholder="Publication Title"
            />
        </div>

        <div className="px-12 relative flex-1">
             {blocks.map((block, index) => (
                 <div key={block.id} className="group relative mb-4">
                     {block.type === 'image' ? (
                         <div className="rounded-xl overflow-hidden border border-border my-12 bg-zinc-950 shadow-2xl relative">
                             <img src={block.content} alt="Visual Asset" className="w-full h-auto" />
                         </div>
                     ) : block.type === 'image-prompt' ? (
                         <div className="my-8 p-4 bg-zinc-950 border border-zinc-700 rounded-xl flex items-center gap-4 w-full shadow-xl animate-fade-in focus-within:border-zinc-500 transition-all">
                             <IconSparkles className="w-4 h-4 text-zinc-400 shrink-0" />
                             <input 
                                 autoFocus
                                 type="text"
                                 placeholder="Describe the image to generate..."
                                 className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-zinc-100 placeholder-zinc-700 h-8"
                                 value={block.content}
                                 onChange={(e) => {
                                     const newBlocks = [...blocks];
                                     newBlocks[index].content = e.target.value;
                                     setBlocks(newBlocks);
                                 }}
                                 onKeyDown={(e) => {
                                     if (e.key === 'Enter') {
                                         e.preventDefault();
                                         onTriggerImageGen(block.content);
                                         const newBlocks = [...blocks];
                                         newBlocks[index] = { ...newBlocks[index], type: 'p', content: `[Generating asset: ${block.content}...]` };
                                         setBlocks(newBlocks);
                                     }
                                     if (e.key === 'Escape') {
                                         const newBlocks = [...blocks];
                                         newBlocks[index].type = 'p';
                                         newBlocks[index].content = '';
                                         setBlocks(newBlocks);
                                     }
                                 }}
                             />
                             <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 mr-2">Enter to Generate</div>
                         </div>
                     ) : (
                         <div
                            ref={el => { blockRefs.current[index] = el; }}
                            contentEditable
                            suppressContentEditableWarning
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onInput={(e) => handleInput(e, index)}
                            onFocus={() => setActiveBlockIndex(index)}
                            className={cn(
                                "w-full outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-800 transition-all",
                                block.type === 'h1' ? 'text-4xl font-bold text-zinc-100 mb-6 mt-10' : 
                                block.type === 'h2' ? 'text-2xl font-bold text-zinc-200 mb-4 mt-8' : 
                                block.type === 'ul' ? 'list-disc list-inside text-lg font-medium text-zinc-400 pl-4 leading-relaxed mb-4' :
                                block.type === 'blockquote' ? 'text-xl font-medium text-zinc-500 border-l-2 border-zinc-700 pl-8 py-4 my-8 bg-zinc-950/30' :
                                'text-lg font-medium text-zinc-400 leading-relaxed mb-4'
                            )}
                            data-placeholder="Type '/' for commands..."
                         >
                             {block.content}
                         </div>
                     )}
                 </div>
             ))}
        </div>

        <AnimatePresence>
            {menuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute z-[100] w-72 bg-zinc-900 border border-border rounded-xl shadow-3xl overflow-hidden flex flex-col"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <div className="px-4 py-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest border-b border-border bg-zinc-950/50">
                        Commands
                    </div>
                    <div className="p-1 max-h-[350px] overflow-y-auto custom-scrollbar">
                        {filteredMenuItems.map((item, idx) => (
                            <button
                                key={item.label}
                                onMouseDown={(e) => { e.preventDefault(); executeCommand(item); }}
                                onMouseEnter={() => setMenuSelectedIndex(idx)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all",
                                    idx === menuSelectedIndex ? 'bg-zinc-100 text-zinc-950 shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded flex items-center justify-center transition-all",
                                    idx === menuSelectedIndex ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-950 border border-border'
                                )}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        "text-xs font-bold tracking-tight",
                                        idx === menuSelectedIndex ? 'text-zinc-950' : 'text-zinc-200'
                                    )}>{item.label}</div>
                                    <div className={cn(
                                        "text-[10px] font-medium truncate opacity-60",
                                        idx === menuSelectedIndex ? 'text-zinc-800' : 'text-zinc-500'
                                    )}>{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NovelEditor;
