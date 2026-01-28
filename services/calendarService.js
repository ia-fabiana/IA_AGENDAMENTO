import { google } from 'googleapis';
import { supabase } from './supabaseClient.js';

// Configuração OAuth2
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://ia-agendamentos-870139342019.us-central1.run.app/auth/google/callback';

class CalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
  }

  /**
   * Gera URL de autorização para o usuário conectar sua conta Google
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Força mostrar tela de consentimento para obter refresh_token
      response_type: 'code' // Parâmetro obrigatório para OAuth2
    });
  }

  /**
   * Troca o código de autorização por tokens de acesso e salva no Supabase
   */
  async getTokensFromCode(code, tenantId) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Obter email do usuário Google
      this.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      const googleEmail = data.email;

      // Salvar tokens no Supabase
      await this.saveTokens(tenantId, tokens, googleEmail);
      
      console.log('✅ Tokens salvos no Supabase:', { 
        tenantId, 
        googleEmail,
        hasAccessToken: !!tokens.access_token, 
        hasRefreshToken: !!tokens.refresh_token 
      });
      
      return { tokens, googleEmail };
    } catch (error) {
      console.error('❌ Erro ao obter tokens do código:', error);
      throw error;
    }
  }

  /**
   * Salva ou atualiza tokens no Supabase
   */
  async saveTokens(tenantId, tokens, googleEmail = null) {
    try {
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .upsert({
          tenant_id: tenantId,
          google_email: googleEmail,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type || 'Bearer',
          expiry_date: tokens.expiry_date,
          scopes: tokens.scope ? tokens.scope.split(' ') : null,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'tenant_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar tokens no Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao salvar tokens:', error);
      throw error;
    }
  }

  /**
   * Busca tokens do Supabase por tenant_id
   */
  async getTokensByTenantId(tenantId) {
    try {
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('❌ Erro ao buscar tokens no Supabase:', error);
        throw error;
      }

      // Converter para formato esperado pelo Google OAuth
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expiry_date: data.expiry_date,
        scope: data.scopes ? data.scopes.join(' ') : null
      };
    } catch (error) {
      console.error('❌ Erro ao buscar tokens:', error);
      throw error;
    }
  }

  /**
   * Verifica se o token está expirado e renova se necessário
   */
  async ensureValidTokens(tenantId) {
    try {
      const tokens = await this.getTokensByTenantId(tenantId);
      
      if (!tokens) {
        throw new Error('No tokens found for tenant');
      }

      // Verificar se o token está expirado (com margem de 5 minutos)
      const now = Date.now();
      const expiryWithMargin = tokens.expiry_date - (5 * 60 * 1000);

      if (now >= expiryWithMargin) {
        console.log('🔄 Token expirado, renovando...');
        const newTokens = await this.refreshAccessToken(tokens.refresh_token);
        await this.saveTokens(tenantId, newTokens);
        return newTokens;
      }

      return tokens;
    } catch (error) {
      console.error('❌ Erro ao garantir tokens válidos:', error);
      throw error;
    }
  }

  /**
   * Define os tokens para o cliente OAuth2
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Atualiza o access_token usando o refresh_token
   */
  async refreshAccessToken(refreshToken) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  /**
   * Lista eventos do calendário
   */
  async listEvents(tenantId, maxResults = 50) {
    const tokens = await this.ensureValidTokens(tenantId);
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  /**
   * Cria um novo evento no calendário
   */
  async createEvent(tenantId, event) {
    const tokens = await this.ensureValidTokens(tenantId);
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  /**
   * Atualiza um evento existente
   */
  async updateEvent(tenantId, eventId, event) {
    const tokens = await this.ensureValidTokens(tenantId);
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
    });

    return response.data;
  }

  /**
   * Deleta um evento
   */
  async deleteEvent(tenantId, eventId) {
    const tokens = await this.ensureValidTokens(tenantId);
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  }

  /**
   * Busca eventos em um intervalo de datas
   */
  async getEventsByDateRange(tenantId, startDate, endDate) {
    const tokens = await this.ensureValidTokens(tenantId);
    this.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  /**
   * Verifica se os tokens ainda são válidos
   */
  async verifyTokens(tenantId) {
    try {
      const tokens = await this.ensureValidTokens(tenantId);
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      await calendar.calendarList.list({ maxResults: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Desconecta o Google Calendar (marca como inativo)
   */
  async disconnect(tenantId) {
    try {
      const { error } = await supabase
        .from('google_calendar_tokens')
        .update({ is_active: false })
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('❌ Erro ao desconectar Google Calendar:', error);
        throw error;
      }

      console.log('✅ Google Calendar desconectado:', { tenantId });
      return true;
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      throw error;
    }
  }

  /**
   * Verifica se o tenant tem Google Calendar conectado
   */
  async isConnected(tenantId) {
    try {
      const tokens = await this.getTokensByTenantId(tenantId);
      return !!tokens;
    } catch (error) {
      return false;
    }
  }
}

export const calendarService = new CalendarService();
