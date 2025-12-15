import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateLumiResponse, playLumiVoice } from '../services/geminiService';
import Lumi from './Lumi';

interface ChatInterfaceProps {
  silenceMode: boolean;
  contextMood?: string;
  userName?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ silenceMode, contextMood, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'lumi', text: userName ? `Oi, ${userName}. Estou aqui para te ouvir e te ver.` : 'Tô aqui. Sem pressa.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => {
      messages.forEach(msg => {
        if (msg.image && msg.image.startsWith('blob:')) URL.revokeObjectURL(msg.image);
        if (msg.audio && msg.audio.startsWith('blob:')) URL.revokeObjectURL(msg.audio);
      });
    };
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedImage, isRecording, isLoading]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Audio Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        sendAudioMessage(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone Error:", err);
      alert("Não consegui acessar o microfone. Verifique as permissões do navegador.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
     try {
       const audioBase64 = await blobToBase64(audioBlob);
       const audioUrl = URL.createObjectURL(audioBlob);

       const userMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: 'Mensagem de voz',
          audio: audioUrl
       };

       setMessages(prev => [...prev, userMsg]);
       setIsLoading(true);

       // Send to API
       const fullResponse = await generateLumiResponse(
          "", 
          contextMood,
          undefined,
          selectedImage || undefined,
          audioBase64,
          userName
       );
       
       if (selectedImage) handleRemoveImage();
       
       processLumiResponse(fullResponse);
     } catch (e) {
         console.error("Audio send error:", e);
         setIsLoading(false);
     }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const currentText = inputText;
    const currentImage = selectedImage;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentText,
      image: currentImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    handleRemoveImage();
    setIsLoading(true);

    try {
      const fullResponse = await generateLumiResponse(
        currentText, 
        contextMood,
        undefined, 
        currentImage || undefined,
        undefined,
        userName
      );
      processLumiResponse(fullResponse);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
         id: Date.now().toString(),
         sender: 'lumi',
         text: "Tive um problema técnico, mas continuo aqui."
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  const processLumiResponse = async (fullResponse: string) => {
      const isRisk = fullResponse.includes('[RISK]');
      const cleanText = fullResponse.replace('[RISK]', '').trim();

      const lumiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'lumi',
        text: cleanText,
        isSafetyMessage: isRisk
      };

      setMessages(prev => [...prev, lumiMsg]);
      setIsLoading(false);
      
      if (!silenceMode) {
        await playLumiVoice(cleanText);
      }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header Fixo */}
      <div className="flex-none p-3 flex justify-center border-b border-slate-100 bg-white/50 backdrop-blur-sm rounded-t-3xl relative z-10">
         <div className="absolute left-4 top-4 text-[10px] text-slate-400 max-w-[100px] leading-tight">
            *Dados apagados ao sair.
         </div>
        <Lumi size="sm" mood={contextMood as any || 'neutral'} silenceMode={silenceMode} />
      </div>

      {/* Área de rolagem elástica */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 text-base leading-relaxed overflow-hidden ${
                msg.sender === 'user' 
                  ? 'bg-indigo-500 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
              }`}
            >
              {msg.image && (
                <div className="mb-3 rounded-xl overflow-hidden bg-black/10">
                  <img src={msg.image} alt="Upload" className="w-full h-auto object-cover max-h-60" />
                </div>
              )}
              
              {msg.audio && (
                 <div className="mb-2 flex items-center gap-2">
                    <audio controls src={msg.audio} className="h-8 max-w-[200px]" />
                 </div>
              )}

              {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
            </div>
            
            {msg.isSafetyMessage && (
              <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-[85%]">
                 <p className="text-sm text-amber-800 mb-3 font-medium">Se quiser falar com alguém:</p>
                 <a href="tel:188" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold inline-block">Ligar 188 (CVV)</a>
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
        <div className="h-2"></div> {/* Spacer for very bottom */}
      </div>

      {/* Input Area fixa na parte inferior */}
      <div className="flex-none p-4 bg-white border-t border-slate-100 rounded-b-3xl relative z-20">
        
        {selectedImage && (
          <div className="absolute bottom-full left-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center gap-4 shadow-sm rounded-t-2xl z-20">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
                 <p className="text-xs font-bold text-indigo-600">Imagem selecionada</p>
            </div>
            <button onClick={handleRemoveImage} className="ml-auto text-slate-400 p-2">✕</button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all flex-shrink-0"
            disabled={isRecording || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>

          {isRecording ? (
             <div className="flex-1 flex items-center justify-center bg-red-50 rounded-xl px-4 py-3 border border-red-100 animate-pulse cursor-pointer" onClick={stopRecording}>
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-500 font-bold text-sm">Gravando...</span>
             </div>
          ) : (
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={silenceMode ? "Escreva..." : "Fale com Lumi..."}
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 disabled:bg-slate-50 text-base"
                disabled={isLoading}
            />
          )}

          {inputText.trim() || selectedImage ? (
            <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-indigo-600 transition-colors shadow-sm flex-shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
            </button>
          ) : (
             <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isLoading}
                className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    isRecording 
                        ? 'bg-red-500 text-white scale-110 shadow-lg' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;