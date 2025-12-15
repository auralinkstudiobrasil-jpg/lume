
import { createClient } from '@supabase/supabase-js';

// No Vercel, defina estas variáveis de ambiente:
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY

// Para desenvolvimento local ou teste, você pode preencher temporariamente, 
// mas NUNCA commite chaves reais no GitHub.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para verificar se está conectado
export const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('profiles').select('count').single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 é "no rows", que é ok
        return true;
    } catch (e) {
        console.error("Erro conexão Supabase:", e);
        return false;
    }
};
