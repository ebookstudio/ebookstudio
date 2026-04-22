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
    { label: "Section Heading", type: 'h1', icon: IconH1, desc: "Primary title block" },
    { label: "Sub Heading", type: 'h2', icon: IconH2, desc: "Secondary section block" },
    { label: "List Item", type: 'ul', icon: IconList, desc: "Bullet point entry" },
    { label: "Quote", type: 'blockquote', icon: IconQuote, desc: "Reference callout" },
    { label: "Text Block", type: 'p', icon: IconMinus, desc: "Standard paragraph" },
    { label: "Drafting Assistant", action: 'ai', icon: IconSparkles, desc: "Contextual AI expansion", highlight: true },
    { label: "Visual Asset", action: 'img', icon: IconImage, desc: "Image generation tool", highlight: true },
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
                  top: (rect.bottom - containerRect.top) + 8, 
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
              const userPrompt = window.prompt("Instruction for Co-Author:");
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
    <div className="editor-container w-full max-w-3xl mx-auto min-h-screen relative flex flex-col pt-16 pb-64 font-sans">
        
        <div className="mb-12">
             <input 
                type="text" 
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full bg-transparent text-4xl font-bold text-zinc-100 border-none outline-none placeholder-zinc-800 tracking-tight"
                placeholder="Document Title"
            />
        </div>

        <div className="relative flex-1">
             {blocks.map((block, index) => (
                 <div key={block.id} className="group relative mb-4">
                     {block.type === 'image' ? (
                         <div className="rounded-xl overflow-hidden border border-zinc-900 my-10 bg-zinc-950 shadow-2xl relative">
                             <img src={block.content} alt="Integrated Visual" className="w-full h-auto" />
                         </div>
                     ) : block.type === 'image-prompt' ? (
                         <div className="my-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3 w-full animate-fade-in focus-within:border-zinc-700 transition-all">
                             <IconSparkles className="w-4 h-4 text-zinc-500 shrink-0" />
                             <input 
                                 autoFocus
                                 type="text"
                                 placeholder="Describe visual asset..."
                                 className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-zinc-100 placeholder-zinc-700 h-8"
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
                                         newBlocks[index] = { ...newBlocks[index], type: 'p', content: `[Generating visual asset: ${block.content}...]` };
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
                             <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-700">Enter to Generate</div>
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
                                "w-full outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-800 transition-all leading-relaxed",
                                block.type === 'h1' ? 'text-3xl font-bold text-zinc-100 mb-4 mt-8' : 
                                block.type === 'h2' ? 'text-xl font-bold text-zinc-200 mb-3 mt-6' : 
                                block.type === 'ul' ? 'list-disc list-inside text-sm font-medium text-zinc-400 pl-2 mb-3' :
                                block.type === 'blockquote' ? 'text-lg font-medium text-zinc-500 border-l border-zinc-800 pl-6 py-2 my-6' :
                                'text-sm font-medium text-zinc-400 mb-3'
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
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    className="absolute z-[100] w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <div className="px-3 py-2 text-[8px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-800 bg-zinc-950/30">
                        Workspace Tools
                    </div>
                    <div className="p-1 max-h-[300px] overflow-y-auto">
                        {filteredMenuItems.map((item, idx) => (
                            <button
                                key={item.label}
                                onMouseDown={(e) => { e.preventDefault(); executeCommand(item); }}
                                onMouseEnter={() => setMenuSelectedIndex(idx)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all",
                                    idx === menuSelectedIndex ? 'bg-zinc-100 text-zinc-950 shadow-md' : 'hover:bg-zinc-800 text-zinc-400'
                                )}
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded flex items-center justify-center transition-all",
                                    idx === menuSelectedIndex ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-950 border border-zinc-800'
                                )}>
                                    <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        "text-[10px] font-bold tracking-tight",
                                        idx === menuSelectedIndex ? 'text-zinc-950' : 'text-zinc-200'
                                    )}>{item.label}</div>
                                    <div className={cn(
                                        "text-[8px] font-bold truncate opacity-60 uppercase tracking-wider",
                                        idx === menuSelectedIndex ? 'text-zinc-800' : 'text-zinc-600'
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
