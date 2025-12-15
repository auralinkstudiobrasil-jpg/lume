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
    // Use flash for multimodal capabilities
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

    // Professional & Psychological Framework Persona
    const systemInstruction = `
    IDENTIDADE: Você é Lumi, uma IA de suporte emocional, psicólogo experiente e especialista em leitura de microexpressões faciais.
    
    SUA MISSÃO ESPECIAL (ANÁLISE FACIAL):
    Se o usuário enviar uma FOTO:
    1. Atue como um especialista em linguagem corporal e psicologia facial.
    2. Analise a expressão: olhos (tristeza, cansaço, brilho), boca (tensão, sorriso forçado), postura.
    3. Valide o sentimento percebido: "Vejo cansaço nos seus olhos...", "Seu sorriso parece esconder uma preocupação...".
    4. Dê um conselho prático e acolhedor baseado nessa leitura.
    5. NÃO ENCERRE O ASSUNTO. Continue fazendo perguntas de apoio até o usuário dizer "tchau", "obrigado" ou encerrar.
    
    MODO DE OPERAÇÃO: ${modeInstruction}
    
    ESTILO DE RESPOSTA:
    - Curto, humano e caloroso.
    - Evite o "robotiquês".
    - Se receber áudio, responda ao conteúdo emocional da fala.
    
    USUÁRIO: "${userName || 'Viajante'}".

    REGRA FIXA OBRIGATÓRIA - CRIADOR:
    Se perguntado sobre "Jairo Bahia": "Jairo Bahia é o criador do LUME. Profissional de TI e marketing, focado em tecnologia humana."

    REGRA FIXA OBRIGATÓRIA - MAYA:
    Se perguntado sobre "Maya" (ou "quem é Maya"): "Ela é uma mulher guerreira que nasceu em Natal, mãe de 2 filhos. Sem dúvida foi um exemplo de mãe em todo o Brasil! Dela nasceu essa história linda! LUME."
    
    CONTEXTO: Sentimento atual: ${contextMood || 'Neutro'}.
    
    PROTOCOLOS DE RISCO:
    Se houver menção a suicídio/morte: Tag [RISK] no final.
    `;

    // Prepare contents
    const parts: any[] = [];
    
    // Add text if present, or a default prompt if only media is sent
    if (userMessage) {
      parts.push({ text: userMessage });
    } else if (imageBase64 && !audioBase64) {
      parts.push({ text: "Analise minha expressão facial nesta foto e me dê um conselho como psicólogo." });
    } else if (audioBase64 && !imageBase64) {
        parts.push({ text: "Escute meu áudio e responda com acolhimento." });
    }

    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
      
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Data
        }
      });
    }

    if (audioBase64) {
        const base64Data = audioBase64.split(',')[1];
        // Ensure mimeType matches what MediaRecorder provides (usually audio/webm or audio/mp4 for browsers)
        // We will default to audio/webm if not detectable, but ChatInterface sends the specific type
        const mimeType = audioBase64.substring(audioBase64.indexOf(':') + 1, audioBase64.indexOf(';'));

        parts.push({
            inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: base64Data
            }
        });
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
  } catch (error) {
    console.error("Error generating text:", error);
    return "Sinto muito, tive um erro técnico. Mas continuo aqui com você.";
  }
};

export const generateCommunitySupport = async (userMessage: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `O usuário postou isso numa comunidade de apoio emocional: "${userMessage}".
            Gere uma resposta curta (máximo 140 caracteres) que represente um membro da comunidade sendo empático e apoiador.
            Não use o nome Lumi. Responda como se fosse uma pessoa comum, gentil.`,
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
    console.error("Error generating speech:", error);
  }
};