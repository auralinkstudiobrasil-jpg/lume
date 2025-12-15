import { createClient } from '@supabase/supabase-js';

// Tenta ler variáveis de ambiente de múltiplas formas para compatibilidade (Next.js vs Vite vs Standard)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Cria o cliente APENAS se as chaves existirem.
// Se não existirem (ex: esqueceu de configurar no Vercel), retorna null
// Isso evita o erro "supabaseUrl is required" que causa a TELA BRANCA.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper para verificar se está conectado
export const checkConnection = async () => {
    if (!supabase) return false;
    try {
        const { error } = await supabase.from('community_messages').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        console.error("Erro conexão Supabase:", e);
        return false;
    }
};