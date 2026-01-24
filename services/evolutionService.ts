
import { Instance } from '../types';

/**
 * EVOLUTION API SERVICE
 * Simula a comunicação com o Gateway de WhatsApp
 */
export const evolutionService = {
  // Simula criação de instância na Evolution API
  createInstance: async (tenantId: string, instanceName: string): Promise<Instance> => {
    console.log(`[Evolution] Criando instância para Tenant: ${tenantId}`);
    await new Promise(r => setTimeout(r, 1500));
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      instance_name: instanceName,
      evolution_token: `tok_${Math.random().toString(36).substr(2, 15)}`,
      status_conexao: 'connecting'
    };
  },

  // Simula busca de QR Code Base64
  getQRCode: async (instanceName: string): Promise<string> => {
    console.log(`[Evolution] Buscando QR para: ${instanceName}`);
    await new Promise(r => setTimeout(r, 1000));
    // Retorna um QR genérico para demonstração
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVOLUTION_CONNECT_${instanceName}`;
  },

  // Simula desconexão/logout
  logoutInstance: async (instanceName: string): Promise<boolean> => {
    console.log(`[Evolution] Logout: ${instanceName}`);
    await new Promise(r => setTimeout(r, 800));
    return true;
  }
};
