
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { BusinessConfig, Service, Appointment, AIConfig } from "../types";

/**
 * ENGINE DE IA PARA PRODUÇÃO SaaS
 * Utiliza Gemini 3 para alta precisão em agendamentos.
 */

const bookingTools: FunctionDeclaration[] = [
  {
    name: "listar_servicos",
    description: "Retorna o catálogo atualizado de serviços, preços e tempos de duração.",
    // Corrected: Removed parameters as Type.OBJECT cannot be empty per guidelines.
  },
  {
    name: "verificar_disponibilidade",
    description: "Consulta a agenda real para ver se um horário está vago.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        data_hora: { type: Type.STRING, description: "Data e hora ISO (Ex: 2024-12-30T15:00:00)" }
      },
      required: ["data_hora"]
    }
  },
  {
    name: "confirmar_agendamento",
    description: "Grava definitivamente o agendamento no banco de dados do cliente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        cliente_nome: { type: Type.STRING },
        servico_id: { type: Type.STRING },
        data_hora: { type: Type.STRING }
      },
      required: ["cliente_nome", "servico_id", "data_hora"]
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
    id: 'Sofia', tenantId: 'prod', provider: 'gemini', 
    model: 'gemini-3-flash-preview', temperature: 0.7, maxTokens: 2048, 
    name: 'Sofia', behavior: '', useMasterKey: true, botActive: true
  }
) => {
  if (!aiConfig.botActive) return { 
    text: "Sistema temporariamente offline para manutenção.", 
    showPromotion: false,
    functionCalls: undefined,
    usage: { totalTokens: 0 }
  };

  // Always use process.env.API_KEY for initializing the GoogleGenAI client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    VOCÊ É UM AGENTE DE VENDAS REAL.
    Nome: "${aiConfig.name}". Empresa: "${businessConfig.name}".
    Endereço: ${businessConfig.address}.
    
    REGRAS DE NEGÓCIO:
    - Sua missão é converter conversas em AGENDAMENTOS.
    - Se o cliente perguntar valores, use a função 'listar_servicos'.
    - Nunca confirme um horário sem antes usar 'verificar_disponibilidade'.
    - Use 'confirmar_agendamento' apenas após o cliente dar o OK final.
    
    PROMOÇÃO ATIVA:
    ${businessConfig.promotion.enabled ? `"${businessConfig.promotion.description}". Ofereça isso se o cliente estiver em dúvida.` : 'Nenhuma no momento.'}
    
    COMPORTAMENTO: ${aiConfig.behavior}
  `;

  try {
    // Correctly call generateContent with the model from config or fallback to flash preview.
    const response = await ai.models.generateContent({
      model: aiConfig.model.includes('gemini') ? aiConfig.model : 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { 
        systemInstruction, 
        temperature: aiConfig.temperature,
        tools: [{ functionDeclarations: bookingTools }]
      },
    });

    // Directly access the .text property as per guidelines.
    const responseText = response.text || "Pode repetir? Tive uma oscilação na rede.";
    
    // Return text and metadata including usage statistics to fix the reported TypeScript error.
    return { 
      text: responseText.replace('[SEND_PROMO_ART]', '').trim(), 
      showPromotion: responseText.includes('[SEND_PROMO_ART]'),
      functionCalls: response.functionCalls,
      usage: {
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Critical AI Engine Failure:", error);
    return { 
      text: "Tive um problema técnico. Por favor, tente novamente em alguns instantes.", 
      showPromotion: false,
      functionCalls: undefined,
      usage: { totalTokens: 0 }
    };
  }
};
