import React from 'react';

interface LumiProps {
  mood?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'neutral' | 'happy';
  silenceMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
  children?: React.ReactNode; // Allows passing icons (like the water drop) inside Lumi
}

const Lumi: React.FC<LumiProps> = ({ 
  mood = 'neutral', 
  silenceMode = false, 
  size = 'md', 
  pulse = false,
  children
}) => {
  
  // Determine styles based on mood/state
  const getStyles = () => {
    // If silence mode is active (and not explicitly happy/completed), look "asleep" or dim
    if (silenceMode && mood !== 'happy') {
      return {
        bg: 'bg-gradient-to-br from-slate-200 to-slate-300',
        shadow: 'shadow-none',
        glow: 'opacity-0',
        faceColor: 'fill-slate-400',
        eyeType: 'sleep'
      };
    }

    switch (mood) {
      case 'happy': 
        return {
          bg: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-300',
          shadow: 'shadow-[0_10px_30px_-10px_rgba(251,191,36,0.6)]',
          glow: 'bg-yellow-400 opacity-40 blur-xl',
          faceColor: 'fill-amber-900',
          eyeType: 'happy'
        };
      case 'sunny': 
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          shadow: 'shadow-yellow-100',
          glow: 'bg-yellow-200 opacity-30 blur-lg',
          faceColor: 'fill-amber-800',
          eyeType: 'open'
        };
      case 'cloudy': 
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
          shadow: 'shadow-blue-50',
          glow: 'bg-blue-200 opacity-30 blur-lg',
          faceColor: 'fill-indigo-400',
          eyeType: 'open'
        };
      case 'rainy': 
        return {
          bg: 'bg-gradient-to-br from-indigo-200 to-blue-300',
          shadow: 'shadow-indigo-200',
          glow: 'bg-indigo-300 opacity-30 blur-lg',
          faceColor: 'fill-indigo-700',
          eyeType: 'sad'
        };
      case 'stormy': 
        return {
          bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
          shadow: 'shadow-slate-300',
          glow: 'bg-slate-400 opacity-30 blur-lg',
          faceColor: 'fill-slate-600',
          eyeType: 'sad'
        };
      default: // Neutral
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
          shadow: 'shadow-amber-50',
          glow: 'bg-amber-200 opacity-30 blur-lg',
          faceColor: 'fill-amber-800/60',
          eyeType: 'open'
        };
    }
  };

  const style = getStyles();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-14 h-14';
      case 'md': return 'w-32 h-32';
      case 'lg': return 'w-48 h-48';
      case 'xl': return 'w-64 h-64';
      default: return 'w-32 h-32';
    }
  };

  const animationClass = pulse 
    ? 'animate-breathe' 
    : (mood === 'happy' ? 'animate-bounce-gentle' : (silenceMode ? '' : 'animate-float'));

  return (
    <div className={`relative ${getSizeClasses()} flex items-center justify-center transition-all duration-700 select-none`}>
      
      {/* Background Glow (Aura) */}
      <div className={`absolute inset-[-20%] rounded-full transition-all duration-1000 ${style.glow} ${mood === 'happy' ? 'animate-pulse' : ''}`}></div>
      
      {/* Main Body Orb */}
      <div className={`absolute inset-0 rounded-full ${style.bg} ${style.shadow} ${animationClass} z-10 border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-700`}>
        
        {/* Shine/Reflection effect on top */}
        <div className="absolute top-2 left-1/4 w-1/3 h-1/3 bg-gradient-to-b from-white/60 to-transparent rounded-full opacity-60 blur-[2px]"></div>
        
        {/* Face Container */}
        <div className={`relative z-20 flex flex-col items-center justify-center transition-transform duration-500 ${children ? '-translate-y-2' : ''}`}>
            
            {/* SVG Face */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              className={`w-2/3 h-2/3 transition-all duration-500 ${style.faceColor}`}
            >
              {/* Eyes */}
              {style.eyeType === 'happy' && (
                <g className="animate-pulse">
                  {/* Happy Eyes ^ ^ */}
                  <path d="M 25 45 Q 35 35 45 45" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 55 45 Q 65 35 75 45" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </g>
              )}

              {style.eyeType === 'open' && (
                 <g>
                   {/* Normal Eyes • • */}
                   <circle cx="35" cy="45" r="5" />
                   <circle cx="65" cy="45" r="5" />
                 </g>
              )}

              {style.eyeType === 'sleep' && (
                 <g>
                   {/* Sleep Eyes - - */}
                   <path d="M 28 45 L 42 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                   <path d="M 58 45 L 72 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                 </g>
              )}

              {style.eyeType === 'sad' && (
                 <g>
                    {/* Sad Eyes / \ */}
                   <circle cx="35" cy="45" r="4" />
                   <circle cx="65" cy="45" r="4" />
                   {/* Teardrop maybe? No, keep it simple */}
                 </g>
              )}

              {/* Mouth */}
              {style.eyeType === 'happy' ? (
                 <path d="M 35 60 Q 50 75 65 60" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              ) : style.eyeType === 'sad' ? (
                 <path d="M 35 65 Q 50 60 65 65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              ) : style.eyeType === 'sleep' ? (
                 <circle cx="50" cy="65" r="2" />
              ) : (
                 <path d="M 42 65 Q 50 68 58 65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              )}
            </svg>
        </div>

        {/* Children content (Task Icon) - Positioned at the bottom/belly */}
        {children && (
          <div className={`absolute bottom-2 z-30 transition-all duration-500 ${mood === 'happy' ? 'scale-110 translate-y-0 opacity-100' : 'scale-90 translate-y-1 opacity-70 grayscale'}`}>
            <span className="text-lg filter drop-shadow-sm">{children}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Lumi;