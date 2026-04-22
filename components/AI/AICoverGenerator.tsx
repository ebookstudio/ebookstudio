import React, { useState } from 'react';
import { generateBookCover } from '../../services/geminiService';
import Spinner from '../Spinner';
import { GeneratedImage } from '../../types';
import { IconChevronDown, IconCheck, IconSparkles } from '../../constants';
import { cn } from '../../lib/utils';

interface AICoverGeneratorProps {
  onCoverGenerated: (imageData: GeneratedImage) => void;
  currentTitle?: string;
  currentAuthor?: string;
}

const COVER_STYLES = [
    'Cinematic', 'Minimalist', 'Noir', 'Vector Art', 
    'Cyberpunk', 'Academic', 'Oil Painting', 'Abstract', 
    'Photorealistic', 'Architectural'
];

const AICoverGenerator: React.FC<AICoverGeneratorProps> = ({ onCoverGenerated, currentTitle, currentAuthor }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>('Cinematic');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCover = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!prompt.trim()) {
        setError("Please describe the visual concept.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateBookCover(prompt, style, currentTitle, currentAuthor);
      if ('error' in result) {
        setError(result.error);
        setGeneratedImage(null);
      } else {
        setGeneratedImage(result);
        onCoverGenerated(result);
      }
    } catch (err) {
      setError('Generation failed. Please try again.');
      setGeneratedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = `w-full h-11 bg-zinc-950 border border-border rounded-lg px-4 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-700`;
  const labelClasses = `block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1`;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <IconSparkles className="w-4 h-4 text-zinc-400" />
              <h4 className="text-sm font-bold text-zinc-100">AI Visual Studio</h4>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Premium Content Generation</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClasses}>Art Direction</label>
            <div className="relative">
                <select 
                    value={style} 
                    onChange={(e) => setStyle(e.target.value)}
                    className={cn(inputClasses, "appearance-none cursor-pointer pr-10 uppercase tracking-wider font-bold")}
                >
                    {COVER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                    <IconChevronDown className="w-3.5 h-3.5" />
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Visual Prompt</label>
            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the scene..."
                className={inputClasses}
            />
          </div>
      </div>

      <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleGenerateCover}
            disabled={isLoading || !prompt.trim()}
            className="h-10 px-8 rounded-md bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center disabled:opacity-50 min-w-[140px]"
          >
            {isLoading ? <Spinner size="sm" color="text-zinc-400" /> : 'Execute Generation'}
          </button>
      </div>
      
      {error && <p className="text-red-400 mt-4 text-[10px] font-bold uppercase tracking-wider bg-red-900/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
      
      {generatedImage && !error && (
        <div className="pt-6 border-t border-border animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl border border-border group shrink-0">
                   <img 
                      src={`data:image/jpeg;base64,${generatedImage.imageBytes}`} 
                      alt="Generated Asset" 
                      className="w-full h-full object-cover"
                    />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                      <IconCheck className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">Asset Finalized</h5>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-sm">
                      The generated visual asset has been successfully integrated into your publication manifest.
                  </p>
                  {generatedImage.revisedPrompt && (
                      <p className="text-[9px] text-zinc-700 italic font-medium leading-tight">
                          "{generatedImage.revisedPrompt.substring(0, 100)}..."
                      </p>
                  )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoverGenerator;
