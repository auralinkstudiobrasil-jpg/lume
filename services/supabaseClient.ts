import { createClient } from '@supabase/supabase-js';

// Tenta ler variáveis de ambiente de múltiplas formas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ SUPABASE KEYS MISSING: Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidos no arquivo .env ou no painel da Vercel.");
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