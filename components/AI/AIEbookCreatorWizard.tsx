import React, { useState } from 'react';
import { IconSparkles, IconWand, IconLink, IconCheck, IconX, IconBook } from '../../constants';
import Spinner from '../Spinner';
import { generateTitleSuggestions, generateBookOutline, generateFullChapterContent } from '../../services/aiService';
import { ChapterOutline, AnalyzedStyle } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';

interface AIEbookCreatorWizardProps {
    onComplete: (data: { title: string; pages: { title: string; content: string }[]; style?: AnalyzedStyle }) => void;
    onCancel: () => void;
}

const AIEbookCreatorWizard: React.FC = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState<'mode' | 'details' | 'outline' | 'generation'>('mode');
    
    // Import Mode
    const [canvaLink, setCanvaLink] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedStyle, setAnalyzedStyle] = useState<AnalyzedStyle | null>(null);

    // Details Mode
    const [topic, setTopic] = useState('');
    const [genre, setGenre] = useState('');
    const [tone, setTone] = useState('Professional');
    const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

    // Outline Mode
    const [outline, setOutline] = useState<ChapterOutline[]>([]);
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

    // Generation Mode
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    const handleAnalyzeCanva = () => {
        if (!canvaLink) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            setAnalyzedStyle({
                fontPrimary: 'Inter',
                fontSecondary: 'Inter',
                colorPrimary: '#18181b', 
                colorSecondary: '#fafafa', 
                colorBackground: '#09090b', 
                colorText: '#fafafa'
            });
            setIsAnalyzing(false);
            setStep('details');
        }, 2000);
    };

    const handleGenerateTitles = async () => {
        if (!topic || !genre) return;
        setIsGeneratingTitles(true);
        const titles = await generateTitleSuggestions(topic, genre, tone);
        setTitleSuggestions(titles);
        setIsGeneratingTitles(false);
    };

    const handleGenerateOutline = async () => {
        if (!selectedTitle) return;
        setIsGeneratingOutline(true);
        const chapters = await generateBookOutline(selectedTitle, genre, tone);
        setOutline(chapters);
        setIsGeneratingOutline(false);
        setStep('outline');
    };

    const handleGenerateFullEbook = async () => {
        setIsGeneratingContent(true);
        setStep('generation');
        
        const generatedPages = [];
        let completed = 0;

        for (const chapter of outline) {
            const content = await generateFullChapterContent(chapter.title, selectedTitle, chapter.summary, tone);
            generatedPages.push({
                title: chapter.title,
                content: content
            });
            completed++;
            setGenerationProgress(Math.round((completed / outline.length) * 100));
        }

        setIsGeneratingContent(false);
        onComplete({
            title: selectedTitle,
            pages: generatedPages,
            style: analyzedStyle || undefined
        });
    };

    const inputClasses = "w-full h-10 bg-zinc-950 border border-border rounded-md px-4 text-xs font-bold text-zinc-100 placeholder:text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all";
    const labelClasses = "block text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1";

    return (
        <div className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-4xl h-[600px] rounded-2xl border border-border shadow-2xl flex overflow-hidden relative animate-in zoom-in duration-300">
                
                {/* Left Sidebar Steps */}
                <div className="w-60 bg-zinc-950 border-r border-border p-8 flex flex-col justify-between hidden md:flex">
                    <div className="space-y-12">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-zinc-100 rounded flex items-center justify-center shadow-lg">
                                <span className="text-zinc-950 font-black text-[10px]">E</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">AI Creator</span>
                        </div>
                        <div className="space-y-6">
                            {[
                                { id: 'mode', label: 'Initialization' },
                                { id: 'details', label: 'Conceptualize' },
                                { id: 'outline', label: 'Structure' },
                                { id: 'generation', label: 'Generation' }
                            ].map((s, idx) => {
                                const isActive = step === s.id;
                                const isPast = ['mode', 'details', 'outline', 'generation'].indexOf(step) > idx;
                                return (
                                    <div key={s.id} className="flex items-center gap-4 group">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all",
                                            isActive ? 'border-zinc-100 bg-zinc-100 text-zinc-950 scale-105 shadow-lg shadow-white/5' : 
                                            isPast ? 'bg-zinc-400 border-zinc-400 text-zinc-950' : 
                                            'border-zinc-800 text-zinc-600'
                                        )}>
                                            {isPast ? <IconCheck className="w-3 h-3"/> : idx + 1}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest transition-colors",
                                            isActive ? 'text-zinc-100' : 'text-zinc-600'
                                        )}>{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {analyzedStyle && (
                        <div className="p-4 bg-zinc-900 border border-border rounded-lg space-y-3">
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Style Profile</p>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full border border-border" style={{background: analyzedStyle.colorPrimary}}></div>
                                <div className="w-3 h-3 rounded-full border border-border" style={{background: analyzedStyle.colorSecondary}}></div>
                                <div className="w-3 h-3 rounded-full border border-border" style={{background: analyzedStyle.colorBackground}}></div>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-bold">Imported Identity</p>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-zinc-900 relative">
                    <header className="h-14 border-b border-border flex items-center justify-between px-8 shrink-0">
                        <div className="w-4" /> {/* Spacer */}
                        <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-md transition-all text-zinc-700 hover:text-zinc-100">
                            <IconX className="w-3.5 h-3.5" />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        {step === 'mode' && (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-fade-in space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Create Publication</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Choose your preferred generation method.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <button 
                                        onClick={() => setStep('details')}
                                        className="p-6 rounded-xl bg-zinc-950 border border-border hover:border-zinc-700 hover:bg-zinc-900 transition-all group text-left space-y-4"
                                    >
                                        <div className="w-8 h-8 bg-zinc-900 border border-border rounded flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <IconWand className="w-3.5 h-3.5 text-zinc-100" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-zinc-100 mb-1 uppercase tracking-widest">AI Standard</h4>
                                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Assisted drafting from scratch.</p>
                                        </div>
                                    </button>

                                    <div className="p-6 rounded-xl bg-zinc-950 border border-border group text-left space-y-4 relative">
                                         <div className="w-8 h-8 bg-zinc-900 border border-border rounded flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <IconLink className="w-3.5 h-3.5 text-zinc-100" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-zinc-100 mb-1 uppercase tracking-widest">Asset Sync</h4>
                                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed mb-4">Import style from external links.</p>
                                            
                                            <div className="space-y-2">
                                                <input 
                                                    value={canvaLink}
                                                    onChange={(e) => setCanvaLink(e.target.value)}
                                                    placeholder="URL Source..."
                                                    className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded px-3 text-[10px] font-bold text-zinc-100 focus:outline-none transition-all"
                                                />
                                                <Button 
                                                    onClick={handleAnalyzeCanva}
                                                    disabled={isAnalyzing || !canvaLink}
                                                    className="w-full h-8 bg-zinc-100 text-zinc-950 text-[9px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? 'Analyzing...' : 'Sync Asset'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'details' && (
                            <div className="max-w-xl mx-auto animate-fade-in space-y-8">
                                <header>
                                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Conceptualize</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Define the core parameters of your asset.</p>
                                </header>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Asset Topic</label>
                                        <input 
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className={inputClasses}
                                            placeholder="e.g. Modern Architecture in 2050"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Category</label>
                                            <select 
                                                value={genre} 
                                                onChange={e => setGenre(e.target.value)}
                                                className={cn(inputClasses, "appearance-none cursor-pointer")}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Non-Fiction">Non-Fiction</option>
                                                <option value="Fiction">Fiction</option>
                                                <option value="Technical">Technical</option>
                                                <option value="Business">Business</option>
                                                <option value="Educational">Educational</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Tone</label>
                                            <select 
                                                value={tone} 
                                                onChange={e => setTone(e.target.value)}
                                                className={cn(inputClasses, "appearance-none cursor-pointer")}
                                            >
                                                <option value="Professional">Professional</option>
                                                <option value="Conversational">Conversational</option>
                                                <option value="Inspirational">Inspirational</option>
                                                <option value="Analytical">Analytical</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={handleGenerateTitles}
                                        disabled={!topic || !genre || isGeneratingTitles}
                                        className="text-[9px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-all flex items-center gap-2"
                                    >
                                        {isGeneratingTitles ? <Spinner size="sm" /> : <><IconSparkles className="w-3 h-3"/> Suggest Titles</>}
                                    </button>

                                    {titleSuggestions.length > 0 && (
                                        <div className="space-y-3 mt-4 animate-fade-in">
                                            <label className={labelClasses}>Select Title</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {titleSuggestions.map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => setSelectedTitle(t)}
                                                        className={cn(
                                                            "w-full text-left p-3 px-5 rounded-md border text-[11px] font-bold transition-all",
                                                            selectedTitle === t ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-xl' : 'bg-zinc-950 border-border text-zinc-700 hover:border-zinc-700'
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        onClick={handleGenerateOutline}
                                        disabled={!selectedTitle}
                                        className="w-full h-11 bg-zinc-100 text-zinc-950 font-bold rounded transition-all mt-6 disabled:opacity-50 text-[10px] uppercase tracking-[0.2em]"
                                    >
                                        Generate Outline &rarr;
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 'outline' && (
                            <div className="max-w-xl mx-auto animate-fade-in space-y-8">
                                <header>
                                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight">{selectedTitle}</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Proposed Chapter Structure</p>
                                </header>

                                {isGeneratingOutline ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                        <Spinner size="lg" color="text-zinc-100" />
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest animate-pulse">Drafting Structure...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 mb-10">
                                        {outline.map((chapter, idx) => (
                                            <div key={idx} className="p-4 bg-zinc-950 border border-border rounded-lg space-y-1">
                                                <h4 className="text-[11px] font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-3">
                                                    <span className="text-zinc-700 font-mono text-[9px]">{idx + 1}.</span>
                                                    {chapter.title}
                                                </h4>
                                                <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">{chapter.summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isGeneratingOutline && (
                                    <Button 
                                        onClick={handleGenerateFullEbook}
                                        className="w-full h-12 bg-zinc-100 text-zinc-950 font-bold rounded shadow-xl transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
                                    >
                                        <IconSparkles className="w-3.5 h-3.5" />
                                        Finalize and Generate
                                    </Button>
                                )}
                            </div>
                        )}

                        {step === 'generation' && (
                            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-10 animate-fade-in">
                                <div className="w-24 h-24 relative">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="44" fill="none" stroke="#18181b" strokeWidth="3" />
                                        <circle cx="48" cy="48" r="44" fill="none" stroke="#fafafa" strokeWidth="3" strokeDasharray="276" strokeDashoffset={276 - (276 * generationProgress) / 100} className="transition-all duration-500" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-zinc-100 tracking-tighter">
                                        {generationProgress}%
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Generating Publication</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Compiling chapters and applying typographic standards.</p>
                                </div>
                                
                                <div className="w-full bg-zinc-950 border border-border rounded-xl p-6 text-left space-y-3">
                                    <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Generation Status</p>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-mono text-zinc-400">> System ready.</p>
                                        {generationProgress > 10 && <p className="text-[9px] font-mono text-zinc-600">> Analyzing document structure...</p>}
                                        {generationProgress > 30 && <p className="text-[9px] font-mono text-zinc-600">> Drafting core chapters...</p>}
                                        {generationProgress > 70 && <p className="text-[9px] font-mono text-zinc-600">> Finalizing typographic rules...</p>}
                                        {generationProgress === 100 && <p className="text-[9px] font-mono text-zinc-300">> Process complete.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIEbookCreatorWizard;
