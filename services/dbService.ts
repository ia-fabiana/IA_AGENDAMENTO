
import { supabase } from './supabase';
import { BusinessConfig, Service, Appointment, AIConfig } from '../types';

export const dbService = {
  // Verificação de Saúde
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('tenants').select('id').limit(1);
      if (error) throw error;
      console.log('Database connection successful');
      return true;
    } catch (e) {
      console.error('Database connection failed:', e);
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
  async getAppointments(tenantId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('data_hora', { ascending: true });
    
    return data?.map(d => ({
      id: d.id,
      tenantId: d.tenant_id,
      customerName: d.cliente_nome,
      phoneNumber: d.cliente_fone,
      serviceId: d.servico_id,
      serviceName: d.servico_nome,
      date: d.data_hora,
      status: d.status,
      value: d.valor
    })) || [];
  },

  async createAppointment(apt: Appointment, googleCalendarEventId?: string) {
    try {
      // Save appointment to database
      // Google Calendar integration should be handled by backend API
      const result = await supabase.from('agendamentos').insert({
        id: apt.id,
        tenant_id: apt.tenantId,
        cliente_nome: apt.customerName,
        cliente_fone: apt.phoneNumber,
        servico_id: apt.serviceId,
        servico_nome: apt.serviceName,
        data_hora: apt.date,
        status: apt.status,
        valor: apt.value,
        google_calendar_event_id: googleCalendarEventId || null,
        google_calendar_synced: !!googleCalendarEventId,
        google_calendar_sync_error: null
      });

      if (result.error) {
        console.error('Failed to save appointment to database:', result.error);
        throw result.error;
      }

      console.log('Appointment created:', apt.id);

      return result;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  },

  // Get Google Calendar token for tenant
  async getGoogleCalendarToken(tenantId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('google_oauth_token, google_calendar_sync_enabled')
        .eq('id', tenantId)
        .single();

      if (error || !data || !data.google_calendar_sync_enabled) {
        return null;
      }

      return data.google_oauth_token;
    } catch (error) {
      console.error('Failed to get Google Calendar token:', error);
      return null;
    }
  },

  // Save Google Calendar token for tenant
  async saveGoogleCalendarToken(tenantId: string, encryptedToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          google_oauth_token: encryptedToken,
          google_calendar_sync_enabled: true,
          google_calendar_last_sync: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) throw error;

      console.log('Google Calendar token saved for tenant:', tenantId);
      return true;
    } catch (error) {
      console.error('Failed to save Google Calendar token:', error);
      return false;
    }
  }
};
