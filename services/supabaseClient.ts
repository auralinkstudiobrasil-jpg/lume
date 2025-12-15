import { createClient } from '@supabase/supabase-js';

// No Vercel, defina estas variáveis de ambiente:
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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