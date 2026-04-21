import React, { ReactNode, useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { IconX } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && contentRef.current) {
        contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw] h-[95vh]'
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-[40px] flex items-center justify-center z-[9999] p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`bg-[#050505] rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,1)] relative w-full ${sizeClasses[size]} border border-white/5 flex flex-col max-h-[92vh] overflow-hidden animate-slide-up`}
        onClick={e => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-[100] w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
          aria-label="Close modal"
        >
          <IconX className="w-5 h-5" />
        </button>

        {title && (
            <div className="px-12 py-10 border-b border-white/5 flex-shrink-0">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase tracking-[0.1em]">{title}</h2>
            </div>
        )}
        
        <div ref={contentRef} className="p-0 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
