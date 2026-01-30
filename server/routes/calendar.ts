import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { getAuthUrl, getTokensFromCode, checkAvailability } from '../googleCalendar';
import { logger } from '../logger';
import { supabase } from '../../services/supabase';

const router = express.Router();

// Rate limiter for OAuth endpoints
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many OAuth requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Get Google OAuth authorization URL
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ authUrl });
  } catch (error: any) {
    logger.error({ error }, 'Failed to generate auth URL');
    res.status(500).json({ error: error.message });
  }
});

// Handle OAuth callback and save tokens
router.post('/oauth-callback', oauthLimiter, async (req, res) => {
  try {
    const { code, tenantId } = req.body;

    // Validate required fields
    if (!code || !tenantId) {
      return res.status(400).json({ error: 'Missing code or tenantId' });
    }

    // Validate code format (Google auth codes are typically 70-100 characters)
    if (typeof code !== 'string' || code.length < 20 || code.length > 200) {
      return res.status(400).json({ error: 'Invalid authorization code format' });
    }

    // Validate tenantId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenantId format' });
    }

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Exchange code for encrypted tokens
    const encryptedTokens = await getTokensFromCode(code);

    // Save to database
    const { error } = await supabase
      .from('tenants')
      .update({
        google_oauth_token: encryptedTokens,
        google_calendar_sync_enabled: true,
        google_calendar_last_sync: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (error) throw error;

    logger.info({ tenantId }, 'Google Calendar connected successfully');

    res.json({ success: true, message: 'Google Calendar connected successfully' });
  } catch (error: any) {
    logger.error({ error }, 'Failed to handle OAuth callback');
    res.status(500).json({ error: error.message });
  }
});

// Check availability
router.post('/check-availability', async (req, res) => {
  try {
    const { tenantId, startTime, endTime } = req.body;

    // Get tenant's token
    const { data: tenant } = await supabase
      .from('tenants')
      .select('google_oauth_token, google_calendar_sync_enabled')
      .eq('id', tenantId)
      .single();

    if (!tenant?.google_calendar_sync_enabled || !tenant.google_oauth_token) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const isAvailable = await checkAvailability(
      tenant.google_oauth_token,
      startTime,
      endTime
    );

    res.json({ isAvailable });
  } catch (error: any) {
    logger.error({ error }, 'Failed to check availability');
    res.status(500).json({ error: error.message });
  }
});

// Disconnect Google Calendar
router.post('/disconnect', async (req, res) => {
  try {
    const { tenantId } = req.body;

    const { error } = await supabase
      .from('tenants')
      .update({
        google_oauth_token: null,
        google_calendar_sync_enabled: false
      })
      .eq('id', tenantId);

    if (error) throw error;

    logger.info({ tenantId }, 'Google Calendar disconnected');

    res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error: any) {
    logger.error({ error }, 'Failed to disconnect Google Calendar');
    res.status(500).json({ error: error.message });
  }
});

export default router;
