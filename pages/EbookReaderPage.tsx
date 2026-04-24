import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { EBook, User, Seller, UserType } from '../types';
import { 
    IconX, IconChevronLeft, IconChevronRight, 
    IconPlus, IconMinus, IconMenu, 
    IconSun, IconMoon, IconSparkles
} from '../constants';
import { Document, Page, pdfjs } from 'react-pdf';
import CoAuthor from '../components/CoAuthor';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const { useParams, useNavigate } = ReactRouterDOM as any;

// PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// --- READER SETTINGS TYPES ---
type ReaderTheme = 'dark' | 'light' | 'sepia';
type FontFamily = 'sans' | 'serif' | 'mono';

interface ReaderSettings {
    theme: ReaderTheme;
    fontSize: number;
    lineHeight: number;
    fontFamily: FontFamily;
}

const EbookReaderPage: React.FC = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userType, allBooks } = useAppContext();
    
    // Data State
    const [book, setBook] = useState<EBook | null>(null);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [showSidebar, setShowSidebar] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [scrolled, setScrolled] = useState(0);
    const [settings, setSettings] = useState<ReaderSettings>({
        theme: 'dark',
        fontSize: 18,
        lineHeight: 1.8,
        fontFamily: 'serif'
    });

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    // Text Reader State
    const [textPageIndex, setTextPageIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const loadBook = async () => {
            if (!bookId) return;
            setLoading(true);

            // Find Book Logic
            let foundBook = allBooks.find(b => b.id === bookId);
            
            // Manual fallback for demo/manual-01
            if (bookId === 'manual-01' && !foundBook) {
                foundBook = {
                    id: 'manual-01',
                    title: 'Studio Authorship Manual',
                    author: 'EbookStudio Intelligence',
                    price: 0,
                    category: 'System',
                    coverUrl: '',
                    pages: [
                        { 
                            id: '1', 
                            title: 'The Architecture of Thought', 
                            content: `# The Architecture of Thought\n\nWelcome to the official manual of EbookStudio. This guide will walk you through the advanced mechanics of digital authorship.\n\n## 1. Cinematic Storytelling\nYour narratives should breathe. Use the power of AI to expand your world-building while maintaining the core human essence of your story. The interaction between human intent and machine precision creates a new genre of literature.\n\n## 2. High-Fidelity Distribution\nEvery publication on this platform is a high-fidelity digital asset. We ensure that your intellectual property is preserved with the highest standards of encryption.\n\n### Core Pillars:\n- **Authenticity**: Your voice, amplified.\n- **Precision**: Every word counts.\n- **Aesthetic**: Design as part of the story.\n\n## 3. The Digital Canvas\nThink beyond the page. In EbookStudio, every chapter is a canvas. Use markdown to structure your thoughts and AI agents to populate the details. The future of books is not just text; it is an experience.\n\n### Optimization Tips:\n1. Use clear, evocative titles for your chapters.\n2. Keep your audience engaged with dynamic pacing.\n3. Utilize the Co-Author sidebar for real-time creative brainstorming.\n\nScroll down to begin your journey into the future of publishing.` 
                        },
                        { 
                            id: '2', 
                            title: 'Market Alignment & Distribution', 
                            content: `# Market Alignment\n\nUnderstanding your audience is the first step towards a successful publication. The EbookStudio marketplace uses advanced indexing to match your content with the right readers.\n\n## The Niche Spectrum\nIn the digital age, broad appeal is often less effective than deep resonance. Focus on a specific architectural insight or narrative archetype.\n\n### Strategies:\n- **Identify Gaps**: What stories are NOT being told?\n- **Emotional Mapping**: What does your reader want to feel?\n- **Visual Identity**: Matching your cover art to the emotional tone.\n\n## Revenue Mechanics\nOur 70/30 split ensures that writers remain the primary beneficiaries of their creative output. Payouts are automated via Razorpay X, providing instant liquidity as soon as a sale is verified.\n\n### Financial Pillars:\n- **Instant Payouts**: No waiting periods.\n- **Global Reach**: Accept payments in multiple currencies.\n- **Transparent Ledger**: Track every sale in your Writer Dashboard.` 
                        }
                    ]
                } as any;
            }

            if (!foundBook && currentUser) {
                 if (userType === UserType.SELLER) {
                     foundBook = (currentUser as Seller).uploadedBooks?.find(b => b.id === bookId);
                 } else if (userType === UserType.USER) {
                     foundBook = (currentUser as User).purchaseHistory?.find(b => b.id === bookId);
                 }
            }

            if (foundBook) {
                 // Access Logic
                 const isFree = foundBook.price === 0;
                 let hasAccess = isFree;

                 if (!hasAccess && currentUser) {
                      if (userType === UserType.SELLER) {
                          hasAccess = foundBook.sellerId === currentUser.id; 
                      } else if (userType === UserType.USER) {
                          const user = currentUser as User;
                          hasAccess = user.purchaseHistory?.some(b => b.id === bookId) || user.purchasedBookIds?.includes(bookId || '');
                      }
                  }
                 
                 if (hasAccess) {
                     setBook(foundBook);
                     if (foundBook.pdfUrl) {
                         try {
                             const res = await fetch(foundBook.pdfUrl);
                             const blob = await res.blob();
                             const blobUrl = URL.createObjectURL(blob);
                             setPdfBlobUrl(blobUrl);
                         } catch (e) {
                             setPdfBlobUrl(foundBook.pdfUrl);
                         }
                     }
                 } else {
                     if (!currentUser && !isFree) {
                         navigate('/login');
                         return;
                     } else if (currentUser) {
                         alert("Access denied. Please purchase this book.");
                         navigate('/store');
                         return;
                     }
                 }
            }
            setLoading(false);
        };
        loadBook();
    }, [bookId, currentUser, userType, navigate, allBooks]);

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const totalHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
                const progress = totalHeight > 0 ? (contentRef.current.scrollTop / totalHeight) * 100 : 0;
                setScrolled(progress);
            }
        };

        const currentRef = contentRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
            if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl, loading]);

    // --- HELPERS ---
    const getThemeClasses = () => {
        switch (settings.theme) {
            case 'light': return 'bg-[#fafafa] text-zinc-900 selection:bg-zinc-950/10';
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636] selection:bg-[#d6cbb1]';
            case 'dark': 
            default: return 'bg-zinc-950 text-zinc-300 selection:bg-zinc-100/10';
        }
    };
    
    const getPageThemeClasses = () => {
         switch (settings.theme) {
            case 'light': return 'bg-white shadow-2xl border-zinc-100';
            case 'sepia': return 'bg-[#faf4e8] shadow-2xl border-[#e3d8c4]';
            case 'dark': 
            default: return 'bg-zinc-900/40 border-zinc-800/50 shadow-3xl backdrop-blur-xl';
        }
    };

    const getFontFamily = () => {
        switch (settings.fontFamily) {
            case 'sans': return 'font-sans';
            case 'mono': return 'font-mono';
            case 'serif': 
            default: return 'font-serif';
        }
    };

    // --- MARKDOWN RENDERER ---
    const renderMarkdownContent = (content: string) => {
        const parts = content.split(/(!\[.*?\]\(.*?\))/g);
        
        return parts.map((part, index) => {
            const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
            if (imageMatch) {
                return (
                    <div key={index} className="my-16 flex flex-col items-center group">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950">
                            <img 
                                src={imageMatch[2]} 
                                alt={imageMatch[1]} 
                                className="max-w-[200px] md:max-w-none md:max-h-[700px] w-auto object-contain transition-transform duration-1000 group-hover:scale-[1.03]" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </div>
                        {imageMatch[1] && <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-8">{imageMatch[1]}</span>}
                    </div>
                );
            }
            
            return (
                <div key={index} className="whitespace-pre-wrap">
                    {part.split('\n').map((line, i) => {
                        if (!line.trim()) return <div key={i} className="h-10"></div>;

                        if (line.startsWith('# ')) return <h1 key={i} className="text-5xl md:text-7xl font-bold tracking-tight mb-16 mt-20 leading-tight text-current">{line.replace('# ', '')}</h1>
                        if (line.startsWith('## ')) return <h2 key={i} className="text-3xl md:text-5xl font-bold tracking-tight mb-12 mt-16 leading-tight text-current">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="text-2xl md:text-3xl font-bold tracking-tight mb-10 mt-12 leading-tight text-current">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- ')) return <li key={i} className="ml-8 list-disc mb-6 pl-4 text-current/90 font-medium">{line.replace('- ', '')}</li>
                        
                        const lineParts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <p key={i} className="mb-10 leading-[1.9] text-current/90 font-medium">
                                {lineParts.map((sub, j) => {
                                    if (sub.startsWith('**') && sub.endsWith('**')) {
                                        return <strong key={j} className="font-bold text-current">{sub.slice(2, -2)}</strong>;
                                    }
                                    return sub;
                                })}
                            </p>
                        )
                    })}
                </div>
            );
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
                <CoAuthor className="w-16 h-16 mb-12 relative z-10" isActive={true} />
                <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden mb-4">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-zinc-100" 
                    />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 relative z-10">Initializing High-Fidelity Reader...</p>
            </div>
        );
    }

    if (!book) return null;

    const pages = book.pages && book.pages.length > 0 ? book.pages : [{ id: '1', title: 'Front Matter', pageNumber: 1, content: "Connection active. Content initializing..." }];
    const currentTextPage = pages[textPageIndex];
    const progressValue = book.pdfUrl 
        ? Math.round((pageNumber / numPages) * 100)
        : Math.round(((textPageIndex + 1) / pages.length) * 100);

    return (
        <div className={cn("h-screen w-full flex flex-col relative transition-colors duration-1000 overflow-hidden", getThemeClasses())}>
            
            {/* Cinematic Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-100/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            <header className={cn(
                "fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-50 transition-all duration-500",
                scrolled > 2 ? 'bg-zinc-950/60 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'
            )}>
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-zinc-100 transition-all hover:bg-zinc-900"
                    >
                        <IconX className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setShowSidebar(true)} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-zinc-100 transition-all hover:bg-zinc-900"
                    >
                         <IconMenu className="w-4 h-4" />
                    </button>
                    <Separator orientation="vertical" className="h-6 bg-zinc-800/50" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-0.5">Now Reading</span>
                        <h1 className="text-[10px] font-black uppercase tracking-widest truncate text-zinc-100 max-w-[200px]">{book.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                    {!book.pdfUrl && (
                        <div className="relative">
                            <button 
                                onClick={() => setShowSettings(!showSettings)}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl border transition-all",
                                    showSettings ? 'bg-zinc-100 border-zinc-100 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-zinc-100'
                                )}
                            >
                                <span className="font-black text-[10px] uppercase tracking-widest">Aa</span>
                            </button>
                            
                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={cn(
                                            "absolute top-14 right-0 w-80 p-8 rounded-2xl shadow-3xl border z-50 backdrop-blur-3xl",
                                            settings.theme === 'dark' ? 'bg-zinc-900/90 border-white/10 text-zinc-100' : 'bg-white/90 border-zinc-200 text-zinc-900'
                                        )}
                                    >
                                        <div className="mb-8">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4">Aesthetic Theme</p>
                                            <Tabs value={settings.theme} onValueChange={(v: any) => setSettings(prev => ({ ...prev, theme: v }))}>
                                                <TabsList className="bg-zinc-950/50 w-full h-11 p-1 rounded-xl border border-white/5">
                                                    <TabsTrigger value="light" className="flex-1 rounded-lg text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950">Light</TabsTrigger>
                                                    <TabsTrigger value="sepia" className="flex-1 rounded-lg text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-[#f4ecd8] data-[state=active]:text-[#5b4636]">Sepia</TabsTrigger>
                                                    <TabsTrigger value="dark" className="flex-1 rounded-lg text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950">Dark</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>

                                        <div className="mb-8">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4">Typography</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'sans', label: 'Sans', font: 'font-sans' },
                                                    { id: 'serif', label: 'Serif', font: 'font-serif italic' },
                                                    { id: 'mono', label: 'Mono', font: 'font-mono' },
                                                ].map(f => (
                                                    <button 
                                                        key={f.id}
                                                        onClick={() => setSettings(prev => ({ ...prev, fontFamily: f.id as FontFamily }))}
                                                        className={cn(
                                                            "h-12 border rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
                                                            f.font,
                                                            settings.fontFamily === f.id ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-xl' : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:bg-zinc-800'
                                                        )}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">Optical Scaling</p>
                                                <span className="text-[10px] font-black font-mono text-zinc-300">{settings.fontSize}PX</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }))} className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-zinc-100 flex items-center justify-center"><IconMinus className="w-3 h-3"/></button>
                                                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                     <div className="h-full bg-zinc-100 transition-all" style={{ width: `${((settings.fontSize - 12) / 20) * 100}%` }} />
                                                </div>
                                                <button onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 1) }))} className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-zinc-100 flex items-center justify-center"><IconPlus className="w-3 h-3"/></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    
                    <div className="hidden md:flex items-center gap-4 px-5 py-2 rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-md">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] tabular-nums text-zinc-100">{progressValue}%</span>
                        <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-100 shadow-[0_0_10px_white] transition-all duration-1000" style={{ width: `${progressValue}%` }}></div>
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {showSidebar && (
                    <div className="fixed inset-0 z-[60] flex">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                            onClick={() => setShowSidebar(false)} 
                        />
                        <motion.div 
                            initial={{ x: -400 }}
                            animate={{ x: 0 }}
                            exit={{ x: -400 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className={cn(
                                "relative w-96 h-full shadow-3xl flex flex-col border-r backdrop-blur-3xl",
                                settings.theme === 'dark' ? 'bg-zinc-950/90 border-white/10' : 'bg-white/90 border-zinc-200'
                            )}
                        >
                            <div className="p-10 border-b border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-100">Manifest Contents</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{pages.length} Sections available</p>
                                </div>
                                <button onClick={() => setShowSidebar(false)} className="w-10 h-10 rounded-xl hover:bg-zinc-900 transition-all flex items-center justify-center text-zinc-500"><IconX className="w-5 h-5"/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="space-y-3">
                                    {pages.map((p, idx) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setTextPageIndex(idx);
                                                setShowSidebar(false);
                                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={cn(
                                                "w-full text-left px-6 py-5 rounded-2xl transition-all border group",
                                                textPageIndex === idx 
                                                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-2xl' 
                                                : 'bg-transparent border-transparent hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-100'
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn(
                                                    "text-[8px] font-bold uppercase tracking-[0.3em] opacity-40",
                                                    textPageIndex === idx ? 'text-zinc-950' : 'text-zinc-500'
                                                )}>Section {idx + 1}</span>
                                                {textPageIndex === idx && <IconSparkles className="w-3 h-3 text-zinc-950" />}
                                            </div>
                                            <span className="text-sm font-bold tracking-tight">{p.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <main className="flex-1 relative z-10 flex flex-col pt-16"> 
                {book.pdfUrl && pdfBlobUrl ? (
                    <div className="flex-1 relative bg-zinc-950 overflow-y-auto flex justify-center p-8 md:p-20 custom-scrollbar pb-40">
                        <div className="shadow-3xl border border-zinc-800 transition-transform duration-1000 origin-top bg-white" style={{ transform: `scale(${scale})` }}>
                            <Document
                                file={pdfBlobUrl}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={<div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 p-40">Decrypting Stream...</div>}
                                error={<div className="text-[10px] font-bold uppercase tracking-widest text-red-500 p-40">Stream Forbidden</div>}
                            >
                                <Page 
                                    pageNumber={pageNumber} 
                                    scale={1} 
                                    className="shadow-3xl"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                        </div>
                        
                        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-2xl border border-white/5 p-3 rounded-2xl flex items-center gap-6 shadow-3xl z-40">
                             <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="w-10 h-10 rounded-xl hover:bg-zinc-800 text-zinc-100 disabled:opacity-20 transition-all flex items-center justify-center"><IconChevronLeft className="w-5 h-5"/></button>
                             <div className="flex flex-col items-center px-4">
                                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-1">Index</span>
                                <span className="text-xs font-black tracking-widest tabular-nums text-zinc-100">{pageNumber} / {numPages}</span>
                             </div>
                             <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="w-10 h-10 rounded-xl hover:bg-zinc-800 text-zinc-100 disabled:opacity-20 transition-all flex items-center justify-center"><IconChevronRight className="w-5 h-5"/></button>
                             <Separator orientation="vertical" className="h-8 bg-zinc-800/50" />
                             <div className="flex items-center gap-2">
                                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="w-10 h-10 rounded-xl hover:bg-zinc-800 text-zinc-100 transition-all flex items-center justify-center"><IconMinus className="w-4 h-4"/></button>
                                <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="w-10 h-10 rounded-xl hover:bg-zinc-800 text-zinc-100 transition-all flex items-center justify-center"><IconPlus className="w-4 h-4"/></button>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="max-w-4xl mx-auto py-24 md:py-32 px-4 md:px-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1 }}
                                className={cn(
                                    "min-h-[calc(100vh-400px)] p-6 md:p-24 rounded-3xl md:rounded-[3rem] transition-all duration-1000 border relative overflow-hidden",
                                    getPageThemeClasses()
                                )}
                            >
                                {/* Page Accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100/5 blur-[80px] rounded-full pointer-events-none" />

                                <div className="mb-24 text-center pb-16 border-b border-current/10">
                                    <div className="flex items-center justify-center gap-3 mb-8">
                                        <div className="w-12 h-px bg-current/20" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Chapter {textPageIndex + 1}</h4>
                                        <div className="w-12 h-px bg-current/20" />
                                    </div>
                                    <h2 className={cn(
                                        "text-5xl md:text-7xl font-bold tracking-tight leading-tight text-current",
                                        settings.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                                    )}>
                                        {currentTextPage.title}
                                    </h2>
                                </div>

                                <article 
                                    className={cn("prose prose-zinc max-w-prose mx-auto transition-all duration-1000", getFontFamily())}
                                    style={{ 
                                        fontSize: `${settings.fontSize}px`, 
                                        lineHeight: settings.lineHeight,
                                        color: 'currentColor' 
                                    }}
                                >
                                    <div className="opacity-90">
                                        {renderMarkdownContent(currentTextPage.content || "Connection active. Content pending...")}
                                    </div>
                                </article>

                                <div className="mt-32 pt-16 border-t border-current/10 flex justify-between items-center">
                                     <div className="flex flex-col">
                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 text-current">{book.title}</span>
                                        <span className="text-[7px] font-medium uppercase tracking-[0.1em] opacity-20 text-current mt-1">EbookStudio Intelligent Distribution</span>
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black tabular-nums text-current opacity-60">{textPageIndex + 1} / {pages.length}</span>
                                     </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Floating Footer Controls for Text Reader */}
                        {!book.pdfUrl && (
                            <div className="sticky bottom-12 left-0 right-0 z-50 pointer-events-none flex justify-center pb-12">
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={cn(
                                        "pointer-events-auto flex items-center gap-8 p-3 rounded-2xl border backdrop-blur-2xl shadow-3xl",
                                        settings.theme === 'dark' ? 'bg-zinc-900/80 border-white/5' : 'bg-white/80 border-zinc-200'
                                    )}
                                >
                                    <button 
                                        onClick={() => {
                                            if (textPageIndex > 0) {
                                                setTextPageIndex(p => p - 1);
                                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={textPageIndex === 0}
                                        className="w-14 h-14 rounded-xl bg-zinc-950/50 border border-white/5 text-zinc-100 hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-10 transition-all flex items-center justify-center group"
                                    >
                                        <IconChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                    </button>

                                    <div className="flex flex-col items-center min-w-[80px]">
                                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Chapter</span>
                                        <span className="text-xs font-black tabular-nums text-zinc-100">{textPageIndex + 1} / {pages.length}</span>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            if (textPageIndex < pages.length - 1) {
                                                setTextPageIndex(p => p + 1);
                                                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={textPageIndex === pages.length - 1}
                                        className="w-14 h-14 rounded-xl bg-zinc-950/50 border border-white/5 text-zinc-100 hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-10 transition-all flex items-center justify-center group"
                                    >
                                        <IconChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default EbookReaderPage;
