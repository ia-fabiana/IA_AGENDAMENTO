
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { BusinessConfig, Service, Appointment, AIConfig } from "../types";

// Ferramentas que a IA pode "invocar" durante a conversa
const bookingTools: FunctionDeclaration[] = [
  {
    name: "get_services",
    description: "Retorna a lista de serviços, preços e durações oferecidos pelo estúdio.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "check_availability",
    description: "Verifica se uma data e hora específica está livre na agenda do estabelecimento.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Data e hora no formato ISO (Ex: 2024-12-25T14:00:00)" }
      },
      required: ["date"]
    }
  },
  {
    name: "book_appointment",
    description: "Cria um agendamento oficial para o cliente após confirmação.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING },
        serviceId: { type: Type.STRING },
        date: { type: Type.STRING, description: "Data e hora ISO confirmada pelo cliente" }
      },
      required: ["customerName", "serviceId", "date"]
    }
  }
];

export const getAIResponse = async (
  message: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  businessConfig: BusinessConfig,
  services: Service[],
  appointments: Appointment[],
  whatsappPushname?: string,
  aiConfig: AIConfig = { 
    id: 'default', tenantId: 'default', provider: 'gemini', 
    model: 'gemini-3-flash-preview', temperature: 0.7, maxTokens: 2048, 
    name: 'Sofia', behavior: '', useMasterKey: true, botActive: true
  }
): Promise<{ text: string, showPromotion: boolean, usage: { totalTokens: number }, functionCalls?: any[] }> => {
  
  if (!aiConfig.botActive) {
    return { text: "[BOT DESATIVADO]", showPromotion: false, usage: { totalTokens: 0 } };
  }

  // Inicialização obrigatória via objeto de configuração seguindo diretriz @google/genai
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    IDENTIDADE: Você é "${aiConfig.name}", a inteligência artificial da "${businessConfig.name}".
    LOCAL: ${businessConfig.address}.
    REGRAS DO NEGÓCIO: ${aiConfig.behavior || 'Seja prestativa e cordial.'}
    POLÍTICA DE CANCELAMENTO: ${businessConfig.cancellationPolicy}
    CLIENTE: ${whatsappPushname || 'Cliente'}

    CAPACIDADES (TOOLS):
    1. Para preços e serviços: use 'get_services'.
    2. Antes de agendar: use 'check_availability'.
    3. Para confirmar reserva: use 'book_appointment'.

    MARKETING: Se o cliente hesitar, ofereça: "${businessConfig.promotion.description}". Use [SEND_PROMO_ART] no fim da fala para mostrar a imagem.
    
    Responda em Português Brasileiro. Seja concisa mas empática.
  `;

  try {
    // Seleção dinâmica: agendamento exige raciocínio complexo (Pro), papo reto usa Flash
    const modelToUse = message.toLowerCase().includes('agend') || message.toLowerCase().includes('horário') 
      ? 'gemini-3-pro-preview' 
      : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { 
        systemInstruction, 
        temperature: aiConfig.temperature,
        tools: [{ functionDeclarations: bookingTools }]
      },
    });

    // Acessando .text como propriedade conforme diretriz atual da SDK
    const responseText = response.text || "";
    const functionCalls = response.functionCalls;
    const totalTokens = Math.ceil((message.length + responseText.length) / 3.8);

    return { 
      text: responseText.replace('[SEND_PROMO_ART]', '').trim(), 
      showPromotion: responseText.includes('[SEND_PROMO_ART]'),
      usage: { totalTokens },
      functionCalls
    };
  } catch (error) {
    console.error("AI SaaS Gateway Error:", error);
    return { 
      text: "Tive um soluço no meu processador central. Pode repetir sua solicitação, por favor?", 
      showPromotion: false, 
      usage: { totalTokens: 0 } 
    };
  }
};
