import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { EBook, User, Seller, UserType } from '../types';
import { 
    IconX, IconChevronLeft, IconChevronRight, 
    IconPlus, IconMinus, IconMenu, 
    IconSun, IconMoon
} from '../constants';
import { Document, Page, pdfjs } from 'react-pdf';
import CoAuthor from '../components/CoAuthor';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

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
                         hasAccess = (currentUser as User).purchaseHistory?.some(b => b.id === bookId);
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
        return () => {
            if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl]);

    // --- HELPERS ---
    const getThemeClasses = () => {
        switch (settings.theme) {
            case 'light': return 'bg-white text-zinc-900 selection:bg-zinc-200';
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
            default: return 'bg-zinc-900/50 border-zinc-800 shadow-3xl';
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
                    <div key={index} className="my-12 flex flex-col items-center group">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950">
                            <img 
                                src={imageMatch[2]} 
                                alt={imageMatch[1]} 
                                className="max-h-[600px] w-auto object-contain transition-transform duration-1000 group-hover:scale-[1.05]" 
                            />
                        </div>
                        {imageMatch[1] && <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-6">{imageMatch[1]}</span>}
                    </div>
                );
            }
            
            return (
                <div key={index} className="whitespace-pre-wrap">
                    {part.split('\n').map((line, i) => {
                        if (!line.trim()) return <div key={i} className="h-8"></div>;

                        if (line.startsWith('# ')) return <h1 key={i} className="text-4xl md:text-6xl font-bold tracking-tight mb-12 mt-16 leading-tight text-current">{line.replace('# ', '')}</h1>
                        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl md:text-4xl font-bold tracking-tight mb-10 mt-12 leading-tight text-current">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="text-xl md:text-2xl font-bold tracking-tight mb-8 mt-10 leading-tight text-current">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- ')) return <li key={i} className="ml-8 list-disc mb-6 pl-4 text-current font-medium">{line.replace('- ', '')}</li>
                        
                        const lineParts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <p key={i} className="mb-8 leading-relaxed text-current font-medium">
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
                <CoAuthor className="w-12 h-12 mb-8 relative z-10" isActive={true} />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 animate-pulse relative z-10">Initializing Studio Reader...</p>
            </div>
        );
    }

    if (!book) return null;

    const pages = book.pages && book.pages.length > 0 ? book.pages : [{ id: '1', title: 'Front Matter', pageNumber: 1, content: "Connection active. Content initializing..." }];
    const currentTextPage = pages[textPageIndex];
    const progress = book.pdfUrl 
        ? Math.round((pageNumber / numPages) * 100)
        : Math.round(((textPageIndex + 1) / pages.length) * 100);

    return (
        <div className={cn("min-h-screen w-full flex flex-col fixed inset-0 z-50 transition-colors duration-1000", getThemeClasses())}>
            
            <header className={cn(
                "h-14 flex items-center justify-between px-8 border-b z-40 relative backdrop-blur-xl transition-all duration-500",
                settings.theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : settings.theme === 'light' ? 'bg-white/60 border-zinc-100' : 'bg-[#f4ecd8]/60 border-[#5b4636]/10'
            )}>
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(-1)} 
                        className="rounded-md hover:bg-zinc-800/50 transition-all w-8 h-8 text-current"
                    >
                        <IconX className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSidebar(true)} 
                        className="rounded-md hover:bg-zinc-800/50 transition-all w-8 h-8 text-current"
                    >
                         <IconMenu className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </Button>
                    <Separator orientation="vertical" className="h-4 bg-zinc-800" />
                    <h1 className="text-[10px] font-bold uppercase tracking-widest truncate text-current opacity-60">{book.title}</h1>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                    {!book.pdfUrl && (
                        <div className="relative">
                            <Button 
                                variant="ghost"
                                onClick={() => setShowSettings(!showSettings)}
                                className={cn(
                                    "h-8 px-3 rounded-md border transition-all text-current",
                                    showSettings ? 'bg-zinc-800 border-zinc-700' : 'bg-transparent border-transparent'
                                )}
                            >
                                <span className="font-bold text-xs uppercase tracking-widest">Aa</span>
                            </Button>
                            
                            {showSettings && (
                                <div className={cn(
                                    "absolute top-12 right-0 w-72 p-8 rounded-xl shadow-2xl border animate-fade-in origin-top-right z-50 backdrop-blur-3xl",
                                    settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-100 text-zinc-900'
                                )}>
                                    <div className="mb-8">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Reader Theme</p>
                                        <Tabs value={settings.theme} onValueChange={(v: any) => setSettings(prev => ({ ...prev, theme: v }))}>
                                            <TabsList className="bg-zinc-950/50 w-full h-10 p-1 rounded-md border border-zinc-800">
                                                <TabsTrigger value="light" className="flex-1 rounded text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950">Light</TabsTrigger>
                                                <TabsTrigger value="sepia" className="flex-1 rounded text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-[#f4ecd8] data-[state=active]:text-[#5b4636]">Sepia</TabsTrigger>
                                                <TabsTrigger value="dark" className="flex-1 rounded text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950">Dark</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Typography</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'sans', label: 'Sans', font: 'font-sans' },
                                                { id: 'serif', label: 'Serif', font: 'font-serif italic' },
                                                { id: 'mono', label: 'Mono', font: 'font-mono' },
                                            ].map(f => (
                                                <button 
                                                    key={f.id}
                                                    onClick={() => setSettings(prev => ({ ...prev, fontFamily: f.id as FontFamily }))}
                                                    className={cn(
                                                        "h-10 border rounded-md text-[9px] font-bold uppercase tracking-widest transition-all",
                                                        f.font,
                                                        settings.fontFamily === f.id ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-xl' : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                                    )}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Text Size</p>
                                            <span className="text-[10px] font-bold font-mono text-zinc-300">{settings.fontSize}PX</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="ghost" size="icon" onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }))} className="h-8 w-8 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-100"><IconMinus className="w-3 h-3"/></Button>
                                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                 <div className="h-full bg-zinc-400 transition-all" style={{ width: `${((settings.fontSize - 12) / 20) * 100}%` }} />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 1) }))} className="h-8 w-8 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-100"><IconPlus className="w-3 h-3"/></Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-md border border-current/10 bg-current/5">
                        <span className="text-[9px] font-bold uppercase tracking-widest tabular-nums text-current opacity-60">{progress}%</span>
                        <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {showSidebar && (
                <div className="fixed inset-0 z-[60] flex animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowSidebar(false)}></div>
                    <div className={cn(
                        "relative w-80 h-full shadow-2xl flex flex-col animate-slide-right border-r backdrop-blur-xl",
                        settings.theme === 'dark' ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-zinc-100'
                    )}>
                        <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Contents</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="h-8 w-8 rounded-md hover:bg-zinc-800/50 text-zinc-500"><IconX className="w-4 h-4"/></Button>
                        </div>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-2">
                                {pages.map((p, idx) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setTextPageIndex(idx);
                                            setShowSidebar(false);
                                            contentRef.current?.scrollTo(0,0);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-md transition-all border group",
                                            textPageIndex === idx 
                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-xl' 
                                            : 'bg-transparent border-transparent hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-100'
                                        )}
                                    >
                                        <span className="text-[8px] font-bold uppercase tracking-widest block mb-1 opacity-40">Section {idx + 1}</span>
                                        <span className="text-sm font-bold tracking-tight">{p.title}</span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}

            <main className="flex-1 relative overflow-hidden flex flex-col pb-24"> 
                {book.pdfUrl && pdfBlobUrl ? (
                    <div className="flex-1 relative bg-zinc-950 overflow-auto flex justify-center p-8 md:p-12 custom-scrollbar pb-32">
                        <div className="shadow-2xl border border-zinc-800 transition-transform duration-1000 origin-top" style={{ transform: `scale(${scale})` }}>
                            <Document
                                file={pdfBlobUrl}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={<div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 p-20">Loading stream...</div>}
                                error={<div className="text-[10px] font-bold uppercase tracking-widest text-red-500 p-20">Stream unavailable</div>}
                            >
                                <Page 
                                    pageNumber={pageNumber} 
                                    scale={1} 
                                    className="shadow-2xl"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                        </div>
                        
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-lg flex items-center gap-4 shadow-2xl z-40">
                             <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="h-8 w-8 rounded-md hover:bg-zinc-800 text-zinc-100 disabled:opacity-20"><IconChevronLeft className="w-4 h-4"/></Button>
                             <span className="text-[9px] font-bold uppercase tracking-widest tabular-nums text-zinc-100">{pageNumber} / {numPages}</span>
                             <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="h-8 w-8 rounded-md hover:bg-zinc-800 text-zinc-100 disabled:opacity-20"><IconChevronRight className="w-4 h-4"/></Button>
                             <Separator orientation="vertical" className="h-4 bg-zinc-800" />
                             <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="h-8 w-8 rounded-md hover:bg-zinc-800 text-zinc-100"><IconMinus className="w-3 h-3"/></Button>
                             <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))} className="h-8 w-8 rounded-md hover:bg-zinc-800 text-zinc-100"><IconPlus className="w-3 h-3"/></Button>
                        </div>
                    </div>
                ) : (
                    <ScrollArea ref={contentRef} className="flex-1">
                        <div className="max-w-3xl mx-auto py-24 px-8">
                            
                            <div className={cn(
                                "min-h-[calc(100vh-300px)] p-8 md:p-20 rounded-3xl transition-all duration-1000 border relative overflow-hidden",
                                getPageThemeClasses()
                            )}>
                                <div className="mb-20 text-center pb-12 border-b border-current/10">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest mb-6 opacity-40">Chapter {textPageIndex + 1}</h4>
                                    <h2 className={cn(
                                        "text-4xl md:text-5xl font-bold tracking-tight leading-tight text-current",
                                        settings.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                                    )}>
                                        {currentTextPage.title}
                                    </h2>
                                </div>

                                <article 
                                    className={cn("prose prose-zinc max-w-none transition-all duration-1000", getFontFamily())}
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

                                <div className="mt-24 pt-12 border-t border-current/10 flex justify-between items-center">
                                     <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 text-current">{book.title}</span>
                                     <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 text-current">{textPageIndex + 1} / {pages.length}</span>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </main>

            {!book.pdfUrl && (
                <div className={cn(
                    "fixed bottom-0 left-0 right-0 p-6 border-t z-50 backdrop-blur-xl transition-all duration-500",
                    settings.theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : settings.theme === 'light' ? 'bg-white/60 border-zinc-100' : 'bg-[#f4ecd8]/60 border-[#5b4636]/10'
                )}>
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-8">
                        <Button 
                            variant="ghost"
                            onClick={() => {
                                if (textPageIndex > 0) {
                                    setTextPageIndex(p => p - 1);
                                    contentRef.current?.scrollTo(0,0);
                                }
                            }}
                            disabled={textPageIndex === 0}
                            className="flex-1 h-12 rounded-md bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 group transition-all text-current disabled:opacity-20"
                        >
                            <IconChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Previous Chapter</span>
                        </Button>

                        <div className="text-[9px] font-bold uppercase tracking-widest tabular-nums text-current opacity-40">
                            {textPageIndex + 1} / {pages.length}
                        </div>

                        <Button 
                            variant="ghost"
                            onClick={() => {
                                if (textPageIndex < pages.length - 1) {
                                    setTextPageIndex(p => p + 1);
                                    contentRef.current?.scrollTo(0,0);
                                }
                            }}
                            disabled={textPageIndex === pages.length - 1}
                            className="flex-1 h-12 rounded-md bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 group transition-all text-current disabled:opacity-20"
                        >
                            <span className="text-[9px] font-bold uppercase tracking-widest">Next Chapter</span>
                            <IconChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EbookReaderPage;
