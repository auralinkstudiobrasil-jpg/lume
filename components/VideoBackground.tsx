import React, { useState } from 'react';
import { UserMode } from '../types';

interface VideoBackgroundProps {
  mode: UserMode;
  children: React.ReactNode;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ mode, children }) => {
  const [isPlaying, setIsPlaying] = useState(mode !== 'sensory'); // Default paused for sensory/autism mode

  // CSS Gradients simulating slow video atmospheres
  // Ideally, these would be <video> tags with source URLs, but for this demo, we use animated CSS.
  const getBackgroundClass = () => {
    switch (mode) {
      case 'sensory': // Autism: Low contrast, predictable, very slow or static
        return 'bg-gradient-to-br from-slate-100 to-slate-200';
      case 'focus': // ADHD: Clean, minimal distractions
        return 'bg-gradient-to-br from-indigo-50 to-white';
      case 'gentle': // Depression: Soft, warm, nurturing
        return 'bg-gradient-to-br from-orange-50 via-rose-50 to-slate-50';
      default: // Base: Balanced nature tones
        return 'bg-gradient-to-br from-sky-50 via-emerald-50 to-teal-50';
    }
  };

  const getOverlayAnimation = () => {
    if (!isPlaying) return '';
    
    // Simulate slow movement (clouds/water)
    switch (mode) {
      case 'sensory': return ''; // Static
      case 'focus': return 'animate-pulse-slow'; // Very subtle
      case 'gentle': return 'animate-flow-slow'; 
      default: return 'animate-flow';
    }
  };

  return (
    <div className={`relative w-full min-h-screen overflow-hidden transition-colors duration-1000 ${getBackgroundClass()}`}>
      
      {/* Animated Overlay Layer (Simulating Video) */}
      <div 
        className={`absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply ${getOverlayAnimation()}`}
        style={{
          backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 100%)',
          backgroundSize: '200% 200%'
        }}
      ></div>

      {/* Floating Orbs (Simulating light particles) */}
      {isPlaying && mode !== 'sensory' && (
        <>
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/30 rounded-full blur-3xl animate-float opacity-50"></div>
           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
        </>
      )}

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>

      {/* Accessibility Control: Play/Pause Motion */}
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed bottom-4 left-4 z-50 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-slate-500 hover:text-slate-700 transition-all"
        title={isPlaying ? "Pausar movimento" : "Ativar movimento"}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      {/* Global CSS for custom background animations */}
      <style>{`
        @keyframes flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes flow-slow {
          0% { background-position: 0% 50%; transform: scale(1); }
          50% { background-position: 100% 50%; transform: scale(1.02); }
          100% { background-position: 0% 50%; transform: scale(1); }
        }
        .animate-flow { animation: flow 15s ease infinite; }
        .animate-flow-slow { animation: flow-slow 25s ease infinite; }
        .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default VideoBackground;