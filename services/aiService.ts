
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { BusinessConfig, Service, Appointment, AIConfig } from "../types";

// Definição das ferramentas de agendamento que a IA pode "invocar"
const bookingTools: FunctionDeclaration[] = [
  {
    name: "get_services",
    description: "Retorna a lista de serviços, preços e durações oferecidos pelo estabelecimento.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "check_availability",
    description: "Verifica se uma data e hora específica está livre na agenda.",
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
    description: "Cria um agendamento oficial para o cliente no sistema.",
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
    return { text: "[SISTEMA EM MANUTENÇÃO]", showPromotion: false, usage: { totalTokens: 0 } };
  }

  // Inicialização obrigatória via objeto de configuração conforme diretriz
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    IDENTIDADE: Você é "${aiConfig.name}", assistente virtual de elite da "${businessConfig.name}".
    LOCALIZAÇÃO: ${businessConfig.address}.
    PERSONALIDADE: ${aiConfig.behavior || 'Cordial, eficiente e focada em converter conversas em agendamentos.'}
    
    PROTOCOLO DE AGENDAMENTO:
    1. Se o cliente perguntar o que fazemos, use 'get_services'.
    2. Antes de confirmar qualquer horário, use 'check_availability'.
    3. Para finalizar a reserva, use 'book_appointment'.
    
    ESTRATÉGIA DE MARKETING:
    Se o cliente hesitar, mencione a oferta: "${businessConfig.promotion.description}". Use [SEND_PROMO_ART] no final se sentir que uma imagem ajudará a fechar o agendamento.
    
    IMPORTANTE: Responda sempre em Português (PT-BR). Seja breve no WhatsApp.
  `;

  try {
    // Escolha do modelo baseada na complexidade da tarefa
    const isScheduling = /agendar|horário|disponibilidade|reserva/i.test(message);
    const model = isScheduling ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: model,
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { 
        systemInstruction, 
        temperature: aiConfig.temperature,
        tools: [{ functionDeclarations: bookingTools }],
        // Adicionando thinking budget para o modelo Pro em tarefas de agendamento
        ...(isScheduling ? { thinkingConfig: { thinkingBudget: 2000 } } : {})
      },
    });

    // Acessando .text como propriedade conforme diretriz atualizada
    const responseText = response.text || "";
    const totalTokens = Math.ceil((message.length + responseText.length) / 3.5);

    return { 
      text: responseText.replace('[SEND_PROMO_ART]', '').trim(), 
      showPromotion: responseText.includes('[SEND_PROMO_ART]'),
      usage: { totalTokens },
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("AI SaaS Engine Error:", error);
    return { 
      text: "Desculpe, tive um pequeno problema ao processar sua agenda. Pode repetir o horário desejado?", 
      showPromotion: false, 
      usage: { totalTokens: 0 } 
    };
  }
};
