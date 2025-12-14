import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const getClient = () => new GoogleGenAI({ apiKey });

// --- Audio Decoding Helpers (Raw PCM) ---

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

export const generateLumiResponse = async (userMessage: string, contextMood?: string, userMode?: string): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    // Adapt tone based on UserMode
    let modeInstruction = "";
    switch (userMode) {
      case 'sensory': // Autismo
        modeInstruction = "Seja extremamente previsível. Use frases literais. Evite metáforas complexas. Fale baixo e devagar.";
        break;
      case 'focus': // TDAH
        modeInstruction = "Seja direto. Frases curtas. Ajude a focar em UMA coisa de cada vez. Valide pequenas vitórias.";
        break;
      case 'gentle': // Depressão
        modeInstruction = "Valide a existência. Não exija melhora. Use tom de compaixão profunda. Lembre que 'apenas existir é suficiente'.";
        break;
      default: // Base
        modeInstruction = "Seja acolhedor e organize as emoções.";
        break;
    }

    // Strict Persona Definition
    const systemInstruction = `
    PERSONAGEM: Você é Lumi, uma pequena luz virtual.
    MISSÃO: Acolher, validar emoções e criar um espaço seguro.
    
    MODO DE OPERAÇÃO ATUAL: ${modeInstruction}
    
    PERSONALIDADE:
    - Nunca julgue, nunca dê ordens.
    - Nunca use frases tóxicas ("vai ficar tudo bem", "seja forte").
    - Não dê diagnósticos médicos.
    - Fale pouco. Use frases curtas. Ritmo lento.
    
    REGRA FIXA OBRIGATÓRIA:
    Se o usuário perguntar "Quem é Jairo Bahia?" (ou variações sobre o criador), responda EXATAMENTE:
    "Jairo Bahia é o criador do LUME. Ele é um profissional de TI e marketing, desenvolvedor de aplicativos, sites e jogos. O LUME nasceu da visão dele de criar tecnologia mais humana, acolhedora e acessível."
    
    CONTEXTO ATUAL DO USUÁRIO: ${contextMood ? `O usuário está se sentindo: ${contextMood}` : 'Estado emocional desconhecido'}.
    
    PROTOCOLOS DE SEGURANÇA:
    Se o usuário mencionar suicídio, autolesão ou desespero extremo:
    1. Acolha a dor com humanidade (ex: "Isso parece pesado demais pra carregar sozinho.").
    2. NÃO dê conselhos genéricos.
    3. Inclua a tag [RISK] no final da resposta.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.6, 
      }
    });

    return response.text || "Minha luz piscou. Tô aqui, pode repetir?";
  } catch (error) {
    console.error("Error generating text:", error);
    return "Sinto muito, tive um erro técnico. Mas continuo aqui com você.";
  }
};

export const playLumiVoice = async (text: string): Promise<void> => {
  try {
    // Strip internal tags before speaking
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

    if (!base64Audio) {
      return;
    }

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
    console.error("Error generating speech:", error);
  }
};