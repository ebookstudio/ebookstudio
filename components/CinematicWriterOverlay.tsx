
import React, { useEffect, useRef, useState } from 'react';
import { IconX, IconBrain, IconActivity, IconSparkles, IconFeather } from '../constants';
import CoAuthor from './CoAuthor';

interface CinematicWriterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isStreaming: boolean;
  chapterTitle: string;
}

const CinematicWriterOverlay: React.FC<CinematicWriterOverlayProps> = ({ 
  isOpen, 
  onClose, 
  content, 
  isStreaming,
  chapterTitle 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [metrics, setMetrics] = useState({ tps: 0, stability: 100, sync: 0 });
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [isDecodingImage, setIsDecodingImage] = useState(false);

  // Auto-scroll to bottom with smooth behavior
  useEffect(() => {
    if (scrollRef.current) {
        const scroll = scrollRef.current;
        // Only auto-scroll if near bottom to allow reading up
        const isNearBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 300;
        if (isNearBottom) {
            scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [displayedContent]);

  // Sync Content & Metrics
  useEffect(() => {
    if (!isOpen) return;
    
    setDisplayedContent(content);

    // Detect new images
    const imgMatch = content.match(/!\[.*?\]\((.*?)\)/g);
    if (imgMatch) {
        const lastImgTag = imgMatch[imgMatch.length - 1];
        const urlMatch = lastImgTag.match(/\((.*?)\)/);
        if (urlMatch && urlMatch[1] !== lastImage) {
            setIsDecodingImage(true);
            setTimeout(() => {
                setLastImage(urlMatch[1]);
                setIsDecodingImage(false);
            }, 2000); 
        }
    }

    // Simulate "Thinking" Metrics
    if (isStreaming) {
        const interval = setInterval(() => {
            setMetrics({
                tps: Math.floor(Math.random() * 40) + 90, // Varied speed
                stability: 99 + Math.random() * 1,
                sync: Math.min(100, metrics.sync + 2)
            });
        }, 800);
        return () => clearInterval(interval);
    } else {
        setMetrics(m => ({ ...m, sync: 100, tps: 0 }));
    }

  }, [content, isOpen, isStreaming]);

  if (!isOpen) return null;

  // Render Content with "Materialize" Effect
  const renderContent = () => {
      const parts = displayedContent.split(/(!\[.*?\]\(.*?\))/g);
      return parts.map((part, idx) => {
          if (part.match(/!\[.*?\]\(.*?\)/)) {
              const src = part.match(/\((.*?)\)/)?.[1];
              const alt = part.match(/!\[(.*?)\]/)?.[1] || "Visual Asset";
              if (!src) return null;
              
              const isCurrent = src === lastImage && isDecodingImage;

              return (
                  <div key={idx} className="my-12 w-full flex flex-col items-center">
                      <div className={`
                          relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden transition-all duration-1000 border border-zinc-900
                          ${isCurrent ? 'scale-95 opacity-80 blur-sm' : 'scale-100 opacity-100 blur-0 shadow-2xl'}
                      `}>
                          {isCurrent && (
                              <div className="absolute inset-0 z-10 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center border border-zinc-100/10">
                                  <div className="flex flex-col items-center gap-3">
                                      <IconSparkles className="w-5 h-5 text-zinc-100 animate-spin" />
                                      <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold">Initializing Visual...</span>
                                  </div>
                              </div>
                          )}
                          <img 
                            src={src} 
                            alt={alt}
                            className="w-full h-full object-cover animate-fade-in" 
                          />
                          {/* Cinematic Letterbox Bars */}
                          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none"></div>
                      </div>
                      <span className="mt-4 text-[9px] uppercase tracking-widest text-zinc-700 font-bold">
                          Asset Ref. {idx + 1} — {alt}
                      </span>
                  </div>
              );
          }
          
          // Typography Processing
          return (
            <div key={idx} className="animate-slide-up">
                {part.split('\n').map((line, i) => {
                    if(!line.trim()) return <div key={i} className="h-4"></div>;
                    
                    if (line.startsWith('# ')) 
                        return <h1 key={i} className="text-3xl md:text-4xl font-bold text-zinc-100 mb-6 mt-10 leading-tight tracking-tight uppercase tracking-wider">{line.replace('# ', '')}</h1>;
                    
                    if (line.startsWith('## ')) 
                        return <h2 key={i} className="text-xl md:text-2xl font-bold text-zinc-200 mb-4 mt-8 leading-snug">{line.replace('## ', '')}</h2>;
                    
                    // Render Paragraphs
                    return (
                        <p key={i} className="mb-4 text-base md:text-lg leading-relaxed text-zinc-400 font-medium tracking-normal">
                            {line.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
                                return p1; 
                            })}
                        </p>
                    );
                })}
            </div>
          );
      });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col font-sans">
        
        {/* --- AMBIENT ATMOSPHERE --- */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className={`
                absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100/5 rounded-full blur-[100px] transition-all duration-[2000ms]
                ${isStreaming ? 'opacity-40 scale-110' : 'opacity-10 scale-100'}
            `}></div>
            
            {/* Grain Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
        </div>

        {/* --- TOP BAR --- */}
        <header className="relative z-20 h-16 px-8 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <CoAuthor className="w-8 h-8 bg-zinc-100 shadow-2xl" isActive={isStreaming} />
                </div>
                <div>
                    <h2 className="text-[10px] font-black tracking-[0.2em] text-zinc-100 uppercase">Studio Engine</h2>
                    <div className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${isStreaming ? 'bg-zinc-100 animate-pulse' : 'bg-zinc-800'}`}></span>
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">
                            {isStreaming ? 'Active Composition' : 'Ready'}
                        </p>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="group flex items-center gap-3 px-4 py-1.5 rounded bg-zinc-900 hover:bg-zinc-100 hover:text-zinc-950 border border-zinc-800 transition-all active:scale-95"
            >
                <span className="text-[9px] font-black tracking-widest uppercase">Terminate Session</span>
                <IconX className="w-3.5 h-3.5" />
            </button>
        </header>

        {/* --- MAIN CANVAS --- */}
        <main className="relative z-10 flex-1 overflow-hidden flex justify-center">
            <div 
                ref={scrollRef}
                className="w-full max-w-3xl h-full overflow-y-auto custom-scrollbar px-8 md:px-10 py-16 scroll-smooth"
            >
                {/* Context Tag */}
                <div className="flex justify-center mb-12 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="px-3 py-1 rounded bg-zinc-900/50 border border-zinc-800">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                            Working Document: {chapterTitle}
                        </span>
                    </div>
                </div>

                {/* The Content */}
                <article className="max-w-none">
                    {renderContent()}
                    
                    {/* The "Living" Cursor */}
                    {isStreaming && (
                        <div className="inline-block w-1 h-5 ml-1 bg-zinc-100 opacity-60 animate-pulse align-middle"></div>
                    )}
                </article>

                {/* Bottom Spacer */}
                <div className="h-32"></div>
            </div>
        </main>

        {/* --- FLOATING HUD --- */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="flex items-center gap-8 px-6 py-2.5 bg-zinc-950 border border-zinc-900 rounded shadow-2xl pointer-events-auto transition-all hover:border-zinc-800">
                
                {/* Metric: Speed */}
                <div className="flex items-center gap-3 border-r border-zinc-900 pr-6">
                    <IconFeather className="w-3.5 h-3.5 text-zinc-600" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-100 tabular-nums leading-none">{metrics.tps}</span>
                        <span className="text-[7px] uppercase tracking-widest text-zinc-700 font-black mt-0.5">Tokens/s</span>
                    </div>
                </div>

                {/* Metric: Stability */}
                <div className="flex items-center gap-3 border-r border-zinc-900 pr-6">
                    <IconBrain className="w-3.5 h-3.5 text-zinc-600" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-100 tabular-nums leading-none">{metrics.stability.toFixed(0)}%</span>
                        <span className="text-[7px] uppercase tracking-widest text-zinc-700 font-black mt-0.5">Coherence</span>
                    </div>
                </div>

                {/* Metric: Sync */}
                <div className="flex items-center gap-3">
                    <IconActivity className={`w-3.5 h-3.5 transition-colors ${isStreaming ? 'text-zinc-100' : 'text-zinc-800'}`} />
                    <div className="w-20 h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-zinc-100 transition-all duration-300 ease-out" 
                            style={{ width: `${metrics.sync}%` }}
                        ></div>
                    </div>
                </div>

            </div>
        </div>

    </div>
  );
};

export default CinematicWriterOverlay;
