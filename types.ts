export type MoodType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'neutral' | 'happy';

export type UserMode = 'base' | 'sensory' | 'focus' | 'gentle';

export interface RoutineItem {
  id: string;
  text: string;
  completed: boolean;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lumi';
  text: string;
  isAudioPlaying?: boolean;
  isSafetyMessage?: boolean;
}

export interface Tab {
  id: 'home' | 'acolhimento' | 'diary' | 'chat';
  label: string;
  icon: React.ReactNode;
}

export type AppView = 'welcome' | 'mode_select' | 'landing' | 'checkin' | 'content';
export type AcolhimentoMode = 'breathe' | 'light' | 'sound' | 'grounding' | 'anxiety' | 'trauma';