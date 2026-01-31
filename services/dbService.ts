
import { supabase } from './supabase.ts';
import { BusinessConfig, Service, Appointment } from '../types.ts';

export const dbService = {
  // Verificação de Saúde
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('tenants').select('id').limit(1);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Erro de conexão Supabase:", e);
      return false;
    }
  },

  // Configurações do Negócio
  async getBusinessConfig(tenantId: string): Promise<BusinessConfig | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (error) return null;
    return {
      id: data.id,
      name: data.nome_negocio,
      phoneNumber: data.whatsapp_oficial || '',
      address: data.endereco || '',
      mapsLink: data.link_maps || '',
      openingHours: data.horario_funcionamento || '',
      cancellationPolicy: data.politica_cancelamento || '',
      minAdvanceTime: data.antecedencia_minima || 2,
      promotion: data.config_promocao || { enabled: false, description: '', callToAction: '' }
    };
  },

  async updateBusinessConfig(config: BusinessConfig) {
    return await supabase
      .from('tenants')
      .update({
        nome_negocio: config.name,
        whatsapp_oficial: config.phoneNumber,
        endereco: config.address,
        link_maps: config.mapsLink,
        horario_funcionamento: config.openingHours,
        politica_cancelamento: config.cancellationPolicy,
        antecedencia_minima: config.minAdvanceTime,
        config_promocao: config.promotion
      })
      .eq('id', config.id);
  },

  // Serviços
  async getServices(tenantId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('tenant_id', tenantId);
    
    return data || [];
  },

  async saveService(service: Service) {
    return await supabase.from('servicos').upsert(service);
  },

  // Agendamentos
  async getAppointments(tenantId: string): Promise<{ data: Appointment[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('data_hora', { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return { data: [], error: error.message };
      }
  
      return {
        data: data?.map(d => ({
          id: d.id,
          tenantId: d.tenant_id,
          customerName: d.cliente_nome,
          phoneNumber: d.cliente_fone,
          serviceId: d.servico_id,
          serviceName: d.servico_nome,
          date: d.data_hora,
          status: d.status,
          value: d.valor
        })) || []
      };
    } catch (error: any) {
      console.error("Erro ao buscar agendamentos:", error);
      return { data: [], error: error?.message || 'Erro desconhecido' };
    }
  },

  async createAppointment(apt: Appointment) {
    return await supabase.from('agendamentos').insert({
      id: apt.id,
      tenant_id: apt.tenantId,
      cliente_nome: apt.customerName,
      cliente_fone: apt.phoneNumber,
      servico_id: apt.serviceId,
      servico_nome: apt.serviceName,
      data_hora: apt.date,
      status: apt.status,
      valor: apt.value
    });
  }
};
