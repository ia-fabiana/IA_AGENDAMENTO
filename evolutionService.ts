// services/evolutionService.ts
// Serviço para integração com Evolution API via Backend Proxy

const API_BASE = '/api/evolution'; // Proxy local (mesmo domínio)
const INSTANCE_NAME = 'ia-agendamentos-main';

interface InstanceResponse {
  instance: {
    instanceName: string;
    status: string;
  };
  hash?: {
    apikey: string;
  };
  qrcode?: {
    base64: string;
  };
}

interface ConnectionStatusResponse {
  instance: {
    instanceName: string;
    state: string;
  };
}

class EvolutionService {
  private instanceName: string = INSTANCE_NAME;

  /**
   * Criar uma nova instância na Evolution API
   */
  async createInstance(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: this.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar instância');
      }

      const data: InstanceResponse = await response.json();
      console.log('Instância criada:', data);
      
      return data.instance.instanceName;
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      throw new Error(error.message || 'Erro ao criar instância');
    }
  }

  /**
   * Gerar QR Code para conexão do WhatsApp
   */
  async generateQRCode(): Promise<string> {
    try {
      // Primeiro, tentar conectar à instância existente
      const connectResponse = await fetch(`${API_BASE}/instance/connect/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!connectResponse.ok) {
        // Se a instância não existir, criar uma nova
        console.log('Instância não existe, criando nova...');
        await this.createInstance();
        
        // Tentar conectar novamente
        const retryResponse = await fetch(`${API_BASE}/instance/connect/${this.instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!retryResponse.ok) {
          throw new Error('Erro ao conectar após criar instância');
        }

        const retryData: InstanceResponse = await retryResponse.json();
        if (!retryData.qrcode?.base64) {
          throw new Error('QR Code não gerado');
        }

        return retryData.qrcode.base64;
      }

      const data: InstanceResponse = await connectResponse.json();
      
      if (!data.qrcode?.base64) {
        throw new Error('QR Code não disponível');
      }

      return data.qrcode.base64;
    } catch (error: any) {
      console.error('Erro ao gerar QR Code:', error);
      throw new Error(error.message || 'Erro ao gerar QR Code');
    }
  }

  /**
   * Verificar status da conexão
   */
  async getConnectionStatus(): Promise<{ state: string; instanceName: string }> {
    try {
      const response = await fetch(`${API_BASE}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return { state: 'close', instanceName: this.instanceName };
      }

      const data: ConnectionStatusResponse = await response.json();
      
      return {
        state: data.instance.state,
        instanceName: data.instance.instanceName
      };
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return { state: 'close', instanceName: this.instanceName };
    }
  }

  /**
   * Desconectar instância
   */
  async disconnect(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/instance/logout/${this.instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar');
      }

      console.log('Instância desconectada com sucesso');
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      throw new Error(error.message || 'Erro ao desconectar');
    }
  }

  /**
   * Enviar mensagem via WhatsApp
   */
  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: phoneNumber,
          text: message
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }

      console.log('Mensagem enviada com sucesso');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error(error.message || 'Erro ao enviar mensagem');
    }
  }
}

export const evolutionService = new EvolutionService();
