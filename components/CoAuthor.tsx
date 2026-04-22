import React from 'react';
import { cn } from '../lib/utils';

interface CoAuthorProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  variant?: 'hero' | 'logo';
  isActive?: boolean;
}

const CoAuthor: React.FC<CoAuthorProps> = ({ 
  className = "", 
  size, 
  variant = 'hero',
  isActive = true 
}) => {
  const effectiveSize = size || (variant === 'logo' ? 'sm' : 'lg');

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    hero: 'w-56 h-56'
  };

  const logoSizes = {
    xs: 'text-[10px]',
    sm: 'text-sm',
    md: 'text-3xl',
    lg: 'text-5xl',
    hero: 'text-8xl'
  };

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center transition-all duration-1000 bg-zinc-100 rounded-xl overflow-hidden shadow-2xl",
        sizeClasses[effectiveSize],
        className
      )}
    >
        <span className={cn("text-zinc-950 font-black tracking-tighter select-none", logoSizes[effectiveSize])}>
            E
        </span>
        
        {/* Minimalist Tech Overlay */}
        <div className="absolute inset-0 border border-zinc-950/10 rounded-xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default CoAuthor;
