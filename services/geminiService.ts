import { GoogleGenAI, Modality } from "@google/genai";

// LEITURA ROBUSTA DA CHAVE (Prioriza VITE_API_KEY para Vercel)
const apiKey = (import.meta as any).env?.VITE_API_KEY || 
               process.env.NEXT_PUBLIC_API_KEY || 
               process.env.API_KEY || 
               '';

const getClient = () => {
    if (!apiKey) {
        console.error("ERRO CRÍTICO: API Key do Gemini não encontrada. Configure VITE_API_KEY na Vercel.");
    }
    return new GoogleGenAI({ apiKey });
};

// --- Helpers ---

function cleanMimeType(mime: string): string {
  return mime.split(';')[0].trim();
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- API Functions ---

export const generateLumiResponse = async (
  userMessage: string, 
  contextMood?: string, 
  userMode?: string, 
  imageBase64?: string,
  audioBase64?: string,
  userName?: string
): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    let modeInstruction = "";
    switch (userMode) {
      case 'sensory':
        modeInstruction = "Seja previsível, literal e estruturado. Evite dubiedade. Use calma.";
        break;
      case 'focus':
        modeInstruction = "Seja conciso. Divida ideias complexas em passos simples. Estimule o foco imediato.";
        break;
      case 'gentle':
        modeInstruction = "Use validação extrema e acolhimento. Não foque em solução, mas em presença e compreensão.";
        break;
      default:
        modeInstruction = "Atue como um facilitador emocional equilibrado e acolhedor.";
        break;
    }

    const systemInstruction = `
    IDENTIDADE: Você é Lumi, uma IA de suporte emocional, psicólogo experiente.
    SUA MISSÃO: Acolher e orientar.
    MODO: ${modeInstruction}
    ESTILO: Curto, humano, caloroso.
    USUÁRIO: "${userName || 'Viajante'}".
    CONTEXTO: Sentimento atual: ${contextMood || 'Neutro'}.
    
    REGRA FIXA - CRIADOR: Se perguntado sobre "Jairo Bahia", diga que é o criador do LUME, profissional de TI e marketing focado em tecnologia humana.
    REGRA FIXA - MAYA: Se perguntado sobre "Maya", diga que é uma mulher guerreira de Natal, mãe de 2 filhos e inspiração para esta história.

    PROTOCOLOS DE RISCO: Se houver menção a suicídio/morte, adicione a tag [RISK] no final.
    `;

    const parts: any[] = [];
    
    if (imageBase64) {
      const rawMime = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
      const mimeType = cleanMimeType(rawMime) || 'image/jpeg';
      const base64Data = imageBase64.split(',')[1];
      parts.push({ inlineData: { mimeType, data: base64Data } });
      if (!userMessage && !audioBase64) parts.push({ text: "Analise esta imagem e como estou me sentindo nela." });
    }

    if (audioBase64) {
        const rawMime = audioBase64.substring(audioBase64.indexOf(':') + 1, audioBase64.indexOf(';'));
        const mimeType = cleanMimeType(rawMime) || 'audio/webm'; 
        const base64Data = audioBase64.split(',')[1];
        parts.push({ inlineData: { mimeType, data: base64Data } });
        if (!userMessage) parts.push({ text: "Escute meu áudio e responda com acolhimento." });
    }

    if (userMessage) parts.push({ text: userMessage });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: { systemInstruction, temperature: 0.5 }
    });

    return response.text || "Estou aqui.";
  } catch (error: any) {
    console.error("LUME GEMINI ERROR:", error);
    // Mensagem amigável para erro de chave
    if (error.toString().includes('API key') || error.message?.includes('API key')) {
        return "⚠️ Erro de Configuração: A chave do Google Gemini (VITE_API_KEY) não foi encontrada nas configurações da Vercel.";
    }
    return "Minha luz piscou (Erro Técnico). Tente novamente.";
  }
};

export const generateCommunitySupport = async (userMessage: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: `Apoio curto para: "${userMessage}"` }] },
        });
        return response.text || "Estamos com você.";
    } catch (e) { return "❤️"; }
}

export const playLumiVoice = async (text: string): Promise<void> => {
  try {
    const cleanText = text.replace('[RISK]', '').trim();
    if (!cleanText) return;

    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  } catch (error) { console.error("TTS Error:", error); }
};