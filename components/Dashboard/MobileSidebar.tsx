import React, { useState, useEffect } from 'react';
import { IconMenu, IconX } from '../../constants';

interface MobileSidebarProps {
  children: React.ReactNode;
}

export default function MobileSidebar({ children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <IconMenu className="w-6 h-6" />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Drawer */}
          <div className="bg-zinc-950 w-64 h-full shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out z-50 border-r border-border custom-scrollbar flex flex-col">
            <div className="p-4 flex justify-end flex-shrink-0">
              <button 
                onClick={() => setOpen(false)} 
                className="p-2 text-zinc-400 hover:text-zinc-100 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-zinc-900 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 pb-6 px-0" onClick={(e) => {
                // Close sidebar when a link is clicked
                if ((e.target as HTMLElement).closest('button')) {
                    setOpen(false);
                }
            }}>
               {children}
            </div>
          </div>
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/60 backdrop-blur-sm z-40" 
            onClick={() => setOpen(false)} 
          />
        </div>
      )}
    </>
  );
}
