
import { supabase } from './supabase';

export interface Tenant {
  id: string;
  nome_negocio: string;
  plano: 'Bronze' | 'Prata' | 'Ouro' | 'Grátis';
  saldo_creditos: number;
  created_at: string;
}

export interface CreateTenantInput {
  nome_negocio: string;
  plano: 'Bronze' | 'Prata' | 'Ouro' | 'Grátis';
  saldo_creditos: number;
}

export interface UpdateTenantInput {
  nome_negocio?: string;
  plano?: 'Bronze' | 'Prata' | 'Ouro' | 'Grátis';
  saldo_creditos?: number;
}

export const tenantService = {
  /**
   * Lista todos os tenants
   */
  async listTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar tenants:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Busca um tenant por ID
   */
  async getTenant(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar tenant:', error);
      return null;
    }

    return data;
  },

  /**
   * Cria um novo tenant
   */
  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar tenant:', error);
      throw error;
    }

    // Criar configuração padrão do agente
    await supabase.from('agentes').insert([{
      tenant_id: data.id,
      nome_agente: 'Assistente',
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      system_prompt: 'Você é um assistente profissional. Seu tom de voz é elegante e prestativo.',
      temperature: 0.7,
      max_tokens: 2048,
      bot_active: true,
    }]);

    return data;
  },

  /**
   * Atualiza um tenant existente
   */
  async updateTenant(id: string, input: UpdateTenantInput): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tenant:', error);
      throw error;
    }

    return data;
  },

  /**
   * Deleta um tenant
   */
  async deleteTenant(id: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar tenant:', error);
      throw error;
    }
  },

  /**
   * Adiciona créditos a um tenant
   */
  async addCredits(id: string, amount: number): Promise<Tenant> {
    const tenant = await this.getTenant(id);
    if (!tenant) throw new Error('Tenant não encontrado');

    const newBalance = tenant.saldo_creditos + amount;
    return this.updateTenant(id, { saldo_creditos: newBalance });
  },

  /**
   * Remove créditos de um tenant
   */
  async removeCredits(id: string, amount: number): Promise<Tenant> {
    const tenant = await this.getTenant(id);
    if (!tenant) throw new Error('Tenant não encontrado');

    const newBalance = Math.max(0, tenant.saldo_creditos - amount);
    return this.updateTenant(id, { saldo_creditos: newBalance });
  },

  /**
   * Gera link único para o tenant
   */
  generateTenantLink(tenantId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?tenant=${tenantId}`;
  },
};
