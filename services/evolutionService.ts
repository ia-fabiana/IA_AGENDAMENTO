
import { Instance } from '../types';

/**
 * EVOLUTION API SERVICE - v1.7.4 PRODUCTION
 * Configurado para o domínio seguro https://api.iafabiana.com.br
 */

export const evolutionApiUrl = process.env.VITE_EVOLUTION_API_URL || 'https://api.iafabiana.com.br';
export const evolutionApiKey = process.env.VITE_EVOLUTION_API_KEY || ''; 

export const evolutionService = {
  formatInstanceName: (businessName: string) => {
    // Gera um nome de instância limpo baseado no nome do negócio
    return `IA_${businessName.replace(/\s+/g, '_').toUpperCase().substring(0, 15)}`;
  },

  createInstance: async (businessName: string): Promise<Instance> => {
    const instanceName = evolutionService.formatInstanceName(businessName);
    
    try {
      if (!evolutionApiKey) throw new Error('MISSING_EVOLUTION_API_KEY');
      const response = await fetch(`${evolutionApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          instanceName: instanceName,
          token: `tok_${instanceName}`,
          qrcode: true,
          number: ""
        })
      });

      const data = await response.json();
      
      if (response.status === 403 || response.status === 409 || (data.message && data.message.includes('exists'))) {
        return {
          id: instanceName,
          tenant_id: 'prod',
          instance_name: instanceName,
          evolution_token: 'existing',
          status_conexao: 'connecting'
        };
      }

      return {
        id: data.instance?.instanceId || instanceName,
        tenant_id: 'prod',
        instance_name: instanceName,
        evolution_token: data.hash || data.token,
        status_conexao: 'connecting'
      };
    } catch (error: any) {
      if (error.name === 'TypeError') throw new Error("PROTOCOL_MISMATCH");
      throw error;
    }
  },

  getQRCode: async (instanceName: string): Promise<string> => {
    try {
      if (!evolutionApiKey) throw new Error('MISSING_EVOLUTION_API_KEY');
      const response = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': evolutionApiKey }
      });

      if (!response.ok) throw new Error("RETRY");

      const data = await response.json();
      const base64String = data.base64 || data.code || (data.qrcode && data.qrcode.base64);
      
      if (base64String && base64String.length > 50) {
        return base64String.startsWith('data:image') 
          ? base64String 
          : `data:image/png;base64,${base64String}`;
      }
      throw new Error("WAITING");
    } catch (e: any) {
      if (e.name === 'TypeError') throw new Error("PROTOCOL_MISMATCH");
      throw e;
    }
  },

  validateHandshake: async (instanceName: string): Promise<{connected: boolean, number?: string}> => {
    try {
      if (!evolutionApiKey) throw new Error('MISSING_EVOLUTION_API_KEY');
      const response = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': evolutionApiKey }
      });
      const data = await response.json();
      const state = data.instance?.state || data.state || data.status;
      return { 
        connected: ['open', 'CONNECTED'].includes(state), 
        number: data.instance?.ownerJid || data.instance?.number 
      };
    } catch {
      return { connected: false };
    }
  },

  logoutInstance: async (instanceName: string): Promise<boolean> => {
    try {
      if (!evolutionApiKey) throw new Error('MISSING_EVOLUTION_API_KEY');
      await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: { 'apikey': evolutionApiKey }
      });
      return true;
    } catch {
      return false;
    }
  }
};
