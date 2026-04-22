import React, { useState } from 'react';
import { suggestBookPrice } from '../../services/aiService';
import Spinner from '../Spinner';
import { EBook } from '../../types';
import { IconTrendingUp, IconCheck, IconSparkles } from '../../constants';
import { cn } from '../../lib/utils';

interface AIPricingOptimizerProps {
  bookDetails: Pick<EBook, 'title' | 'genre' | 'description'>;
  onPriceSuggested: (price: string) => void;
}

const AIPricingOptimizer: React.FC<AIPricingOptimizerProps> = ({ bookDetails, onPriceSuggested }) => {
  const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestPrice = async () => {
    if (!bookDetails.title) {
        setError("Title required.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const price = await suggestBookPrice(bookDetails);
      if (price.match(/^\d+(\.\d{1,2})?$/)) { 
        setSuggestedPrice(price); 
        onPriceSuggested(price); 
      } else {
        setError('Calculation error.');
      }
    } catch (err) {
      setError('Service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-border rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-zinc-700 transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className="relative">
            <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-border flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 transition-colors">
                <IconTrendingUp className="w-5 h-5" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-zinc-100 text-zinc-950 text-[7px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-zinc-950 shadow-lg">
                AI <IconSparkles className="w-2 h-2" />
            </div>
        </div>
        <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Revenue Intelligence
            </h4>
            <p className="text-[10px] text-zinc-500 font-medium leading-tight max-w-[220px]">Optimal pricing predicted via market trends and linguistic analysis.</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
          {suggestedPrice && !error && (
               <div className="flex flex-col items-end animate-fade-in space-y-1">
                   <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Recommended</span>
                   <div className="flex items-center gap-2 text-emerald-500">
                        <span className="text-xl font-bold tracking-tighter">${parseFloat(suggestedPrice).toFixed(2)}</span>
                        <IconCheck className="w-3.5 h-3.5 bg-emerald-500/10 rounded-full p-0.5 border border-emerald-500/20" />
                   </div>
               </div>
          )}
          <button
            type="button"
            onClick={handleSuggestPrice}
            disabled={isLoading}
            className="h-9 px-6 rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 shadow-lg active:scale-95 flex items-center gap-2"
          >
            {isLoading ? <Spinner size="sm" color="text-zinc-950"/> : 'Execute Analysis'}
          </button>
      </div>
      {error && <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest bg-red-900/10 px-3 py-1.5 rounded-md border border-red-500/20">{error}</span>}
    </div>
  );
};

export default AIPricingOptimizer;
