
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { BusinessConfig, Service, Appointment, AIConfig } from "../types.ts";

const bookingTools: FunctionDeclaration[] = [
  {
    name: "listar_servicos",
    description: "Retorna o catálogo atualizado de serviços, preços e tempos de duração.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        confirmar: { type: Type.BOOLEAN, description: "Confirmação para listar." }
      },
      required: ["confirmar"]
    }
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
    text: "Sistema temporariamente offline.", 
    showPromotion: false,
    functionCalls: undefined,
    usage: { totalTokens: 0 }
  };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    VOCÊ É UM AGENTE DE VENDAS. Nome: "${aiConfig.name}". Empresa: "${businessConfig.name}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: aiConfig.model.includes('gemini') ? aiConfig.model : 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { 
        systemInstruction, 
        temperature: aiConfig.temperature,
        tools: [{ functionDeclarations: bookingTools }]
      },
    });

    const responseText = response.text || "Oscilação na rede.";
    
    return { 
      text: responseText.trim(), 
      showPromotion: responseText.includes('[SEND_PROMO_ART]'),
      functionCalls: response.functionCalls,
      usage: {
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      }
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { text: "Erro técnico.", usage: { totalTokens: 0 } };
  }
};
