
import { Instance } from '../types';

/**
 * EVOLUTION API SERVICE - SaaS EDITION
 * Gerencia instâncias únicas por cliente (Tenant)
 */

// ✅ CORREÇÃO: Usar variáveis de ambiente em vez de valores fixos
export const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'http://95.217.232.92:8080';
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || 'minha_chave_secreta_123';

export const evolutionService = {
  formatInstanceName: (tenantId: string) => `ia_tenant_${tenantId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,

  // Cria ou recupera uma instância
  createInstance: async (tenantId: string): Promise<Instance> => {
    const instanceName = evolutionService.formatInstanceName(tenantId);
    
    try {
      // ✅ CORREÇÃO: Usar proxy local em vez de URL externa
      const response = await fetch(`/evolution-api/instance/create`, {
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
      
      // 403 ou 409 geralmente significa que a instância já existe
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
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error("BLOCK_CORS");
      }
      throw error;
    }
  },

  // Busca o QR Code com sistema de retries (tentativas)
  getQRCode: async (instanceName: string, retries = 5): Promise<string> => {
    let lastError = '';
    
    for (let i = 0; i < retries; i++) {
      try {
        // ✅ CORREÇÃO: Usar proxy local
        const response = await fetch(`/evolution-api/instance/connect/${instanceName}`, {
          method: 'GET',
          headers: { 'apikey': EVOLUTION_API_KEY }
        });

        if (!response.ok) {
          const err = await response.json();
          lastError = err.message || 'Erro na API';
          await new Promise(r => setTimeout(r, 2000)); // Aguarda 2s antes de tentar de novo
          continue;
        }

        const data = await response.json();
        // A Evolution API pode retornar o base64 em diferentes campos dependendo da versão
        const base64String = data.base64 || data.code?.base64 || data.qrcode?.base64;
        
        if (base64String) {
          return base64String.startsWith('data:image') 
            ? base64String 
            : `data:image/png;base64,${base64String}`;
        }
        
        lastError = 'QR Code ainda sendo gerado pelo servidor...';
        await new Promise(r => setTimeout(r, 2000));
      } catch (e: any) {
        lastError = e.message;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    throw new Error(lastError || 'Não foi possível obter o QR Code após várias tentativas.');
  },

  // Verifica o estado real no WhatsApp
  validateHandshake: async (instanceName: string): Promise<{connected: boolean, number?: string}> => {
    try {
      // ✅ CORREÇÃO: Usar proxy local
      const response = await fetch(`/evolution-api/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const data = await response.json();
      
      // Verifica múltiplos caminhos de resposta possíveis
      const state = data.instance?.state || data.state || data.status;
      const isOpen = state === 'open' || state === 'CONNECTED';
      
      return { 
        connected: isOpen, 
        number: data.instance?.ownerJid || data.instance?.number || data.number 
      };
    } catch {
      return { connected: false };
    }
  },

  logoutInstance: async (instanceName: string): Promise<boolean> => {
    try {
      // ✅ CORREÇÃO: Usar proxy local
      await fetch(`/evolution-api/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      return true;
    } catch {
      return false;
    }
  }
};
