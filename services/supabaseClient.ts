import { createClient } from '@supabase/supabase-js';

// LEITURA ROBUSTA DAS CHAVES (Prioriza VITE_... para Vercel)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ ERRO CRÍTICO: Chaves do Supabase ausentes. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.");
}

// Cria o cliente APENAS se as chaves existirem.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const checkConnection = async () => {
    if (!supabase) return false;
    try {
        const { error } = await supabase.from('community_messages').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
};