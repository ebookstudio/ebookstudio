import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '../constants';

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  icon, 
  className = "",
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-4 w-full px-6 py-4 rounded-full border transition-all duration-700 h-full ${
          isOpen 
            ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' 
            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:border-white/10'
        }`}
      >
        <div className="flex items-center gap-3 truncate min-w-0">
            {icon && <span className={isOpen ? 'text-black' : 'text-zinc-600'}>{icon}</span>}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">
                {selectedOption ? selectedOption.label : placeholder || 'Select'}
            </span>
        </div>
        <IconChevronDown className={`w-3.5 h-3.5 transition-transform duration-700 flex-shrink-0 ${isOpen ? 'rotate-180 text-black' : 'text-zinc-700'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-4 left-0 w-full min-w-[240px] bg-[#080808] border border-white/10 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,1)] overflow-hidden z-[999] p-2 animate-fade-in origin-top">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {options.map((option) => (
                <button
                key={option.value}
                onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all mb-1 last:mb-0 ${
                    value === option.value 
                    ? 'bg-white text-black' 
                    : 'text-zinc-600 hover:bg-white/5 hover:text-white'
                }`}
                >
                {option.label}
                </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
