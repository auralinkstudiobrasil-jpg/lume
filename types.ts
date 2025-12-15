
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
  image?: string; // Base64 string for the image
  audio?: string; // URL or Base64 for audio
  isAudioPlaying?: boolean;
  isSafetyMessage?: boolean;
}

export interface CommunityMessage {
  id: string;
  author: string;
  avatar: string; // Emoji or Initials
  text: string;
  image?: string; // Base64
  audio?: string; // Base64
  isModerator?: boolean;
  timestamp: number;
  user_id?: string; // Added for Supabase linking
}

export interface Tab {
  id: 'home' | 'acolhimento' | 'community' | 'chat' | 'diary';
  label: string;
  icon: React.ReactNode;
}

export type AppView = 'welcome' | 'mode_select' | 'landing' | 'checkin' | 'content';
export type AcolhimentoMode = 'breathe' | 'light' | 'sound' | 'grounding' | 'anxiety' | 'trauma';

// --- Diary Types ---

export type DiaryMode = 'dashboard' | 'draw' | 'text' | 'color' | 'shape' | 'audio' | 'guided';

export interface DiaryEntry {
  id: string;
  date: number;
  type: 'draw' | 'text' | 'color' | 'shape' | 'audio' | 'guided';
  content: string; // Text content, Base64 image, or JSON string for shapes/colors
  preview?: string; // Small preview for list
  user_id?: string; // Added for Supabase linking
}

export interface ShapeItem {
  id: string;
  type: 'circle' | 'square' | 'line' | 'light';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
}

// --- Supabase Database Definitions (Optional for strict typing) ---
export interface DatabaseProfile {
  id: string;
  display_name: string;
  user_mode: UserMode;
  avatar_emoji: string;
}
