
import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  size: number;
  x: number;
  y: number;
  animationDelay: number;
  animationDuration: number;
  color: string;
  twinkleIntensity: number; // Controls how much the star twinkles
}

const StarBackground = () => {
  const [stars, setStars] = useState<Star[]>([]);
  
  // Generate stars
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      // More stars for a denser night sky
      const starCount = Math.floor(window.innerWidth * window.innerHeight / 900);
      
      for (let i = 0; i < starCount; i++) {
        // Star colors - from white to blue-ish to yellow-ish
        const colorChoices = [
          'rgb(255, 255, 255)', // White
          'rgb(230, 230, 255)', // Light blue white
          'rgb(255, 250, 240)', // Warm white
          'rgb(200, 220, 255)', // Baby blue
          'rgb(255, 230, 210)', // Very light warm
        ];
        
        const sizeVariation = Math.random();
        let size, twinkleIntensity;
        
        // Create stars of different sizes with appropriate twinkling
        if (sizeVariation > 0.98) {
          // Very bright prominent stars (rare)
          size = Math.random() * 3.5 + 2.5; 
          twinkleIntensity = 0.8;
        } else if (sizeVariation > 0.9) {
          // Medium-bright stars
          size = Math.random() * 2 + 1.5;
          twinkleIntensity = 0.6;
        } else if (sizeVariation > 0.7) {
          // Normal visible stars
          size = Math.random() * 1.2 + 0.9;
          twinkleIntensity = 0.4;
        } else {
          // Distant background stars (common)
          size = Math.random() * 0.8 + 0.3;
          twinkleIntensity = 0.25;
        }
        
        // Randomize the twinkling animation timing
        const animationDuration = 2 + Math.random() * 7;
        
        newStars.push({
          id: i,
          size,
          x: Math.random() * 100,
          y: Math.random() * 100,
          animationDelay: Math.random() * 10,
          animationDuration,
          color: colorChoices[Math.floor(Math.random() * colorChoices.length)],
          twinkleIntensity
        });
      }
      
      setStars(newStars);
    };
    
    generateStars();
    
    // Regenerate stars when window is resized
    window.addEventListener('resize', generateStars);
    return () => {
      window.removeEventListener('resize', generateStars);
    };
  }, []);

  return (
    <div className="stars-container">
      {/* Glowing sun in the background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-orange-300 via-yellow-400 to-orange-500 z-0"
        style={{
          width: '100px',
          height: '100px',
          opacity: 0.8,
          boxShadow: '0 0 120px rgba(255, 200, 50, 0.6), 0 0 200px rgba(255, 160, 20, 0.3)',
          animation: 'pulse-slow 8s ease-in-out infinite'
        }}
      />
      
      {/* Stars with improved twinkling */}
      {stars.map(star => (
        <div
          key={`star-${star.id}`}
          className="star"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.animationDelay}s`,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.color.replace('rgb', 'rgba').replace(')', `, ${star.twinkleIntensity})`)}`,
            animationDuration: `${star.animationDuration}s`,
            animation: `star-twinkle ${star.animationDuration}s ease-in-out infinite`,
            zIndex: 1,
          }}
        />
      ))}
      
      {/* Occasional shooting stars */}
      <div className="absolute top-[10%] left-[-5%] w-[120px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-comet"></div>
      <div className="absolute top-[40%] left-[20%] w-[180px] h-[2px] bg-gradient-to-r from-transparent via-[#a26bf0] to-transparent opacity-0 animate-comet" style={{ animationDelay: '6s', animationDuration: '10s' }}></div>
      <div className="absolute top-[70%] left-[50%] w-[150px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-comet" style={{ animationDelay: '13s', animationDuration: '8s' }}></div>
    </div>
  );
};

export default StarBackground;
