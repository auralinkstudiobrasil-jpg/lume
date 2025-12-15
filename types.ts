import React from 'react';

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
  id: 'home' | 'acolhimento' | 'community' | 'chat' | 'diary' | 'profile';
  label: string;
  icon: React.ReactNode;
}

export type AppView = 'welcome' | 'auth' | 'mode_select' | 'landing' | 'checkin' | 'content';
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

// --- Social Profile Types ---
export interface UserProfile {
  id: string;
  username: string;
  age: string;
  personality: 'Autista' | 'TDAH' | 'Depressivo' | 'Neurotípico' | 'Outro';
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  playlist?: string[]; // Links or embedded content
  gallery?: string[]; // Images
}