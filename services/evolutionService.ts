
import { Instance } from '../types';

/**
 * EVOLUTION API SERVICE - SaaS EDITION
 * Gerencia instâncias únicas por cliente (Tenant)
 */

// Exported for use in UI components (e.g., Connections view for CORS authorization link)
export const EVOLUTION_API_URL = 'http://95.217.232.92:8080';
const EVOLUTION_API_KEY = 'minha_chave_secreta_123';

export const evolutionService = {
  // Gera um nome de instância seguro baseado no Tenant ID
  formatInstanceName: (tenantId: string) => `ia_tenant_${tenantId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,

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
  }
};
