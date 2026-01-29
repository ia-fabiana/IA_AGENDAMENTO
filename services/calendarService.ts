import { google } from 'googleapis';

// Configuração OAuth2
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://ia-agendamentos-870139342019.us-central1.run.app/auth/google/callback';

// Interface para tokens
interface CalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

// Interface para eventos
interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
}

class CalendarService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
  }

  /**
   * Gera URL de autorização para o usuário conectar sua conta Google
   * @param tenantId - ID do tenant para incluir no state parameter
   */
  getAuthUrl(tenantId?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Força mostrar tela de consentimento para obter refresh_token
      state: tenantId || undefined // Passa o tenantId via state parameter
    });
  }

  /**
   * Troca o código de autorização por tokens de acesso
   */
  async getTokensFromCode(code: string): Promise<CalendarTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Define os tokens para o cliente OAuth2
   */
  setCredentials(tokens: CalendarTokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Atualiza o access_token usando o refresh_token
   */
  async refreshAccessToken(refreshToken: string): Promise<CalendarTokens> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  /**
   * Lista eventos do calendário
   */
  async listEvents(tokens: CalendarTokens, maxResults: number = 50): Promise<any[]> {
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
  async createEvent(tokens: CalendarTokens, event: CalendarEvent): Promise<any> {
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
  async updateEvent(tokens: CalendarTokens, eventId: string, event: CalendarEvent): Promise<any> {
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
  async deleteEvent(tokens: CalendarTokens, eventId: string): Promise<void> {
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
  async getEventsByDateRange(
    tokens: CalendarTokens,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
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
  async verifyTokens(tokens: CalendarTokens): Promise<boolean> {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      await calendar.calendarList.list({ maxResults: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const calendarService = new CalendarService();
export type { CalendarTokens, CalendarEvent };
