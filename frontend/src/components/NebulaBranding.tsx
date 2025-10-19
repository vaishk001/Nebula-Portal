
import React, { useEffect, useState } from 'react';

const NebulaBranding = ({ size = 'large', animate = true }: { size?: 'small' | 'medium' | 'large'; animate?: boolean }) => {
  const [glowIntensity, setGlowIntensity] = useState(0.7);
  
  useEffect(() => {
    if (!animate) return;
    
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => {
        const newValue = prev + (Math.random() * 0.1 - 0.05);
        return Math.max(0.5, Math.min(0.9, newValue));
      });
    }, 1500);
    
    return () => clearInterval(glowInterval);
  }, [animate]);

  let textSize = 'text-4xl';
  let iconSize = 'w-12 h-12';
  
  if (size === 'medium') {
    textSize = 'text-2xl';
    iconSize = 'w-8 h-8';
  } else if (size === 'small') {
    textSize = 'text-xl';
    iconSize = 'w-6 h-6';
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`${iconSize} relative group`}>
        <div 
          className="absolute inset-0 bg-nebula-600 rounded-full opacity-70 animate-pulse-slow group-hover:opacity-90"
          style={{ filter: `blur(2px) brightness(${glowIntensity + 0.2})` }}
        ></div>
        <div 
          className="absolute inset-1 bg-nebula-300 rounded-full opacity-50 animate-pulse group-hover:opacity-70"
          style={{ filter: `blur(1px) brightness(${glowIntensity + 0.3})` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white rounded-full opacity-80 shadow-lg shadow-nebula-500/50 group-hover:opacity-100 transition-all"></div>
          {animate && (
            <>
              <div className="absolute w-full h-full animate-spin-slow">
                <div className="absolute top-0 right-1/4 w-1 h-1 bg-nebula-200 rounded-full"></div>
              </div>
              <div className="absolute w-full h-full animate-spin-reverse-slow">
                <div className="absolute bottom-0 left-1/4 w-1 h-1 bg-nebula-200 rounded-full"></div>
              </div>
            </>
          )}
        </div>
      </div>
      <h1 className={`${textSize} font-bold tracking-tight text-white relative`}>
        <span className="bg-gradient-to-r from-nebula-400 to-nebula-600 bg-clip-text text-transparent relative">
          NEBULA
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-nebula-400 rounded-full animate-pulse"></span>
        </span>
        <span className="relative ml-1">
          PORTAL
          <span className="absolute -top-1 -right-1 w-1 h-1 bg-nebula-400 rounded-full animate-pulse"></span>
        </span>
      </h1>
    </div>
  );
};

export default NebulaBranding;
