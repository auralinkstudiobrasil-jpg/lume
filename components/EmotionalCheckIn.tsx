import React from 'react';
import { MoodType } from '../types';

interface EmotionalCheckInProps {
  onSelect: (mood: MoodType) => void;
}

const EmotionalCheckIn: React.FC<EmotionalCheckInProps> = ({ onSelect }) => {
  const options: { type: MoodType; icon: string; label: string; color: string }[] = [
    { type: 'sunny', icon: '☀️', label: 'Bem', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
    { type: 'cloudy', icon: '⛅', label: 'Mais ou menos', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
    { type: 'rainy', icon: '🌧️', label: 'Triste', color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300' },
    { type: 'stormy', icon: '🌪️', label: 'Difícil', color: 'bg-slate-200 hover:bg-slate-300 border-slate-400' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-4">
      <h2 className="text-2xl font-bold text-slate-700 mb-8 text-center">Como está o clima aí dentro?</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className={`${opt.color} border-2 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 shadow-sm`}
            aria-label={`Sentindo-se ${opt.label}`}
          >
            <span className="text-4xl" role="img" aria-hidden="true">{opt.icon}</span>
            <span className="text-slate-700 font-semibold">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmotionalCheckIn;