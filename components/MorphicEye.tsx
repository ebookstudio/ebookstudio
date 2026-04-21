import React, { useEffect, useRef, useState } from 'react';

interface MorphicEyeProps {
  className?: string;
  isActive?: boolean;
  variant?: 'hero' | 'logo';
}

const MorphicEye: React.FC<MorphicEyeProps> = ({ className = "w-20 h-20", isActive = true, variant = 'hero' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!isActive) {
        setPupilPos({ x: 0, y: 0 });
        return;
    }

    const calculateGaze = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = variant === 'logo' ? 4 : 15;
      
      const angle = Math.atan2(dy, dx);
      const moveDistance = Math.min(distance / 20, maxDistance);
      
      setPupilPos({
        x: Math.cos(angle) * moveDistance,
        y: Math.sin(angle) * moveDistance
      });
    };

    const handleMouseMove = (e: MouseEvent) => calculateGaze(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) calculateGaze(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isActive, variant]);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      const nextBlink = 2000 + Math.random() * 5000;
      blinkTimeout = setTimeout(triggerBlink, nextBlink);
    };
    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  const isLogo = variant === 'logo';

  return (
    <div 
      ref={containerRef}
      className={`relative flex items-center justify-center select-none transition-all duration-700 ${className}`}
    >
      {/* Outer Glow Ring (Hero Only) */}
      {!isLogo && (
        <div className="absolute inset-[-20%] rounded-full bg-white/[0.03] blur-2xl animate-pulse" />
      )}

      {/* Main Socket */}
      <div className={`relative w-full h-full rounded-full bg-[#080808] border ${isLogo ? 'border-white/10' : 'border-white/20'} overflow-hidden shadow-2xl`}>
        
        {/* Internal Gradient Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

        {/* Eyelid / Blink */}
        <div 
          className={`absolute inset-0 bg-black z-40 transition-all duration-200 ease-in-out origin-top ${isBlinking ? 'scale-y-100' : 'scale-y-0'}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
        />

        {/* Gaze Container */}
        <div 
          className="absolute inset-0 flex items-center justify-center z-30 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
        >
          {/* Main Pupil / Light Core */}
          <div className={`${isLogo ? 'w-[40%] h-[40%]' : 'w-[50%] h-[50%]'} rounded-full bg-white relative shadow-[0_0_20px_rgba(255,255,255,0.5)]`}>
             {/* Dynamic Highlight */}
             <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white rounded-full blur-[1px] opacity-90" />
             
             {/* Neural Ring (Hero Only) */}
             {!isLogo && (
               <div className="absolute inset-[-8px] rounded-full border border-white/20 animate-pulse-slow" />
             )}
          </div>
        </div>

        {/* Scanline Interface (Hero Only) */}
        {!isLogo && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden opacity-30">
            <div className="w-full h-full bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_2px)]" />
            <div className="w-full h-[2px] bg-white absolute top-0 animate-scanline shadow-[0_0_10px_white]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MorphicEye;
