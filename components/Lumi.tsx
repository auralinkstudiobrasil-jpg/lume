import React from 'react';

interface LumiProps {
  mood?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'neutral' | 'happy';
  silenceMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
  children?: React.ReactNode; 
}

const Lumi: React.FC<LumiProps> = ({ 
  mood = 'neutral', 
  silenceMode = false, 
  size = 'md', 
  pulse = false,
  children
}) => {
  
  const getStyles = () => {
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
          shadow: 'shadow-[0_10px_30px_-5px_rgba(251,191,36,0.6)]',
          glow: 'bg-yellow-400 opacity-40 blur-xl',
          faceColor: 'fill-amber-900',
          eyeType: 'happy'
        };
      case 'sunny': 
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          shadow: 'shadow-[0_10px_20px_-5px_rgba(253,224,71,0.4)]',
          glow: 'bg-yellow-200 opacity-30 blur-lg',
          faceColor: 'fill-amber-800',
          eyeType: 'open'
        };
      case 'cloudy': 
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
          shadow: 'shadow-[0_10px_20px_-5px_rgba(199,210,254,0.5)]',
          glow: 'bg-blue-200 opacity-30 blur-lg',
          faceColor: 'fill-indigo-400',
          eyeType: 'open'
        };
      case 'rainy': 
        return {
          bg: 'bg-gradient-to-br from-indigo-200 to-blue-300',
          shadow: 'shadow-[0_10px_20px_-5px_rgba(165,180,252,0.5)]',
          glow: 'bg-indigo-300 opacity-30 blur-lg',
          faceColor: 'fill-indigo-700',
          eyeType: 'sad'
        };
      case 'stormy': 
        return {
          bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
          shadow: 'shadow-[0_10px_20px_-5px_rgba(148,163,184,0.5)]',
          glow: 'bg-slate-400 opacity-30 blur-lg',
          faceColor: 'fill-slate-600',
          eyeType: 'sad'
        };
      default: // Neutral
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
          shadow: 'shadow-[0_10px_20px_-5px_rgba(254,215,170,0.5)]',
          glow: 'bg-amber-200 opacity-30 blur-lg',
          faceColor: 'fill-amber-800/60',
          eyeType: 'open'
        };
    }
  };

  const style = getStyles();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12 min-w-[3rem] min-h-[3rem]'; // Garantir min-width para não esmagar
      case 'md': return 'w-28 h-28 min-w-[7rem] min-h-[7rem]';
      case 'lg': return 'w-44 h-44 min-w-[11rem] min-h-[11rem]'; // Levemente reduzido para caber melhor em mobile
      case 'xl': return 'w-60 h-60 min-w-[15rem] min-h-[15rem]';
      default: return 'w-28 h-28';
    }
  };

  const animationClass = pulse 
    ? 'animate-breathe' 
    : (mood === 'happy' ? 'animate-bounce-gentle' : (silenceMode ? '' : 'animate-float'));

  return (
    // Adicionado flex-shrink-0 e padding wrapper para evitar cortes no glow
    <div className={`relative ${getSizeClasses()} flex-shrink-0 flex items-center justify-center transition-all duration-700 select-none p-4`}>
      
      {/* Background Glow (Aura) - Ajustado inset para não cortar */}
      <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${style.glow} ${mood === 'happy' ? 'animate-pulse' : ''}`}></div>
      
      {/* Main Body Orb */}
      <div className={`absolute inset-2 rounded-full ${style.bg} ${style.shadow} ${animationClass} z-10 border border-white/30 flex items-center justify-center overflow-hidden transition-all duration-700`}>
        
        {/* Shine/Reflection effect */}
        <div className="absolute top-2 left-1/4 w-1/3 h-1/3 bg-gradient-to-b from-white/70 to-transparent rounded-full opacity-70 blur-[1px]"></div>
        
        {/* Face Container */}
        <div className={`relative z-20 flex flex-col items-center justify-center transition-transform duration-500 w-full h-full ${children ? '-translate-y-2' : ''}`}>
            
            {/* SVG Face */}
            <svg 
              viewBox="0 0 100 100" 
              className={`w-2/3 h-2/3 transition-all duration-500 ${style.faceColor}`}
              style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
            >
              {/* Eyes */}
              {style.eyeType === 'happy' && (
                <g className="animate-pulse">
                  <path d="M 25 45 Q 35 35 45 45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 55 45 Q 65 35 75 45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </g>
              )}

              {style.eyeType === 'open' && (
                 <g>
                   <circle cx="35" cy="45" r="6" />
                   <circle cx="65" cy="45" r="6" />
                 </g>
              )}

              {style.eyeType === 'sleep' && (
                 <g>
                   <path d="M 28 48 L 42 48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                   <path d="M 58 48 L 72 48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                 </g>
              )}

              {style.eyeType === 'sad' && (
                 <g>
                   <circle cx="35" cy="48" r="5" />
                   <circle cx="65" cy="48" r="5" />
                 </g>
              )}

              {/* Mouth */}
              {style.eyeType === 'happy' ? (
                 <path d="M 35 60 Q 50 75 65 60" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              ) : style.eyeType === 'sad' ? (
                 <path d="M 35 68 Q 50 60 65 68" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              ) : style.eyeType === 'sleep' ? (
                 <circle cx="50" cy="65" r="3" />
              ) : (
                 <path d="M 40 65 Q 50 68 60 65" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              )}
            </svg>
        </div>

        {children && (
          <div className={`absolute bottom-3 z-30 transition-all duration-500 ${mood === 'happy' ? 'scale-110 translate-y-0 opacity-100' : 'scale-90 translate-y-1 opacity-70 grayscale'}`}>
            <span className="text-xl filter drop-shadow-md">{children}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Lumi;