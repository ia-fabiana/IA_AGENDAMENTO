import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { encryptOAuthToken, decryptOAuthToken } from './encryption';
import { logger } from './logger';

const calendar = google.calendar('v3');

/**
 * Google Calendar Service for managing appointments
 */

// OAuth2 configuration
const getOAuth2Client = (): OAuth2Client => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth2callback';

  if (!clientId || !clientSecret) {
    logger.warn('Google OAuth credentials not configured');
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Generate OAuth URL for user authorization
 */
export const getAuthUrl = (): string => {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force consent to get refresh token
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code: string): Promise<string> => {
  const oauth2Client = getOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    logger.info({ event: 'google_oauth_token_obtained' }, 'Google OAuth tokens obtained');
    
    // Encrypt tokens before storing
    const encryptedTokens = encryptOAuthToken({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
      scope: tokens.scope,
      token_type: tokens.token_type ?? undefined
    });
    
    return encryptedTokens;
  } catch (error) {
    logger.error({ error, event: 'google_oauth_token_error' }, 'Failed to get Google OAuth tokens');
    throw new Error('Failed to exchange authorization code for tokens');
  }
};

/**
 * Set OAuth credentials from encrypted token
 */
const setCredentials = (oauth2Client: OAuth2Client, encryptedToken: string): void => {
  try {
    const tokens = decryptOAuthToken(encryptedToken);
    oauth2Client.setCredentials(tokens);
  } catch (error) {
    logger.error({ error, event: 'google_oauth_decrypt_error' }, 'Failed to decrypt Google OAuth tokens');
    throw new Error('Failed to decrypt OAuth tokens');
  }
};

/**
 * Create a Google Calendar event
 */
export const createCalendarEvent = async (
  encryptedToken: string,
  eventDetails: {
    summary: string;
    description?: string;
    location?: string;
    start: string; // ISO 8601 format
    end: string; // ISO 8601 format
    attendees?: string[]; // Email addresses
    reminders?: {
      useDefault: boolean;
      overrides?: Array<{
        method: 'email' | 'popup';
        minutes: number;
      }>;
    };
  },
  calendarId: string = 'primary'
): Promise<{ id: string; htmlLink: string }> => {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, encryptedToken);

  try {
    const event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      location: eventDetails.location,
      start: {
        dateTime: eventDetails.start,
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: eventDetails.end,
        timeZone: 'America/Sao_Paulo'
      },
      attendees: eventDetails.attendees?.map(email => ({ email })),
      reminders: eventDetails.reminders || {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 } // 1 hour before
        ]
      }
    };

    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId,
      requestBody: event,
      sendUpdates: 'all' // Send email notifications to attendees
    });

    logger.info({
      event: 'google_calendar_event_created',
      eventId: response.data.id,
      summary: eventDetails.summary
    }, 'Google Calendar event created successfully');

    return {
      id: response.data.id!,
      htmlLink: response.data.htmlLink!
    };
  } catch (error: any) {
    logger.error({
      error: {
        message: error.message,
        code: error.code
      },
      event: 'google_calendar_event_create_error'
    }, 'Failed to create Google Calendar event');
    throw new Error(`Failed to create Google Calendar event: ${error.message}`);
  }
};

/**
 * Check availability in Google Calendar
 */
export const checkAvailability = async (
  encryptedToken: string,
  timeMin: string, // ISO 8601
  timeMax: string, // ISO 8601
  calendarId: string = 'primary'
): Promise<boolean> => {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, encryptedToken);

  try {
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    });

    // If no events, time slot is available
    const isAvailable = !response.data.items || response.data.items.length === 0;
    
    logger.info({
      event: 'google_calendar_availability_checked',
      timeMin,
      timeMax,
      isAvailable,
      eventsCount: response.data.items?.length || 0
    }, 'Google Calendar availability checked');

    return isAvailable;
  } catch (error: any) {
    logger.error({
      error: {
        message: error.message,
        code: error.code
      },
      event: 'google_calendar_availability_error'
    }, 'Failed to check Google Calendar availability');
    throw new Error(`Failed to check calendar availability: ${error.message}`);
  }
};

/**
 * Delete a Google Calendar event
 */
export const deleteCalendarEvent = async (
  encryptedToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> => {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, encryptedToken);

  try {
    await calendar.events.delete({
      auth: oauth2Client,
      calendarId,
      eventId,
      sendUpdates: 'all' // Notify attendees
    });

    logger.info({
      event: 'google_calendar_event_deleted',
      eventId
    }, 'Google Calendar event deleted successfully');
  } catch (error: any) {
    logger.error({
      error: {
        message: error.message,
        code: error.code
      },
      event: 'google_calendar_event_delete_error',
      eventId
    }, 'Failed to delete Google Calendar event');
    throw new Error(`Failed to delete Google Calendar event: ${error.message}`);
  }
};
