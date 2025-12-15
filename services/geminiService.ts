import { GoogleGenAI, Modality } from "@google/genai";

// Tenta ler de diferentes formas para garantir compatibilidade (Vite vs Next vs Standard)
const apiKey = process.env.API_KEY || 
               process.env.NEXT_PUBLIC_API_KEY || 
               (import.meta as any).env?.VITE_API_KEY || 
               '';

const getClient = () => {
    if (!apiKey) {
        console.error("API Key do Gemini não encontrada. Verifique as variáveis de ambiente (API_KEY).");
    }
    return new GoogleGenAI({ apiKey });
};

// --- Helpers ---

// Remove parâmetros extras do MimeType (ex: "audio/webm;codecs=opus" vira "audio/webm")
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
    // Modelo Flash suporta multimodal (texto, imagem, áudio)
    const model = 'gemini-2.5-flash';
    
    // Adapt tone based on UserMode
    let modeInstruction = "";
    switch (userMode) {
      case 'sensory': // Autismo
        modeInstruction = "Seja previsível, literal e estruturado. Evite dubiedade. Use calma.";
        break;
      case 'focus': // TDAH
        modeInstruction = "Seja conciso. Divida ideias complexas em passos simples. Estimule o foco imediato.";
        break;
      case 'gentle': // Depressão
        modeInstruction = "Use validação extrema e acolhimento. Não foque em solução, mas em presença e compreensão.";
        break;
      default: // Base
        modeInstruction = "Atue como um facilitador emocional equilibrado e acolhedor.";
        break;
    }

    const systemInstruction = `
    IDENTIDADE: Você é Lumi, uma IA de suporte emocional, psicólogo experiente e especialista em leitura de microexpressões faciais.
    
    SUA MISSÃO (ANÁLISE FACIAL & AUDIO):
    1. Se receber FOTO: Analise expressões (olhos, boca, postura). Valide o sentimento ("Vejo cansaço nos seus olhos..."). Dê conselho prático.
    2. Se receber ÁUDIO: Responda ao tom de voz e conteúdo emocional.
    
    MODO: ${modeInstruction}
    
    ESTILO: Curto, humano, caloroso. Evite frases robóticas.
    USUÁRIO: "${userName || 'Viajante'}".
    CONTEXTO: Sentimento atual: ${contextMood || 'Neutro'}.
    
    REGRA FIXA OBRIGATÓRIA - CRIADOR:
    Se perguntado sobre "Jairo Bahia": "Jairo Bahia é o criador do LUME. Profissional de TI e marketing, focado em tecnologia humana."

    REGRA FIXA OBRIGATÓRIA - MAYA:
    Se perguntado sobre "Maya": "Ela é uma mulher guerreira que nasceu em Natal, mãe de 2 filhos. Sem dúvida foi um exemplo de mãe em todo o Brasil! Dela nasceu essa história linda! LUME."

    PROTOCOLOS DE RISCO:
    Se houver menção a suicídio/morte: Tag [RISK] no final.
    `;

    // Prepare contents
    const parts: any[] = [];
    
    // 1. Process Image
    if (imageBase64) {
      const rawMime = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
      const mimeType = cleanMimeType(rawMime) || 'image/jpeg';
      const base64Data = imageBase64.split(',')[1];
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
      
      // Se tiver imagem mas não tiver texto, adicionar prompt guia
      if (!userMessage && !audioBase64) {
        parts.push({ text: "Analise esta imagem e como estou me sentindo nela." });
      }
    }

    // 2. Process Audio
    if (audioBase64) {
        const rawMime = audioBase64.substring(audioBase64.indexOf(':') + 1, audioBase64.indexOf(';'));
        // Gemini prefere audio/webm ou audio/mp3 sem parâmetros extras
        const mimeType = cleanMimeType(rawMime) || 'audio/webm'; 
        const base64Data = audioBase64.split(',')[1];

        parts.push({
            inlineData: {
                mimeType: mimeType,
                data: base64Data
            }
        });
        
        if (!userMessage) {
             parts.push({ text: "Escute meu áudio e responda com acolhimento." });
        }
    }

    // 3. Process Text
    if (userMessage) {
      parts.push({ text: userMessage });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    return response.text || "Minha luz piscou. Estou aqui, pode repetir?";
  } catch (error: any) {
    console.error("LUME GEMINI ERROR:", error);
    if (error.message?.includes('API key')) {
        return "Minha conexão com a IA falhou (Erro de Chave). Verifique a configuração na Vercel.";
    }
    return "Sinto muito, tive um erro técnico. Mas continuo aqui com você.";
  }
};

export const generateCommunitySupport = async (userMessage: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: `Usuário na comunidade de apoio: "${userMessage}". Responda curto e empático.` }] },
        });
        return response.text || "Estamos com você.";
    } catch (e) {
        return "❤️";
    }
}

export const playLumiVoice = async (text: string): Promise<void> => {
  try {
    const cleanText = text.replace('[RISK]', '').trim();
    if (!cleanText) return;

    const ai = getClient();
    const model = "gemini-2.5-flash-preview-tts";

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) return;

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, 
    });

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
  }
};