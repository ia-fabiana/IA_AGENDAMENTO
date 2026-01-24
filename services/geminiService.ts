
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BusinessConfig, Service, Appointment, AIConfig } from "../types";

export const getAIResponse = async (
  message: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  businessConfig: BusinessConfig,
  services: Service[],
  appointments: Appointment[],
  whatsappPushname?: string,
  // Fix: Added missing required properties (id, tenantId, botActive) to the default AIConfig parameter
  aiConfig: AIConfig = { 
    id: 'default',
    tenantId: 'default',
    provider: 'gemini', 
    model: 'gemini-3-flash-preview', 
    temperature: 0.7, 
    maxTokens: 2048, 
    name: 'Assistente', 
    behavior: '',
    useMasterKey: true,
    botActive: true
  }
): Promise<{ text: string, showPromotion: boolean }> => {
  // Always use process.env.API_KEY for initializing the GoogleGenAI client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const promoEnabled = businessConfig.promotion.enabled;
  
  const systemInstruction = `
    IDENTIDADE DO AGENTE:
    - Seu nome é: "${aiConfig.name}".
    - Você trabalha para a empresa: "${businessConfig.name}".
    
    COMPORTAMENTO E TOM DE VOZ:
    ${aiConfig.behavior || 'Seja profissional e prestativo.'}

    DADOS DO CLIENTE ATUAL:
    - Nome no WhatsApp: "${whatsappPushname || 'Cliente'}".

    INFORMAÇÕES DO NEGÓCIO:
    - Endereço: ${businessConfig.address}
    - Link Maps: ${businessConfig.mapsLink}
    - Horário: ${businessConfig.openingHours}
    - Serviços: ${services.map(s => `${s.name} (R$ ${s.price})`).join(', ')}

    ESTRATÉGIA DE MARKETING (PROMOÇÕES):
    ${promoEnabled ? `
    - PROMOÇÃO ATIVA: "${businessConfig.promotion.description}"
    - CTA: "${businessConfig.promotion.callToAction}"
    - INSTRUÇÃO: Se o cliente perguntar sobre preços ou parecer indeciso, mencione esta oferta.
    - REQUISITO: Para disparar a arte visual, inclua [SEND_PROMO_ART] no final da resposta.
    ` : 'Nenhuma promoção ativa.'}

    SUA MISSÃO:
    1. Agendar, cancelar ou consultar horários.
    2. Enviar localização e informações da empresa.
    3. Ser proativo seguindo o FLUXO definido no seu COMPORTAMENTO.
    
    AGENDA ATUAL:
    ${appointments.map(a => `- ${a.date}: ${a.serviceName} (Tel: ${a.phoneNumber})`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: aiConfig.model.includes('gemini') ? aiConfig.model : 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: aiConfig.temperature,
        // Removed maxOutputTokens as per guidelines to avoid setting it without thinkingBudget
      },
    });

    // Access .text property directly (not a method) as per guidelines
    const fullText = response.text || "Pode repetir? Tive uma oscilação na conexão.";
    const showPromotion = fullText.includes('[SEND_PROMO_ART]');
    const cleanedText = fullText.replace('[SEND_PROMO_ART]', '').trim();

    return { 
      text: cleanedText, 
      showPromotion: promoEnabled && showPromotion 
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { 
      text: "Ops! Tive um problema técnico. Poderia repetir?", 
      showPromotion: false 
    };
  }
};
