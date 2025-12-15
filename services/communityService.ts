import { CommunityMessage } from '../types';

const STORAGE_KEY = 'lume_community_messages';

const INITIAL_MESSAGES: CommunityMessage[] = [
  { id: '1', author: 'Lumi Moderador', avatar: '🛡️', text: 'Bem-vindos à Comunidade LUME. Aqui nos acolhemos. Compartilhe sua arte, voz ou texto.', isModerator: true, timestamp: Date.now() },
  { id: '2', author: 'Viajante', avatar: '🌿', text: 'Hoje foi um dia difícil, mas consegui levantar da cama.', timestamp: Date.now() - 100000 },
  { id: '3', author: 'Estrela', avatar: '✨', text: 'Parabéns! Um passo de cada vez.', timestamp: Date.now() - 50000 },
];

export const getCommunityMessages = (): CommunityMessage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
        return INITIAL_MESSAGES;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MESSAGES;
  }
};

export const postToCommunity = (message: CommunityMessage): void => {
  try {
    const messages = getCommunityMessages();
    const newMessages = [...messages, message];
    // Keep only last 50 messages to prevent storage overflow
    if (newMessages.length > 50) newMessages.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
  } catch (e) {
    console.error("Erro ao postar na comunidade", e);
  }
};