import { supabase } from './supabaseClient';
import { CommunityMessage } from '../types';

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

export const getCommunityMessages = async (): Promise<CommunityMessage[]> => {
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
  try {
    // Tenta pegar o usuário atual, se houver
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('community_messages').insert({
      user_id: user?.id || null, // Se for anônimo, envia null (se o banco permitir) ou trate auth antes
      author: message.author,
      avatar: message.avatar,
      text: message.text,
      image: message.image,
      audio: message.audio,
      is_moderator: message.isModerator || false,
      // created_at é gerado automaticamente pelo banco
    });

    if (error) throw error;
  } catch (e) {
    console.error("Erro ao enviar mensagem:", e);
    alert("Erro ao enviar. Verifique sua conexão.");
  }
};

// Função para ouvir novas mensagens em Tempo Real
export const subscribeToMessages = (onNewMessage: (msg: CommunityMessage) => void) => {
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
