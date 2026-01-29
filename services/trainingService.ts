import { supabase } from './supabase';
import { BusinessConfig, Service } from '../types';

export const trainingService = {
  /**
   * Salva ou atualiza a configuração de negócio de um tenant
   */
  async saveBusinessConfig(tenantId: string, config: BusinessConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          endereco: config.address,
          link_maps: config.mapsLink,
          horario_funcionamento: config.openingHours,
          politica_cancelamento: config.cancellationPolicy,
          tempo_minimo_antecedencia: config.minAdvanceTime,
          promocao_ativa: config.promotion.enabled,
          promocao_descricao: config.promotion.description,
          promocao_imagem: config.promotion.imageData || null,
          promocao_cta: config.promotion.callToAction,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) {
        console.error('Error saving business config:', error);
        throw new Error(`Falha ao salvar configuração: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in saveBusinessConfig:', error);
      throw error;
    }
  },

  /**
   * Carrega a configuração de negócio de um tenant
   */
  async loadBusinessConfig(tenantId: string): Promise<BusinessConfig | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.error('Error loading business config:', error);
        throw new Error(`Falha ao carregar configuração: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.nome_negocio || '',
        address: data.endereco || '',
        mapsLink: data.link_maps || '',
        openingHours: data.horario_funcionamento || 'Seg a Sex, 09h às 18h',
        cancellationPolicy: data.politica_cancelamento || 'Cancelamento com 24h de antecedência',
        minAdvanceTime: data.tempo_minimo_antecedencia || 60,
        promotion: {
          enabled: data.promocao_ativa || false,
          description: data.promocao_descricao || '',
          imageData: data.promocao_imagem || undefined,
          callToAction: data.promocao_cta || ''
        }
      };
    } catch (error: any) {
      console.error('Error in loadBusinessConfig:', error);
      throw error;
    }
  },

  /**
   * Salva ou atualiza serviços de um tenant
   */
  async saveServices(tenantId: string, services: Service[]): Promise<void> {
    try {
      // Primeiro, deletar todos os serviços existentes do tenant
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('tenant_id', tenantId);

      if (deleteError) {
        console.error('Error deleting old services:', deleteError);
        throw new Error(`Falha ao deletar serviços antigos: ${deleteError.message}`);
      }

      // Depois, inserir os novos serviços
      if (services.length > 0) {
        const servicesData = services.map(service => ({
          id: service.id,
          tenant_id: tenantId,
          nome: service.name,
          preco: service.price,
          duracao_minutos: service.duration
        }));

        const { error: insertError } = await supabase
          .from('services')
          .insert(servicesData);

        if (insertError) {
          console.error('Error inserting services:', insertError);
          throw new Error(`Falha ao salvar serviços: ${insertError.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error in saveServices:', error);
      throw error;
    }
  },

  /**
   * Carrega os serviços de um tenant
   */
  async loadServices(tenantId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error loading services:', error);
        throw new Error(`Falha ao carregar serviços: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(item => ({
        id: item.id,
        tenantId: item.tenant_id,
        name: item.nome || '',
        price: Number(item.preco) || 0,
        duration: item.duracao_minutos || 30
      }));
    } catch (error: any) {
      console.error('Error in loadServices:', error);
      throw error;
    }
  },

  /**
   * Salva tanto a configuração quanto os serviços de uma vez
   */
  async saveTrainingData(tenantId: string, config: BusinessConfig, services: Service[]): Promise<void> {
    try {
      // Salvar configuração
      await this.saveBusinessConfig(tenantId, config);
      
      // Salvar serviços
      await this.saveServices(tenantId, services);
    } catch (error: any) {
      console.error('Error in saveTrainingData:', error);
      throw error;
    }
  }
};
