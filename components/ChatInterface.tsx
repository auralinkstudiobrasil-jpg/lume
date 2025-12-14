import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateLumiResponse, playLumiVoice } from '../services/geminiService';
import Lumi from './Lumi';

interface ChatInterfaceProps {
  silenceMode: boolean;
  contextMood?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ silenceMode, contextMood }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'lumi', text: 'Tô aqui. Sem pressa.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pass the mood context to Gemini
      const fullResponse = await generateLumiResponse(inputText, contextMood);
      
      const isRisk = fullResponse.includes('[RISK]');
      const cleanText = fullResponse.replace('[RISK]', '').trim();

      const lumiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'lumi',
        text: cleanText,
        isSafetyMessage: isRisk
      };

      setMessages(prev => [...prev, lumiMsg]);
      
      if (!silenceMode) {
        await playLumiVoice(cleanText);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      <div className="flex-none p-4 flex justify-center border-b border-slate-100 bg-white/50 backdrop-blur-sm rounded-t-3xl">
        <Lumi size="sm" mood={contextMood as any || 'neutral'} silenceMode={silenceMode} />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 text-base leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-500 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            
            {/* Safety Card logic */}
            {msg.isSafetyMessage && (
              <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-[85%] animate-fade-in">
                 <p className="text-sm text-amber-800 mb-3 font-medium">Se quiser falar com alguém agora:</p>
                 <div className="flex flex-wrap gap-2">
                    <a href="tel:188" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition">Ligar 188 (CVV)</a>
                    <a href="https://www.cvv.org.br/chat" target="_blank" rel="noreferrer" className="bg-white border border-amber-600 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium">Chat Online</a>
                 </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
               <div className="flex space-x-2">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
           </div>
        )}
      </div>

      <div className="flex-none p-4 bg-white border-t border-slate-100 rounded-b-3xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={silenceMode ? "Escreva..." : "Fale com Lumi..."}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;