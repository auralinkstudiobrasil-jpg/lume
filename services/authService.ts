import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export const signUpUser = async (email: string, password: string, profileData: Partial<UserProfile>) => {
  if (!supabase) throw new Error("Supabase não configurado.");

  // 1. Criar Auth User
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: profileData.username,
        age: profileData.age,
        personality: profileData.personality
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signInUser = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase não configurado.");
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

export const sendPasswordResetEmail = async (email: string) => {
    if (!supabase) throw new Error("Supabase não configurado.");
    
    // O URL de redirecionamento deve estar configurado no painel do Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, 
    });

    if (error) throw error;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    if (!supabase) return;
    
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    
    if (error) throw error;
};