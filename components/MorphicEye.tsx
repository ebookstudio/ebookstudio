import React, { useEffect, useRef, useState } from 'react';

interface MorphicEyeProps {
  className?: string;
  isActive?: boolean;
  variant?: 'hero' | 'logo';
}

const MorphicEye: React.FC<MorphicEyeProps> = ({ className = "", isActive = true, variant = 'hero' }) => {
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
      const maxDistance = variant === 'logo' ? 3 : 12;
      
      const angle = Math.atan2(dy, dx);
      const moveDistance = Math.min(distance / 25, maxDistance);
      
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
      setTimeout(() => setIsBlinking(false), 120);
      const nextBlink = 3000 + Math.random() * 6000;
      blinkTimeout = setTimeout(triggerBlink, nextBlink);
    };
    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  const isLogo = variant === 'logo';

  const Eye = () => (
    <div className={`relative ${isLogo ? 'w-5 h-5' : 'w-24 h-24'} rounded-full bg-[#030303] border border-white/10 overflow-hidden shadow-2xl transition-all duration-700`}>
      {/* Deep Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

      {/* Blink Layer */}
      <div 
        className={`absolute inset-0 bg-[#000] z-40 transition-all duration-150 ease-in-out origin-top ${isBlinking ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}
      />

      {/* Pupil Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-30 transition-transform duration-200 ease-out"
        style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
      >
        <div className={`${isLogo ? 'w-2 h-2' : 'w-10 h-10'} rounded-full bg-white relative shadow-[0_0_15px_rgba(255,255,255,0.4)]`}>
           <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white rounded-full blur-[0.5px] opacity-80" />
           {!isLogo && (
             <div className="absolute inset-[-4px] rounded-full border border-white/5 animate-pulse" />
           )}
        </div>
      </div>

      {/* Scanline Interface (Hero Only) */}
      {!isLogo && (
        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.15]">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_2px)]" />
          <div className="w-full h-[1px] bg-white absolute top-0 animate-scanline" />
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative flex items-center justify-center gap-4 sm:gap-8 select-none ${className}`}
    >
      {/* Background Atmosphere */}
      {!isLogo && (
        <div className="absolute inset-[-50%] bg-white/[0.01] blur-[80px] rounded-full animate-pulse pointer-events-none" />
      )}
      
      <Eye />
      <Eye />
    </div>
  );
};

export default MorphicEye;
