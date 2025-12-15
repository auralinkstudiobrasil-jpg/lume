import { supabase } from './supabaseClient';
import { CommunityMessage } from '../types';

const STORAGE_KEY = 'lume_community_messages';

// Mapeia os dados do banco (snake_case) para o tipo do App (camelCase)
const mapFromDb = (row: any): CommunityMessage => ({
  id: row.id,
  user_id: row.user_id,
  author: row.author,
  avatar: row.avatar || '👤',
  text: row.text,
  image: row.image,
  audio: row.audio,
  isModerator: row.is_moderator,
  timestamp: new Date(row.created_at).getTime(),
});

// Mensagens iniciais de exemplo (fallback offline)
const INITIAL_MESSAGES: CommunityMessage[] = [
  { id: '1', author: 'Lumi Moderador', avatar: '🛡️', text: 'Bem-vindos à Comunidade LUME. O chat está offline (Local). Configure o Supabase para conectar ao mundo.', isModerator: true, timestamp: Date.now() },
];

export const getCommunityMessages = async (): Promise<CommunityMessage[]> => {
  // SE NÃO TIVER SUPABASE CONFIGURADO, USA LOCALSTORAGE (Evita quebrar o app)
  if (!supabase) {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : INITIAL_MESSAGES;
    } catch { return INITIAL_MESSAGES; }
  }

  // SE TIVER SUPABASE, BUSCA DO BANCO
  try {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;
    return (data || []).map(mapFromDb);
  } catch (e) {
    console.error("Erro ao buscar mensagens:", e);
    return [];
  }
};

export const postToCommunity = async (message: CommunityMessage): Promise<void> => {
  // MODO OFFLINE / SEM SUPABASE
  if (!supabase) {
      const messages = await getCommunityMessages(); // Pega do local
      const newMessages = [...messages, message];
      if (newMessages.length > 50) newMessages.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
      return;
  }

  // MODO ONLINE
  try {
    // Tenta pegar usuario (opcional)
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('community_messages').insert({
      user_id: user?.id || null, 
      author: message.author,
      avatar: message.avatar,
      text: message.text,
      image: message.image,
      audio: message.audio,
      is_moderator: message.isModerator || false,
    });

    if (error) throw error;
  } catch (e) {
    console.error("Erro ao enviar mensagem:", e);
    // Fallback: Salva localmente se falhar o envio online? Não misturar para não confundir.
    // Apenas alerta.
    alert("Erro de conexão. Tente novamente.");
  }
};

// Função para ouvir novas mensagens em Tempo Real
export const subscribeToMessages = (onNewMessage: (msg: CommunityMessage) => void) => {
  if (!supabase) return { unsubscribe: () => {} };

  return supabase
    .channel('public:community_messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'community_messages' },
      (payload) => {
        const newMessage = mapFromDb(payload.new);
        onNewMessage(newMessage);
      }
    )
    .subscribe();
};