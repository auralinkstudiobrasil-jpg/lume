import React, { useState, useEffect, useRef } from 'react';
import { CommunityMessage } from '../types';
import { sanitizeText, registerViolation, checkBanStatus } from '../services/moderationService';
import { generateCommunitySupport } from '../services/geminiService';
import { getCommunityMessages, postToCommunity, subscribeToMessages } from '../services/communityService';
import { supabase } from '../services/supabaseClient';
import Lumi from './Lumi';

interface CommunityChatProps {
    isGuest: boolean;
    onRegisterRequest: () => void;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ isGuest, onRegisterRequest }) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banMinutes, setBanMinutes] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Se for convidado, não carrega nada e mostra tela de bloqueio
  if (isGuest) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="mb-6 scale-110">
                  <Lumi mood="neutral" size="md" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-3">Área Exclusiva da Família</h2>
              <p className="text-slate-500 mb-8 max-w-xs">
                  Para participar da comunidade, compartilhar histórias e fazer amigos, você precisa fazer parte da família LUME.
              </p>
              <button 
                onClick={onRegisterRequest}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                  FAÇA PARTE DA FAMÍLIA!
              </button>
          </div>
      )
  }

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      const data = await getCommunityMessages(); 
      setMessages(data);
      setIsLoading(false);
    };
    loadMessages();

    const subscription = subscribeToMessages((newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    const status = checkBanStatus();
    if (status.isBanned) {
      setIsBanned(true);
      setBanMinutes(status.minutesRemaining);
    }

    return () => {
      if(subscription && subscription.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const status = checkBanStatus();
    if (status.isBanned) {
        setIsBanned(true);
        setBanMinutes(status.minutesRemaining);
        return;
    }

    const { sanitized, detected } = sanitizeText(inputText);

    if (detected) {
       const violation = registerViolation();
       if (violation.isBanned) {
         setIsBanned(true);
         setBanMinutes(1440); 
         setWarning(null);
       } else {
         setWarning(`Atenção: Linguagem ofensiva detectada.`);
         setTimeout(() => setWarning(null), 5000);
       }
       setInputText('');
       return; 
    }

    // Criar mensagem temporária
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    
    // Tentativa de pegar nome do perfil ou usar fallback
    let authorName = 'Membro da Família';
    if (user) {
        // Num cenário ideal, pegamos do perfil carregado no App.tsx e passamos via props
        // Aqui vamos simplificar
        authorName = user.user_metadata?.username || 'Membro';
    }

    const newMessage: CommunityMessage = {
      id: 'temp-' + Date.now(),
      author: authorName,
      avatar: '👤',
      text: sanitized,
      timestamp: Date.now()
    };
    
    // Posta
    await postToCommunity(newMessage);
    setInputText('');
  };

  if (isBanned) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/90 rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Chat Pausado</h2>
        <p className="text-slate-500 mb-6">Acesso suspenso temporariamente.</p>
        <div className="bg-white px-6 py-3 rounded-xl border border-slate-200">
           <p className="text-sm font-bold text-slate-600">Restam</p>
           <p className="text-2xl font-mono text-indigo-600">~{Math.ceil(banMinutes / 60)}h</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-indigo-50 border-b border-indigo-100 p-3 text-center flex-none">
         <p className="text-xs text-indigo-800 font-medium flex items-center justify-center gap-2">
           <span>🟢</span> Comunidade Oficial LUME
         </p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide"
      >
        {isLoading && (
            <div className="flex justify-center p-4">
                <Lumi size="sm" mood="neutral" pulse={true} />
            </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.author === 'Você' || (supabase && msg.user_id === supabase.auth.getUser()['id']) ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm flex-shrink-0 ${msg.isModerator ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'}`}>
              {msg.avatar}
            </div>
            
            <div className={`max-w-[80%] flex flex-col items-start`}>
               <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.author}</span>
               <div 
                  className={`p-3 rounded-2xl text-sm shadow-sm overflow-hidden break-words bg-white border border-slate-100 text-slate-600`}
               >
                 {msg.image && (
                    <img src={msg.image} alt="User art" className="w-full h-auto rounded-lg mb-2 max-h-48 object-cover border border-slate-100" />
                 )}
                 {msg.audio && (
                    <div className="mb-2">
                         <audio controls src={msg.audio} className="h-8 w-48" />
                    </div>
                 )}
                 {msg.text && <p>{msg.text}</p>}
               </div>
            </div>
          </div>
        ))}
        <div className="h-2"></div>
      </div>

      {warning && (
        <div className="px-4 py-2 bg-red-100 border-t border-red-200 flex-none">
           <p className="text-xs text-red-700 font-bold text-center">{warning}</p>
        </div>
      )}

      <div className="flex-none p-4 bg-white border-t border-slate-100 rounded-b-3xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Compartilhe com a família..."
            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-indigo-600 transition-colors flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;