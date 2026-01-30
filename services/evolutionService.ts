import { Instance } from '../types';

/**
 * EVOLUTION API SERVICE - SaaS EDITION
 * Gerencia instâncias únicas por cliente (Tenant)
 */

// ✅ CORRIGIDO: URL HTTPS com SSL
export const EVOLUTION_API_URL = 'https://api.iafabiana.com.br';

// ✅ CORRIGIDO: API key real
const EVOLUTION_API_KEY = 'minha_chave_secreta_123';

export const evolutionService = {
  // Gera um nome de instância seguro baseado no Tenant ID
  formatInstanceName: (tenantId: string ) => `ia_tenant_${tenantId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,

  // Cria ou recupera uma instância para um cliente específico
  createInstance: async (tenantId: string): Promise<Instance> => {
    const instanceName = evolutionService.formatInstanceName(tenantId);
    
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          instanceName: instanceName,
          token: `tok_${tenantId.substring(0, 5)}`,
          qrcode: true
        })
      });

      const data = await response.json();
      
      // Caso a instância já exista no Evolution Manager
      if (response.status === 403 || response.status === 409 || (data.message && data.message.includes('exists'))) {
        return {
          id: instanceName,
          tenant_id: tenantId,
          instance_name: instanceName,
          evolution_token: 'existing',
          status_conexao: 'connecting'
        };
      }

      if (!response.ok) throw new Error(data.message || 'Erro ao processar instância');

      return {
        id: data.instance?.instanceId || instanceName,
        tenant_id: tenantId,
        instance_name: instanceName,
        evolution_token: data.hash || data.token,
        status_conexao: 'connecting'
      };
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error("BLOCK_CORS");
      }
      throw error;
    }
  },

  // Busca o QR Code (sempre gera um novo se necessário)
  getQRCode: async (instanceName: string): Promise<string> => {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': EVOLUTION_API_KEY }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Falha ao obter QR Code');
    }

    const data = await response.json();
    const base64String = data.base64 || data.code?.base64 || data.qrcode?.base64;
    
    if (!base64String) throw new Error('O servidor está processando o QR Code...');

    return base64String.startsWith('data:image') 
      ? base64String 
      : `data:image/png;base64,${base64String}`;
  },

  // Verifica o estado real no WhatsApp
  validateHandshake: async (instanceName: string): Promise<{connected: boolean, number?: string}> => {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const data = await response.json();
      const isOpen = data.instance?.state === 'open' || data.state === 'open';
      return { 
        connected: isOpen, 
        number: data.instance?.ownerJid || data.instance?.number 
      };
    } catch {
      return { connected: false };
    }
  },

  logoutInstance: async (instanceName: string): Promise<boolean> => {
    try {
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      return true;
    } catch {
      return false;
    }
  },

  // Envia mensagem de texto via WhatsApp
  sendMessage: async (instanceName: string, to: string, message: string): Promise<boolean> => {
    try {
      // Normaliza o número (remove caracteres não numéricos)
      const normalizedNumber = to.replace(/\D/g, '');
      const remoteJid = normalizedNumber.includes('@') ? normalizedNumber : `${normalizedNumber}@s.whatsapp.net`;

      const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: remoteJid,
          text: message,
          delay: 1200
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erro ao enviar mensagem:', error);
        return false;
      }

      console.log('✅ Mensagem enviada com sucesso para:', to);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  },

  // Configura o webhook para receber mensagens
  setWebhook: async (instanceName: string, webhookUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          url: webhookUrl,
          webhook_by_events: false,
          webhook_base64: false,
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE'
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erro ao configurar webhook:', error);
        return false;
      }

      console.log('✅ Webhook configurado com sucesso:', webhookUrl);
      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar webhook:', error);
      return false;
    }
  }
};
