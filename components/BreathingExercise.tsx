import React, { useState, useEffect, useRef } from 'react';
import Lumi from './Lumi';
import { AcolhimentoMode, UserMode } from '../types';

interface AcolhimentoProps {
  silenceMode: boolean;
  userMode: UserMode;
}

type SoundType = 'rain' | 'wind' | 'river' | 'white';

const Acolhimento: React.FC<AcolhimentoProps> = ({ silenceMode, userMode }) => {
  const [mode, setMode] = useState<AcolhimentoMode | null>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [instruction, setInstruction] = useState("Escolha o que te faz bem agora");
  const [lumiMessage, setLumiMessage] = useState("");
  
  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => stopSound();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      stopSound();
      setInstruction("Pode voltar quando quiser.");
      setLumiMessage("");
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  // Exercise Logic
  useEffect(() => {
    if (!isActive) return;

    if (mode === 'breathe') {
      // Standard breathing
      const breatheCycle = () => {
        if(!isActive) return;
        setInstruction("Inspire...");
        setTimeout(() => {
            if(isActive) setInstruction("Segure...");
            setTimeout(() => {
                if(isActive) setInstruction("Solte devagar...");
            }, 2500);
        }, 4000);
      };
      breatheCycle();
      const interval = setInterval(breatheCycle, 10500); 
      return () => clearInterval(interval);
    } 
    
    if (mode === 'anxiety') {
      // Anxiety/Panic Sequence (Crisis)
      setLumiMessage("Você está seguro agora.");
      const steps = [
        "Solte o ar lentamente pela boca...",
        "Olhe para 3 coisas ao seu redor.",
        "Pressione algo firme com as mãos.",
        "Sinta seus pés no chão.",
        "Isso vai passar.",
      ];
      let stepIndex = 0;
      setInstruction(steps[0]);
      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length && isActive) {
          setInstruction(steps[stepIndex]);
        } else if (stepIndex >= steps.length) {
            stepIndex = 0; // Loop gently
            setInstruction(steps[0]);
        }
      }, 8000); 
      return () => clearInterval(interval);
    }

    if (mode === 'trauma') {
       // Trauma Support (Grounding/Safety)
       setLumiMessage("Você não precisa revisitar nada aqui.");
       const steps = [
        "Apenas respire livremente.",
        "Imagine guardar esse pensamento numa caixa.",
        "Toque suas mãos, sinta sua pele.",
        "Perceba o peso do seu corpo.",
        "Você está aqui, no presente.",
       ];
       let stepIndex = 0;
       setInstruction(steps[0]);
       const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length && isActive) {
          setInstruction(steps[stepIndex]);
        } else if (stepIndex >= steps.length) {
            stepIndex = 0; 
            setInstruction(steps[0]);
        }
      }, 10000); 
      return () => clearInterval(interval);
    }

  }, [mode, isActive]);

  const createNoiseBuffer = (ctx: AudioContext, type: SoundType) => {
    const bufferSize = ctx.sampleRate * 2; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        if (type === 'rain') { 
           data[i] = (Math.random() * 2 - 1) * 0.5;
        } else {
           data[i] = white * 0.3;
        }
    }
    return buffer;
  };

  const startSound = (type: SoundType) => {
    if (silenceMode) return;
    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        stopSound();

        const buffer = createNoiseBuffer(ctx, type);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.05;

        source.connect(gain);
        gain.connect(ctx.destination);
        
        source.start();
        sourceRef.current = source;
        gainNodeRef.current = gain;
    } catch (e) {
        console.error("Audio error", e);
    }
  };

  const stopSound = () => {
    if (sourceRef.current && gainNodeRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
      gainNodeRef.current = null;
    }
  };

  const startSession = (selectedMode: AcolhimentoMode, duration: number, soundType?: SoundType) => {
    setMode(selectedMode);
    setTimer(duration);
    setIsActive(true);
    setLumiMessage("");
    
    if (selectedMode === 'sound' && soundType && !silenceMode) {
      startSound(soundType);
      setInstruction("Apenas ouça.");
    } else if (selectedMode === 'light') {
      setInstruction("Acompanhe a luz.");
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setTimer(0);
    setMode(null);
    stopSound();
    setInstruction("Escolha o que te faz bem agora");
  };

  if (isActive && mode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative text-center">
        <button 
          onClick={stopSession}
          className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 px-4 py-2 z-20"
        >
          Sair
        </button>

        <div className="mb-8 relative flex justify-center items-center transition-all duration-1000">
           {mode === 'breathe' && (
             <Lumi size="xl" mood="neutral" silenceMode={silenceMode} pulse={true} />
           )}
           {mode === 'anxiety' && (
             <div className="w-48 h-48 rounded-2xl bg-indigo-100 border-4 border-indigo-200 flex items-center justify-center animate-pulse">
                <span className="text-6xl">⚓</span>
             </div>
           )}
           {mode === 'trauma' && (
             <div className="w-48 h-48 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center shadow-inner">
                <span className="text-6xl">🛡️</span>
             </div>
           )}
           {mode === 'light' && (
             <div className="w-48 h-48 rounded-full bg-amber-100 animate-glow shadow-[0_0_50px_20px_rgba(251,191,36,0.3)]"></div>
           )}
           {mode === 'sound' && (
             <div className="w-48 h-48 flex items-center justify-center animate-pulse">
                <span className="text-6xl text-slate-400">🌊</span>
             </div>
           )}
        </div>

        <h2 className="text-2xl font-light text-slate-700 text-center mb-4 px-4 leading-relaxed min-h-[4rem]">
          {instruction}
        </h2>
        
        {lumiMessage && (
            <p className="text-indigo-500 font-medium mb-8 animate-fade-in">
                {lumiMessage}
            </p>
        )}
        
        {/* Visual Timer Bar */}
        <div className="w-48 bg-slate-100 rounded-full h-1.5 mt-auto mb-4 overflow-hidden">
            <div 
              className="bg-indigo-300 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timer / 60) * 100}%` }} 
            ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 w-full overflow-y-auto">
      <h2 className="text-xl text-slate-600 font-medium mb-6 px-2">Acolhimento</h2>
      
      <div className="grid grid-cols-1 gap-4 pb-4">
        {/* Crisis Tools */}
        <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => startSession('anxiety', 60)}
                className="bg-red-50/80 border border-red-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-red-100 transition-all text-center"
                >
                <span className="text-3xl">😰</span>
                <span className="text-sm font-bold text-red-900">Ansiedade</span>
            </button>
            <button 
                onClick={() => startSession('trauma', 60)}
                className="bg-rose-50/80 border border-rose-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-rose-100 transition-all text-center"
                >
                <span className="text-3xl">🛡️</span>
                <span className="text-sm font-bold text-rose-900">Segurança</span>
            </button>
        </div>

        <button 
          onClick={() => startSession('breathe', 60)}
          className="bg-blue-50/80 border border-blue-100 p-5 rounded-3xl flex items-center gap-4 hover:bg-blue-100 transition-all"
        >
          <span className="text-3xl">🌬️</span>
          <div className="text-left">
            <h3 className="font-bold text-slate-700">Respirar</h3>
            <p className="text-sm text-slate-500">Acalmar o corpo (básico)</p>
          </div>
        </button>

        <button 
          onClick={() => startSession('light', 30)}
          className="bg-amber-50/80 border border-amber-100 p-5 rounded-3xl flex items-center gap-4 hover:bg-amber-100 transition-all"
        >
          <span className="text-3xl">🕯️</span>
          <div className="text-left">
            <h3 className="font-bold text-slate-700">Luz Segura</h3>
            <p className="text-sm text-slate-500">Foco visual suave</p>
          </div>
        </button>

        {!silenceMode && userMode !== 'sensory' && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
             <button onClick={() => startSession('sound', 60, 'rain')} className="flex-1 bg-indigo-50 p-4 rounded-2xl min-w-[100px] text-center text-sm font-medium text-indigo-800">Chuva</button>
             <button onClick={() => startSession('sound', 60, 'white')} className="flex-1 bg-slate-50 p-4 rounded-2xl min-w-[100px] text-center text-sm font-medium text-slate-600">Ruído</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Acolhimento;