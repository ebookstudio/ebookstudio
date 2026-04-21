
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
import MorphicEye from '../components/MorphicEye';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
            case 'light': return 'bg-[#f8f9fa] text-neutral-900 selection:bg-yellow-200';
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636] selection:bg-[#d6cbb1]';
            case 'dark': 
            default: return 'bg-[#000000] text-[#d4d4d4] selection:bg-white/20';
        }
    };
    
    const getPageThemeClasses = () => {
         switch (settings.theme) {
            case 'light': return 'bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] border-neutral-200';
            case 'sepia': return 'bg-[#faf4e8] shadow-[0_0_50px_rgba(91,70,54,0.1)] border-[#e3d8c4]';
            case 'dark': 
            default: return 'bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-white/5';
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
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                            <img 
                                src={imageMatch[2]} 
                                alt={imageMatch[1]} 
                                className="max-h-[600px] w-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]" 
                            />
                        </div>
                        {imageMatch[1] && <span className="type-tiny mt-6">{imageMatch[1]}</span>}
                    </div>
                );
            }
            
            return (
                <div key={index} className="whitespace-pre-wrap">
                    {part.split('\n').map((line, i) => {
                        if (!line.trim()) return <div key={i} className="h-6"></div>;

                        if (line.startsWith('# ')) return <h1 key={i} className="type-display text-4xl md:text-6xl mb-10 mt-12 leading-none text-current">{line.replace('# ', '')}</h1>
                        if (line.startsWith('## ')) return <h2 key={i} className="type-display text-2xl md:text-4xl mb-8 mt-10 leading-tight opacity-90 text-current">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="type-display text-xl md:text-2xl mb-6 mt-8 leading-tight opacity-80 text-current">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- ')) return <li key={i} className="ml-8 list-disc mb-4 pl-2 text-current">{line.replace('- ', '')}</li>
                        
                        const lineParts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <p key={i} className="mb-6 leading-relaxed text-current">
                                {lineParts.map((sub, j) => {
                                    if (sub.startsWith('**') && sub.endsWith('**')) {
                                        return <strong key={j} className="font-black text-current">{sub.slice(2, -2)}</strong>;
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-matrix opacity-20"></div>
                <MorphicEye className="w-16 h-16 mb-8" />
                <p className="type-tiny animate-pulse">Initializing Reader Protocol...</p>
            </div>
        );
    }

    if (!book) return null;

    const pages = book.pages && book.pages.length > 0 ? book.pages : [{ id: '1', title: 'Cover', pageNumber: 1, content: "No content available." }];
    const currentTextPage = pages[textPageIndex];
    const progress = book.pdfUrl 
        ? Math.round((pageNumber / numPages) * 100)
        : Math.round(((textPageIndex + 1) / pages.length) * 100);

    return (
        <div className={`min-h-screen w-full flex flex-col fixed inset-0 z-50 transition-colors duration-500 ${getThemeClasses()}`}>
            
            {/* === HEADER (Sovereign Interface) === */}
            <header className={`
                h-20 flex items-center justify-between px-6 md:px-12 border-b z-40 relative backdrop-blur-3xl transition-colors duration-300
                ${settings.theme === 'dark' ? 'bg-black/80 border-white/10' : settings.theme === 'light' ? 'bg-white/80 border-black/5' : 'bg-[#f4ecd8]/80 border-[#5b4636]/10'}
            `}>
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(-1)} 
                        className="rounded-full hover:bg-black/5 transition-all"
                    >
                        <IconX className="w-5 h-5 opacity-60" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSidebar(true)} 
                        className="rounded-full hover:bg-black/5 transition-all"
                    >
                         <IconMenu className="w-5 h-5 opacity-60" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2 opacity-10" />
                    <h1 className="type-tiny truncate flex-1 min-w-0">{book.title}</h1>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                    {!book.pdfUrl && (
                        <div className="relative">
                            <Button 
                                variant="ghost"
                                onClick={() => setShowSettings(!showSettings)}
                                className={`rounded-full border ${showSettings ? 'bg-black/5 border-white/10' : 'bg-transparent border-transparent'}`}
                            >
                                <span className="font-display font-black text-xl">Aa</span>
                            </Button>
                            
                            {/* Settings Dropdown */}
                            {showSettings && (
                                <div className={`absolute top-16 right-0 w-80 p-8 rounded-[32px] shadow-2xl border animate-slide-up origin-top-right z-50 glass-panel-heavy
                                    ${settings.theme === 'dark' ? 'text-white' : 'text-neutral-900'}
                                `}>
                                    {/* Theme */}
                                    <div className="mb-10">
                                        <p className="type-tiny mb-4">Aesthetic Protocol</p>
                                        <Tabs value={settings.theme} onValueChange={(v: any) => setSettings(prev => ({ ...prev, theme: v }))}>
                                            <TabsList className="bg-black/20 w-full h-12 p-1 rounded-full border border-white/5">
                                                <TabsTrigger value="light" className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Light</TabsTrigger>
                                                <TabsTrigger value="sepia" className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-[#f4ecd8] data-[state=active]:text-[#5b4636]">Sepia</TabsTrigger>
                                                <TabsTrigger value="dark" className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Dark</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>

                                    {/* Font Family */}
                                    <div className="mb-10">
                                        <p className="type-tiny mb-4">Typography</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'sans', label: 'Sans', font: 'font-sans' },
                                                { id: 'serif', label: 'Serif', font: 'font-serif' },
                                                { id: 'mono', label: 'Mono', font: 'font-mono' },
                                            ].map(f => (
                                                <button 
                                                    key={f.id}
                                                    onClick={() => setSettings(prev => ({ ...prev, fontFamily: f.id as FontFamily }))}
                                                    className={`py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all ${f.font}
                                                        ${settings.fontFamily === f.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}
                                                    `}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Size */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="type-tiny">Scale</p>
                                            <span className="text-xs font-black font-mono">{settings.fontSize}PX</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" size="icon" onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }))} className="rounded-full border-white/10 hover:bg-white/5"><IconMinus className="w-4 h-4"/></Button>
                                            <ScrollArea className="flex-1 h-1 bg-white/10 rounded-full">
                                                 <div className="h-full bg-white transition-all" style={{ width: `${((settings.fontSize - 12) / 20) * 100}%` }} />
                                            </ScrollArea>
                                            <Button variant="outline" size="icon" onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 1) }))} className="rounded-full border-white/10 hover:bg-white/5"><IconPlus className="w-4 h-4"/></Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Progress Indicator */}
                    <div className="hidden md:flex items-center gap-4 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                        <span className="type-tiny tabular-nums">{progress}%</span>
                        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-current transition-all duration-700" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* === SIDEBAR (Table of Contents) === */}
            {showSidebar && (
                <div className="fixed inset-0 z-[60] flex">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowSidebar(false)}></div>
                    <div className={`relative w-[400px] h-full shadow-2xl flex flex-col animate-slide-right border-r glass-panel-heavy`}>
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <h3 className="type-tiny">Neural Archive / Chapters</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="rounded-full hover:bg-white/5"><IconX className="w-5 h-5"/></Button>
                        </div>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-3">
                                {pages.map((p, idx) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setTextPageIndex(idx);
                                            setShowSidebar(false);
                                            contentRef.current?.scrollTo(0,0);
                                        }}
                                        className={`w-full text-left p-8 rounded-3xl transition-all border ${
                                            textPageIndex === idx 
                                            ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' 
                                            : 'bg-transparent border-transparent hover:bg-white/5 text-zinc-500 hover:text-white'
                                        }`}
                                    >
                                        <span className="type-tiny block mb-2 opacity-50">NODE {idx + 1}</span>
                                        <span className="type-display text-xl">{p.title}</span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}

            {/* === MAIN CONTENT === */}
            <main className="flex-1 relative overflow-hidden flex flex-col pb-32"> 
                
                {/* --- PDF MODE --- */}
                {book.pdfUrl && pdfBlobUrl ? (
                    <div className="flex-1 relative bg-black/50 overflow-auto flex justify-center p-6 md:p-16 custom-scrollbar pb-40">
                        <div className={`shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 transition-transform origin-top`} style={{ transform: `scale(${scale})` }}>
                            <Document
                                file={pdfBlobUrl}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={<div className="type-tiny p-20">Synchronizing PDF Stream...</div>}
                                error={<div className="type-tiny p-20 text-rose-500">Stream Corruption Error</div>}
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
                        
                        {/* Floating PDF Controls */}
                        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-3xl border border-white/10 p-4 rounded-full flex items-center gap-6 shadow-2xl z-40">
                             <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="rounded-full hover:bg-white/10"><IconChevronLeft className="w-5 h-5"/></Button>
                             <span className="type-tiny tabular-nums">{pageNumber} / {numPages}</span>
                             <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="rounded-full hover:bg-white/10"><IconChevronRight className="w-5 h-5"/></Button>
                             <Separator orientation="vertical" className="h-6 bg-white/10" />
                             <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="rounded-full hover:bg-white/10"><IconMinus className="w-4 h-4"/></Button>
                             <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))} className="rounded-full hover:bg-white/10"><IconPlus className="w-4 h-4"/></Button>
                        </div>
                    </div>
                ) : (
                    /* --- TEXT MODE --- */
                    <ScrollArea ref={contentRef} className="flex-1 scroll-smooth">
                        <div className="max-w-4xl mx-auto py-20 md:py-32 px-6">
                            
                            <div className={`
                                min-h-[calc(100vh-300px)] p-10 md:p-24 rounded-[48px] transition-all duration-700 border
                                ${getPageThemeClasses()}
                            `}>
                                <div className="mb-20 text-center pb-12 border-b border-current/5">
                                    <h4 className="type-tiny mb-6 opacity-40">FRAGMENT {textPageIndex + 1}</h4>
                                    <h2 className={`type-display text-4xl md:text-7xl leading-none text-current ${settings.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}>
                                        {currentTextPage.title}
                                    </h2>
                                </div>

                                <article 
                                    className={`prose prose-zinc max-w-none transition-all duration-700 ${getFontFamily()}`}
                                    style={{ 
                                        fontSize: `${settings.fontSize}px`, 
                                        lineHeight: settings.lineHeight,
                                        color: 'currentColor' 
                                    }}
                                >
                                    <div className="opacity-90">
                                        {renderMarkdownContent(currentTextPage.content || "Neural link stable. Start writing...")}
                                    </div>
                                </article>

                                {/* Page Footer */}
                                <div className="mt-24 pt-12 border-t border-current/5 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
                                     <span className="type-tiny opacity-40">{book.title}</span>
                                     <span className="type-tiny opacity-40">{textPageIndex + 1} / {pages.length}</span>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </main>

            {/* === FIXED BOTTOM NAVIGATION (Text Mode) === */}
            {!book.pdfUrl && (
                <div className={`fixed bottom-0 left-0 right-0 p-8 border-t z-50 backdrop-blur-3xl transition-colors duration-300 ${settings.theme === 'dark' ? 'bg-black/90 border-white/10' : settings.theme === 'light' ? 'bg-white/90 border-black/10' : 'bg-[#f4ecd8]/90 border-[#5b4636]/10'}`}>
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-12">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                if (textPageIndex > 0) {
                                    setTextPageIndex(p => p - 1);
                                    contentRef.current?.scrollTo(0,0);
                                }
                            }}
                            disabled={textPageIndex === 0}
                            className="flex-1 h-16 rounded-full border-white/10 hover:bg-white/5 group transition-all"
                        >
                            <IconChevronLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                            <span className="type-tiny">Previous Node</span>
                        </Button>

                        <div className="type-tiny tabular-nums text-current opacity-40">
                            {textPageIndex + 1} / {pages.length}
                        </div>

                        <Button 
                            variant="outline"
                            onClick={() => {
                                if (textPageIndex < pages.length - 1) {
                                    setTextPageIndex(p => p + 1);
                                    contentRef.current?.scrollTo(0,0);
                                }
                            }}
                            disabled={textPageIndex === pages.length - 1}
                            className="flex-1 h-16 rounded-full border-white/10 hover:bg-white/5 group transition-all"
                        >
                            <span className="type-tiny">Next Node</span>
                            <IconChevronRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EbookReaderPage;
