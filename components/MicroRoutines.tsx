import React, { useState, useEffect } from 'react';
import { RoutineItem, UserMode } from '../types';
import Lumi from './Lumi';

interface MicroRoutinesProps {
  mode: UserMode;
}

const POOLS = {
  base: [
    { text: 'Beber um gole de água', icon: '💧' },
    { text: 'Respirar fundo 1 vez', icon: '🌬️' },
    { text: 'Abrir a janela por 10 segundos', icon: '☀️' },
    { text: 'Encostar os pés no chão', icon: '👣' },
    { text: 'Olhar ao redor e nomear 1 coisa', icon: '👀' },
    { text: 'Alongar os ombros', icon: '🧍‍♂️' },
    { text: 'Ficar parado por 15 segundos', icon: '🕯️' },
    { text: 'Lavar as mãos com água morna', icon: '✋' },
    { text: 'Ouvir um som neutro por 20s', icon: '🎧' },
    { text: 'Guardar um objeto no lugar', icon: '📦' },
  ],
  sensory: [
    { text: 'Olhar um ponto fixo na tela', icon: '👁️' },
    { text: 'Pressionar as mãos uma na outra', icon: '✋' },
    { text: 'Sentir o peso do corpo na cadeira', icon: '🧍‍♀️' },
    { text: 'Encostar as costas na parede', icon: '🧱' },
    { text: 'Escolher uma cor que represente agora', icon: '🎨' },
    { text: 'Inspirar e soltar devagar', icon: '🌬️' },
    { text: 'Pressionar os pés no chão', icon: '👣' },
    { text: 'Ficar em silêncio por 20s', icon: '🔕' },
    { text: 'Observar uma luz estável', icon: '🕯️' },
    { text: 'Alinhar um objeto reto', icon: '📐' },
  ],
  focus: [
    { text: 'Fazer algo por 30 segundos', icon: '⏱️' },
    { text: 'Beber água antes de pensar', icon: '💧' },
    { text: 'Largar o celular e olhar ao redor', icon: '📱' },
    { text: 'Pensar: “agora só isso”', icon: '🧠' },
    { text: 'Ajustar a roupa no corpo', icon: '👕' },
    { text: 'Dar 3 passos', icon: '🚶‍♂️' },
    { text: 'Mover um item de lugar', icon: '🗂️' },
    { text: 'Escrever uma palavra', icon: '✍️' },
    { text: 'Colocar um som neutro', icon: '🎧' },
    { text: 'Concluir algo minúsculo', icon: '✔️' },
  ],
  gentle: [
    { text: 'Ficar sentado respirando', icon: '🕯️' },
    { text: 'Manter os olhos abertos por 10s', icon: '👀' },
    { text: 'Molhar o rosto', icon: '💧' },
    { text: 'Arrumar apenas um canto', icon: '🛏️' },
    { text: 'Deixar a luz entrar um pouco', icon: '☀️' },
    { text: 'Colocar a mão no peito', icon: '✋' },
    { text: 'Escolher uma cor do dia', icon: '🎨' },
    { text: 'Soltar o ar lentamente', icon: '🌬️' },
    { text: 'Ler uma frase curta', icon: '🤍' },
    { text: 'Levantar e sentar', icon: '🧍‍♂️' },
  ]
};

const getRoutinesForMode = (mode: UserMode): RoutineItem[] => {
  const pool = POOLS[mode] || POOLS.base;
  // Simple randomization: pick 3 unique random items based on day/seed 
  // For simplicity here, just shuffle and pick 3. 
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  return selected.map((item, index) => ({
    id: `${mode}-${index}-${Date.now()}`,
    text: item.text,
    completed: false,
    icon: item.icon
  }));
};

const MicroRoutines: React.FC<MicroRoutinesProps> = ({ mode }) => {
  // Use state function to only initialize once per mount
  const [routines, setRoutines] = useState<RoutineItem[]>(() => getRoutinesForMode(mode));

  // Let's force update if the mode prop changes distinct from initial load.
  useEffect(() => {
    setRoutines(getRoutinesForMode(mode));
  }, [mode]);

  const toggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = routines.filter(r => r.completed).length;

  const getLumiMessage = () => {
    if (completedCount === 0) {
      if (mode === 'sensory') return "Nada precisa mudar agora.";
      if (mode === 'focus') return "Começar já é suficiente.";
      if (mode === 'gentle') return "Existir hoje já conta.";
      return "As faíscas não são metas.";
    }
    return "Luz acesa.";
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-700">
          {mode === 'focus' ? 'Foco Rápido' : 
           mode === 'gentle' ? 'Gentileza' :
           mode === 'sensory' ? 'Sensorial' : 'Faíscas'}
        </h2>
        <p className="text-slate-500 mt-2">
          {mode === 'base' ? 'Convites gentis. Se não fizer, tudo bem.' : 
           getLumiMessage()}
        </p>
      </div>

      <div className="flex-1 space-y-5">
        {routines.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleRoutine(item.id)}
            className={`w-full flex items-center p-3 pr-5 rounded-[2rem] transition-all duration-500 border-2 relative overflow-hidden group ${
              item.completed 
                ? 'bg-amber-50/50 border-amber-200 shadow-sm' 
                : 'bg-white/80 border-slate-100 hover:border-indigo-100'
            }`}
          >
            {/* The Lumi Icon Indicator */}
            <div className="mr-4 relative flex-shrink-0">
               <Lumi 
                  mood={item.completed ? 'happy' : 'neutral'} 
                  silenceMode={!item.completed} 
                  size="sm"
               >
                  {item.icon}
               </Lumi>
            </div>

            <div className="relative z-10 flex-1 text-left flex flex-col justify-center">
              <span className={`text-lg font-medium transition-all duration-500 leading-tight ${
                item.completed ? 'text-amber-900' : 'text-slate-600'
              }`}>
                {item.text}
              </span>
              
              <div className={`overflow-hidden transition-all duration-500 ease-out ${item.completed ? 'max-h-6 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                 <p className="text-xs text-amber-600 font-bold">Luz acesa!</p>
              </div>
            </div>

             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ml-2 ${
                item.completed 
                  ? 'bg-green-400 border-green-400 scale-100' 
                  : 'border-slate-200 bg-transparent scale-90'
            }`}>
                <svg 
                  className={`w-3.5 h-3.5 text-white transition-all duration-300 ${item.completed ? 'opacity-100' : 'opacity-0'}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 py-4 px-6 rounded-2xl text-center relative bg-white/50 border border-slate-100">
        <div className={`transition-all duration-700`}>
           {completedCount > 0 ? (
              <p className="text-amber-600 font-medium flex items-center justify-center gap-2">
                 {completedCount === routines.length 
                    ? "Tudo iluminado!" 
                    : "Você acendeu uma luz."}
              </p>
           ) : (
              <p className="text-slate-400 text-sm">
                 Lumi espera o seu tempo.
              </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default MicroRoutines;