import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    IconH1, IconH2, IconList, IconQuote, IconSparkles, IconImage, 
    IconMinus, IconX, IconArrowUp, IconChevronRight, IconMenu
} from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Block {
    id: string;
    type: 'h1' | 'h2' | 'p' | 'ul' | 'blockquote' | 'image' | 'image-prompt' | 'hr';
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

interface EditableBlockProps {
    block: Block;
    index: number;
    onKeyDown: (e: React.KeyboardEvent, index: number) => void;
    onInput: (e: React.FormEvent<HTMLDivElement>, index: number) => void;
    onFocus: () => void;
    blockRef: (el: HTMLDivElement | null) => void;
    isFirstParagraph?: boolean;
}

const EditableBlock = React.memo(({ block, index, onKeyDown, onInput, onFocus, blockRef, isFirstParagraph }: EditableBlockProps) => {
    const elRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (elRef.current && elRef.current.innerText !== block.content) {
            elRef.current.innerText = block.content;
        }
    }, [block.content]);

    return (
        <div
            ref={(el) => {
                elRef.current = el;
                blockRef(el);
            }}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={(e) => onKeyDown(e, index)}
            onInput={(e) => onInput(e, index)}
            onFocus={onFocus}
            className={cn(
                "w-full outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-800 transition-all duration-500 leading-relaxed relative",
                block.type === 'h1' ? 'font-playfair text-[2.8rem] font-bold text-zinc-100 mb-10 mt-16 tracking-tight text-center' : 
                block.type === 'h2' ? 'font-playfair text-[2rem] font-semibold text-zinc-100 mb-8 mt-12 tracking-tight text-center' : 
                block.type === 'ul' ? 'font-serif list-disc list-inside text-[1.15rem] text-zinc-300 pl-4 mb-8 leading-[1.8]' :
                block.type === 'blockquote' ? 'font-serif text-[1.25rem] italic text-zinc-400 border-l-2 border-zinc-700 pl-10 py-3 my-12 bg-transparent' :
                block.type === 'hr' ? 'py-12 flex justify-center items-center pointer-events-none' :
                'font-serif text-[1.25rem] text-zinc-300 mb-10 leading-[2] text-justify hyphens-auto',
                (isFirstParagraph && block.type === 'p' && block.content.length > 0) ? 'first-letter:float-left first-letter:text-[5rem] first-letter:pr-4 first-letter:font-playfair first-letter:font-bold first-letter:text-zinc-100 first-letter:leading-[0.8] first-letter:mt-2' : ''
            )}
            data-placeholder="Start writing..."
        >
            {block.type === 'hr' && (
                <div className="flex gap-4 items-center opacity-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <div className="w-2 h-2 rounded-full bg-zinc-100 rotate-45 border border-zinc-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    return prev.block.id === next.block.id && prev.block.type === next.block.type;
});

const NovelEditor: React.FC<NovelEditorProps> = ({ 
    title, 
    onTitleChange, 
    content, 
    onContentChange,
    onTriggerAI,
    onTriggerImageGen
}) => {
  const parseMarkdown = useCallback((md: string): Block[] => {
      if (!md) return [{ id: 'initial-p', type: 'p', content: '' }];
      const lines = md.split('\n');
      const blocks: Block[] = [];
      
      lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed && lines.length > 1 && index !== lines.length - 1) return;

          // Stable ID generation using a hash of the content + index for uniqueness
          const content = line.replace(/^(# |## |- |> |!\[)/, '').replace(/\]\(.*?\)$/, '');
          const id = `block-${index}-${btoa(content.substring(0, 10)).replace(/=/g, '')}`; 
          
          if (line.startsWith('# ')) blocks.push({ id, type: 'h1', content: line.replace('# ', '') });
          else if (line.startsWith('## ')) blocks.push({ id, type: 'h2', content: line.replace('## ', '') });
          else if (line.startsWith('- ')) blocks.push({ id, type: 'ul', content: line.replace('- ', '') });
          else if (line.startsWith('> ')) blocks.push({ id, type: 'blockquote', content: line.replace('> ', '') });
          else if (line.startsWith('---')) blocks.push({ id, type: 'hr', content: '' });
          else if (line.startsWith('![')) {
              const match = line.match(/\((.*?)\)/);
              if (match) blocks.push({ id, type: 'image', content: match[1] });
          }
          else blocks.push({ id, type: 'p', content: line });
      });
      
      if (blocks.length === 0) blocks.push({ id: 'fallback-p', type: 'p', content: '' });
      return blocks;
  }, []);

  const serializeToMarkdown = useCallback((blocks: Block[]) => {
      return blocks.map(b => {
          if (b.type === 'h1') return `# ${b.content}`;
          if (b.type === 'h2') return `## ${b.content}`;
          if (b.type === 'ul') return `- ${b.content}`;
          if (b.type === 'blockquote') return `> ${b.content}`;
          if (b.type === 'hr') return `---`;
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
      // Only update blocks if content changed from outside
      if (content !== currentMd) {
          setBlocks(parseMarkdown(content));
      }
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
    { label: "Ornamental Divider", type: 'hr', icon: IconMinus, desc: "Stylized section break" },
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

  const [bubbleMenu, setBubbleMenu] = useState<{ isOpen: boolean, top: number, left: number }>({ isOpen: false, top: 0, left: 0 });

  useEffect(() => {
    const handleSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0 && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const container = document.querySelector('.editor-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                setBubbleMenu({
                    isOpen: true,
                    top: rect.top - containerRect.top - 50,
                    left: rect.left - containerRect.left + (rect.width / 2) - 100
                });
            }
        } else {
            setBubbleMenu(prev => ({ ...prev, isOpen: false }));
        }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

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
      if (isTypingRef.current) {
          clearTimeout((isTypingRef as any).timeout);
          (isTypingRef as any).timeout = setTimeout(() => { isTypingRef.current = false; }, 2000);
      } else {
          isTypingRef.current = true;
          (isTypingRef as any).timeout = setTimeout(() => { isTypingRef.current = false; }, 2000);
      }
  };

  const chapterList = blocks.filter(b => b.type === 'h1' || b.type === 'h2');
  const firstParagraphIndices = new Set<number>();
  let lastWasHeader = true; // The first paragraph of the book gets a drop cap
  blocks.forEach((b, i) => {
      if (b.type === 'h1' || b.type === 'h2') {
          lastWasHeader = true;
      } else if (b.type === 'p' && b.content.trim().length > 0) {
          if (lastWasHeader) {
              firstParagraphIndices.add(i);
              lastWasHeader = false;
          }
      }
  });

  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);

  return (
    <div className="editor-container w-full relative flex flex-col font-sans bg-transparent">
        
        {/* Internal Header Removed as it's now in EbookStudioPage */}

        {/* Chapter Menu Sidebar */}
        <AnimatePresence>
            {chapterMenuOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setChapterMenuOpen(false)}
                    />
                    <motion.aside 
                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-50 p-6 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                            <h3 className="font-playfair text-[1.2rem] font-bold text-zinc-100 italic">Chapter List</h3>
                            <button onClick={() => setChapterMenuOpen(false)} className="text-zinc-400 hover:text-zinc-200"><IconX className="w-5 h-5" /></button>
                        </div>
                        <ul className="flex flex-col gap-4 font-lato">
                            {chapterList.map((chap, idx) => (
                                <li key={chap.id}>
                                    <button 
                                        className="text-zinc-400 hover:text-zinc-200 text-left transition-colors font-bold uppercase tracking-wider text-xs block w-full truncate"
                                        onClick={() => {
                                            const el = blockRefs.current[blocks.findIndex(b => b.id === chap.id)];
                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            setChapterMenuOpen(false);
                                        }}
                                    >
                                        {chap.content || `Chapter ${idx + 1}`}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>

        <div className="relative flex-1">
             {blocks.map((block, index) => (
                 <div 
                    key={block.id} 
                    className={cn(
                        "group relative transition-all duration-700 ease-in-out",
                        activeBlockIndex !== index ? "opacity-30 blur-[0.5px] scale-[0.995]" : "opacity-100 blur-0 scale-100"
                    )}
                >
                     {block.type === 'image' ? (
                         <div className="rounded-xl overflow-hidden border border-zinc-800 my-10 bg-zinc-900 shadow-md relative">
                             <img src={block.content} alt="Integrated Visual" className="w-full h-auto" />
                         </div>
                     ) : block.type === 'image-prompt' ? (
                         <div className="my-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3 w-full animate-fade-in focus-within:border-zinc-700 transition-all">
                             <IconSparkles className="w-4 h-4 text-zinc-500 shrink-0" />
                             <input 
                                 autoFocus
                                 type="text"
                                 placeholder="Describe visual asset..."
                                 className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-zinc-100 placeholder-zinc-500 h-8"
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
                             <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Enter to Generate</div>
                         </div>
                     ) : (
                         <EditableBlock
                             block={block}
                             index={index}
                             onKeyDown={handleKeyDown}
                             onInput={handleInput}
                             onFocus={() => setActiveBlockIndex(index)}
                             blockRef={(el) => { blockRefs.current[index] = el; }}
                             isFirstParagraph={firstParagraphIndices.has(index)}
                         />
                     )}
                 </div>
             ))}
        </div>

        <AnimatePresence>
            {bubbleMenu.isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute z-[110] flex items-center gap-1 p-1.5 bg-zinc-950 border border-zinc-800 rounded-full shadow-2xl backdrop-blur-xl"
                    style={{ top: bubbleMenu.top, left: bubbleMenu.left }}
                >
                    <button 
                        onClick={() => { document.execCommand('bold'); }}
                        className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-100 transition-colors"
                    >
                        <span className="font-bold text-xs">B</span>
                    </button>
                    <button 
                        onClick={() => { document.execCommand('italic'); }}
                        className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-100 transition-colors"
                    >
                        <span className="italic text-xs">I</span>
                    </button>
                    <div className="w-px h-4 bg-zinc-800 mx-1" />
                    <button 
                        onClick={() => {
                            const selection = window.getSelection()?.toString();
                            if (selection) onTriggerAI(`Rewrite and enhance this text: "${selection}"`);
                        }}
                        className="flex items-center gap-2 px-3 h-8 rounded-full bg-zinc-100 text-zinc-950 hover:bg-white transition-all group"
                    >
                        <IconSparkles className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Enhance</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {menuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-[100] w-72 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <div className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-900 bg-zinc-950/50">
                        Composition Palette
                    </div>
                    <div className="p-1 max-h-[300px] overflow-y-auto">
                        {filteredMenuItems.map((item, idx) => (
                            <button
                                key={item.label}
                                onMouseDown={(e) => { e.preventDefault(); executeCommand(item); }}
                                onMouseEnter={() => setMenuSelectedIndex(idx)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all",
                                    idx === menuSelectedIndex ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'hover:bg-zinc-900 text-zinc-400'
                                )}
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded flex items-center justify-center transition-all",
                                    idx === menuSelectedIndex ? 'bg-zinc-700 text-zinc-100 border border-zinc-600' : 'bg-zinc-900 border border-zinc-800'
                                )}>
                                    <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        "text-[10px] font-bold tracking-tight",
                                        idx === menuSelectedIndex ? 'text-zinc-100' : 'text-zinc-300'
                                    )}>{item.label}</div>
                                    <div className={cn(
                                        "text-[8px] font-bold truncate opacity-60 uppercase tracking-wider",
                                        idx === menuSelectedIndex ? 'text-zinc-400' : 'text-zinc-500'
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
