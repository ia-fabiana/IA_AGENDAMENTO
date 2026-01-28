import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Configurações do Google OAuth2
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Criar cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Escopos necessários para o Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email'
];

class CalendarService {
  /**
   * Gera a URL de autorização OAuth2
   */
  getAuthUrl(tenantId) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Força o refresh token
      state: tenantId // Passa o tenantId no state
    });
    
    return authUrl;
  }

  /**
   * Troca o código de autorização por tokens
   * e salva no Supabase
   */
  async getTokensFromCode(code, tenantId) {
    try {
      // Troca o código por tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      // Configura os tokens no cliente
      oauth2Client.setCredentials(tokens);
      
      // Obtém o e-mail do usuário
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      const googleEmail = data.email;
      
      // Calcula a data de expiração
      const expiresAt = new Date(tokens.expiry_date).toISOString();
      
      // Salva os tokens no Supabase
      const { data: savedData, error } = await supabase
        .from('google_calendar_tokens')
        .upsert({
          tenant_id: tenantId,
          google_email: googleEmail,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'tenant_id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao salvar tokens no Supabase:', error);
        throw new Error(`Failed to save tokens: ${error.message}`);
      }
      
      console.log('✅ Tokens salvos no Supabase com sucesso!', {
        tenant_id: tenantId,
        google_email: googleEmail
      });
      
      return { tokens, googleEmail };
    } catch (error) {
      console.error('❌ Erro ao trocar código por tokens:', error);
      throw error;
    }
  }

  /**
   * Obtém os tokens do Supabase para um tenant
   */
  async getTokensForTenant(tenantId) {
    try {
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();
      
      if (error || !data) {
        console.error('❌ Tokens não encontrados para tenant:', tenantId);
        return null;
      }
      
      // Verifica se o token expirou
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now >= expiresAt) {
        console.log('🔄 Token expirado, renovando...');
        return await this.refreshTokenForTenant(tenantId, data.refresh_token);
      }
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: new Date(data.expires_at).getTime()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar tokens:', error);
      return null;
    }
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refreshTokenForTenant(tenantId, refreshToken) {
    try {
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Atualiza os tokens no Supabase
      const expiresAt = new Date(credentials.expiry_date).toISOString();
      
      const { error } = await supabase
        .from('google_calendar_tokens')
        .update({
          access_token: credentials.access_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId);
      
      if (error) {
        console.error('❌ Erro ao atualizar tokens:', error);
        throw error;
      }
      
      console.log('✅ Token renovado com sucesso!');
      
      return credentials;
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      throw error;
    }
  }

  /**
   * Cria um evento no Google Calendar
   */
  async createEvent(tenantId, eventData) {
    try {
      // Obtém os tokens do tenant
      const tokens = await this.getTokensForTenant(tenantId);
      
      if (!tokens) {
        throw new Error('Tokens não encontrados. Faça a autorização primeiro.');
      }
      
      // Configura os tokens no cliente
      oauth2Client.setCredentials(tokens);
      
      // Cria o cliente do Calendar
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Cria o evento
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone || 'America/Sao_Paulo'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone || 'America/Sao_Paulo'
        },
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };
      
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all'
      });
      
      console.log('✅ Evento criado no Google Calendar:', response.data.htmlLink);
      
      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      throw error;
    }
  }

  /**
   * Lista eventos do Google Calendar
   */
  async listEvents(tenantId, maxResults = 10) {
    try {
      const tokens = await this.getTokensForTenant(tenantId);
      
      if (!tokens) {
        throw new Error('Tokens não encontrados. Faça a autorização primeiro.');
      }
      
      oauth2Client.setCredentials(tokens);
      
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      return response.data.items || [];
    } catch (error) {
      console.error('❌ Erro ao listar eventos:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();
