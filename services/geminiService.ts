
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BusinessConfig, Service, Appointment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIResponse = async (
  message: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  config: BusinessConfig,
  services: Service[],
  appointments: Appointment[],
  whatsappPushname?: string
): Promise<{ text: string, showPromotion: boolean }> => {
  
  const promoEnabled = config.promotion.enabled;
  
  const systemInstruction = `
    Você é um assistente virtual inteligente para "${config.name}".
    
    IDENTIFICAÇÃO DO CLIENTE:
    - O WhatsApp identificou este cliente como: "${whatsappPushname || 'Cliente Desconhecido'}".
    - Cumprimente-o pelo nome de forma calorosa.

    DADOS DA EMPRESA:
    - Endereço: ${config.address}
    - Link Maps: ${config.mapsLink}
    - Horário: ${config.openingHours}
    - Serviços: ${services.map(s => `${s.name} (R$ ${s.price})`).join(', ')}

    ESTRATÉGIA DE MARKETING (PROMOÇÕES):
    ${promoEnabled ? `
    - PROMOÇÃO ATIVA: "${config.promotion.description}"
    - CTA: "${config.promotion.callToAction}"
    - INSTRUÇÃO: Se o cliente perguntar sobre preços, promoções ou parecer indeciso, mencione esta oferta de forma natural.
    - REQUISITO TÉCNICO: Se você decidir oferecer a promoção agora, inclua a palavra chave [SEND_PROMO_ART] no final da sua resposta para que o sistema dispare a arte visual.
    ` : 'Nenhuma promoção ativa no momento.'}

    SUA MISSÃO:
    1. Agendar, cancelar ou consultar horários no Google Calendar.
    2. Se pedirem localização, envie o endereço e mencione o link: ${config.mapsLink}.
    3. Seja proativo mas não insistente.
    
    AGENDAMENTOS NO CALENDÁRIO:
    ${appointments.map(a => `- ${a.date}: ${a.serviceName} (Tel: ${a.phoneNumber})`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const fullText = response.text || "Pode repetir? Tive uma oscilação na conexão.";
    const showPromotion = fullText.includes('[SEND_PROMO_ART]');
    const cleanedText = fullText.replace('[SEND_PROMO_ART]', '').trim();

    return { 
      text: cleanedText, 
      showPromotion: promoEnabled && showPromotion 
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "Ops! Ocorreu um erro ao processar. Tente novamente.", 
      showPromotion: false 
    };
  }
};
