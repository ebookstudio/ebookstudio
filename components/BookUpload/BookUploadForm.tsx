import React, { useState } from 'react';
import { EBook, GeneratedImage, UserType } from '../../types';
import AIPricingOptimizer from '../AI/AIPricingOptimizer';
import AICoverGenerator from '../AI/AICoverGenerator';
import { IconUpload, IconWallet, IconRocket, IconSparkles, IconCheck, IconBook } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import { analyzePdfContent } from '../../services/aiService';
import Spinner from '../Spinner';
import { cn } from '../../lib/utils';

interface BookUploadFormProps {
  onBookUploaded: (book: EBook) => void; 
}

const inputBaseClasses = `w-full bg-zinc-950 border border-border rounded-lg p-4 text-zinc-100 placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all font-sans`;
const labelClasses = `block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1`;

const BookUploadForm: React.FC<BookUploadFormProps> = ({ onBookUploaded }) => {
  const { currentUser, userType } = useAppContext();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  
  const [monetizationType, setMonetizationType] = useState<'paid' | 'free'>('paid');
  const [price, setPrice] = useState('');
  
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);

  const [aiGeneratedCoverData, setAiGeneratedCoverData] = useState<GeneratedImage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const performPdfAnalysis = async (selectedFile: File) => {
      setIsAnalyzingPdf(true);
      try {
          const reader = new FileReader();
          reader.onload = async () => {
              const base64Data = reader.result as string;
              const analysis = await analyzePdfContent(base64Data);
              
              if (analysis) {
                  if (analysis.title) setTitle(analysis.title);
                  if (analysis.author) setAuthor(analysis.author);
                  if (analysis.description) setDescription(analysis.description);
                  if (analysis.genre) setGenre(analysis.genre);
              }
              setIsAnalyzingPdf(false);
          };
          reader.onerror = () => {
              setFormError("Error reading file.");
              setIsAnalyzingPdf(false);
          };
          reader.readAsDataURL(selectedFile);
      } catch (err) {
          console.error(err);
          setFormError("Failed to analyze PDF.");
          setIsAnalyzingPdf(false);
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files ? e.target.files[0] : null;
      setFile(selectedFile);
      setFormError(null);

      if (selectedFile && selectedFile.type === 'application/pdf') {
          await performPdfAnalysis(selectedFile);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!title || !author || !description || !genre) {
        setFormError("Missing required fields.");
        return;
    }

    let finalPrice = 0;
    if (monetizationType === 'paid') {
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            setFormError("Invalid Price.");
            return;
        }
        finalPrice = parseFloat(price);
    }

    setIsProcessingFile(true);

    const currentSellerId = (currentUser && userType === UserType.SELLER) ? currentUser.id : 'unknown_seller_id';

    let pdfDataUrl = undefined;
    if (file) {
        try {
            pdfDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (err) {
            setFormError("Failed to process file.");
            setIsProcessingFile(false);
            return;
        }
    }

    const placeholderPages = !pdfDataUrl ? [
        { id: '1', title: 'Chapter 1', pageNumber: 1, content: `Welcome to ${title}.\n\nPlaceholder content.` }
    ] : [];

    const newBook: EBook = {
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      title,
      author,
      description,
      genre,
      price: finalPrice,
      coverImageUrl: aiGeneratedCoverData ? `data:image/jpeg;base64,${aiGeneratedCoverData.imageBytes}` : (coverImageUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`),
      sellerId: currentSellerId, 
      publicationDate: new Date().toISOString().split('T')[0],
      pages: placeholderPages,
      pdfUrl: pdfDataUrl 
    };

    onBookUploaded(newBook);
    
    setTitle(''); setAuthor(''); setDescription(''); setGenre(''); setPrice(''); setCoverImageUrl(''); setFile(null); setAiGeneratedCoverData(null);
    setIsProcessingFile(false);
  };
  
  const handlePriceSuggested = (suggestedPrice: string) => {
    if (monetizationType === 'paid') setPrice(suggestedPrice);
  };

  const handleCoverGenerated = (imageData: GeneratedImage) => {
    setAiGeneratedCoverData(imageData);
    setCoverImageUrl('');
  };

  return (
    <div className="bg-zinc-900 border border-border rounded-xl p-8 lg:p-12 shadow-2xl relative overflow-hidden animate-fade-in">
      
      <header className="mb-10 pb-6 border-b border-border">
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Upload Publication</h2>
          <p className="text-zinc-500 text-sm mt-1">Upload a PDF document or initialize a new digital asset.</p>
      </header>
          
      {formError && (
        <div className="p-4 mb-8 text-red-400 bg-red-900/10 border border-red-500/20 text-xs font-bold rounded-lg flex items-center gap-3">
           <IconX className="w-4 h-4 text-red-500" />
           {formError}
        </div>
      )}

      {/* PDF Upload Zone */}
      <div className={cn(
        "relative h-40 border border-dashed transition-all duration-300 mb-10 flex flex-col items-center justify-center gap-4 group rounded-xl",
        isAnalyzingPdf ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-950 border-border hover:border-zinc-700'
      )}>
        
        {isAnalyzingPdf ? (
            <div className="flex flex-col items-center">
                <Spinner size="md" color="text-zinc-100" />
                <p className="mt-4 text-zinc-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">Analyzing Content...</p>
            </div>
        ) : (
            <label htmlFor="ebookFile" className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-6">
                <div className="w-10 h-10 bg-zinc-900 border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform rounded-full shadow-lg">
                    <IconUpload className="w-4 h-4 text-zinc-100"/>
                </div>
                <span className="text-xs font-bold text-zinc-300 mb-1">
                    {file ? file.name : "Select PDF Document"}
                </span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    {file ? "Change Selection" : "Drag and drop or click to browse"}
                </span>
                <input type="file" id="ebookFile" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
        )}
      </div>

      <form onSubmit={handleSubmit} className={cn("space-y-8", isAnalyzingPdf && "opacity-50 pointer-events-none")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label htmlFor="title" className={labelClasses}>Document Title</label>
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className={inputBaseClasses} placeholder="Enter publication title..."/>
             </div>
             <div className="space-y-2">
                <label htmlFor="author" className={labelClasses}>Primary Author</label>
                <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} required className={inputBaseClasses} placeholder="Enter author name..."/>
             </div>
          </div>

          <div className="space-y-2">
             <label htmlFor="description" className={labelClasses}>Executive Summary</label>
             <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className={cn(inputBaseClasses, "min-h-[120px] resize-none")} placeholder="Provide a brief summary of the content..."/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label htmlFor="genre" className={labelClasses}>Classification</label>
                <input type="text" id="genre" value={genre} onChange={e => setGenre(e.target.value)} required className={inputBaseClasses} placeholder="e.g. Technical, Research, Fiction..."/>
             </div>
             
             <div className="space-y-2">
                <label className={labelClasses}>Monetization</label>
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setMonetizationType('paid')} className={cn(
                        "p-3 border rounded-lg transition-all flex items-center justify-center gap-3",
                        monetizationType === 'paid' ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-950 text-zinc-500 border-border hover:border-zinc-800'
                    )}>
                        <IconWallet className="w-3.5 h-3.5"/>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Paid</span>
                    </button>
                    <button type="button" onClick={() => setMonetizationType('free')} className={cn(
                        "p-3 border rounded-lg transition-all flex items-center justify-center gap-3",
                        monetizationType === 'free' ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-950 text-zinc-500 border-border hover:border-zinc-800'
                    )}>
                        <IconRocket className="w-3.5 h-3.5"/>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Free</span>
                    </button>
                </div>
             </div>
          </div>

          {monetizationType === 'paid' && (
              <div className="animate-fade-in space-y-6 bg-zinc-950/50 p-6 rounded-xl border border-border">
                  <div className="space-y-2">
                    <label htmlFor="price" className={labelClasses}>List Price ($)</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className={inputBaseClasses} placeholder="9.99"/>
                  </div>
                  <AIPricingOptimizer bookDetails={{ title, genre, description }} onPriceSuggested={handlePriceSuggested} />
              </div>
          )}
          
          <div className="p-6 bg-zinc-950/50 border border-border rounded-xl space-y-6">
              <AICoverGenerator onCoverGenerated={handleCoverGenerated} currentTitle={title} currentAuthor={author} />
               
              {aiGeneratedCoverData && (
                <div className="p-4 bg-zinc-900 border border-border flex items-center gap-4 rounded-lg">
                    <img src={`data:image/jpeg;base64,${aiGeneratedCoverData.imageBytes}`} alt="AI Cover" className="w-10 h-14 object-cover bg-zinc-950 rounded border border-border" />
                    <div className="space-y-1">
                        <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <IconCheck className="w-3 h-3"/> AI Asset Attached
                        </span>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight">The generated cover will be used for this publication.</p>
                    </div>
                </div>
              )}
              
              {!aiGeneratedCoverData && (
                <div className="space-y-2">
                    <label className={labelClasses}>Manual Cover URL (Optional)</label>
                    <input type="url" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className={inputBaseClasses} placeholder="https://image-source.com/cover.jpg"/>
                </div>
              )}
          </div>

          <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isProcessingFile || isAnalyzingPdf}
                      className="px-10 h-12 bg-zinc-100 text-zinc-950 font-bold hover:bg-zinc-200 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 rounded-md shadow-xl active:scale-95">
                {isProcessingFile ? (
                    <>Synchronizing...</>
                ) : (
                    <><IconUpload className="w-4 h-4" /> Publish Document</>
                )}
              </button>
          </div>
      </form>
    </div>
  );
};

export default BookUploadForm;
