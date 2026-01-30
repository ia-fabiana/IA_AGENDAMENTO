import express from 'express';
import { supabase } from '../../services/supabase';
import { createCalendarEvent, deleteCalendarEvent } from '../googleCalendar';
import { logger } from '../logger';
import { canAccess, logActivity } from '../rbac';

const router = express.Router();

// Create appointment with Google Calendar sync
router.post('/', async (req, res) => {
  try {
    const { appointment, userId, tenantId } = req.body;

    // Check permissions
    if (userId) {
      const hasPermission = await canAccess(userId, 'appointments', 'create');
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    let googleCalendarEventId: string | null = null;
    let googleCalendarSynced = false;
    let googleCalendarSyncError: string | null = null;

    // Get tenant's Google Calendar token
    const { data: tenant } = await supabase
      .from('tenants')
      .select('google_oauth_token, google_calendar_sync_enabled')
      .eq('id', tenantId)
      .single();

    // Try to create Google Calendar event if enabled
    if (tenant?.google_calendar_sync_enabled && tenant.google_oauth_token) {
      try {
        // Get service duration
        const { data: service } = await supabase
          .from('servicos')
          .select('duration')
          .eq('id', appointment.serviceId)
          .single();

        const duration = service?.duration || 60;
        const startDate = new Date(appointment.date);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const calendarEvent = await createCalendarEvent(
          tenant.google_oauth_token,
          {
            summary: `${appointment.serviceName} - ${appointment.customerName}`,
            description: `Agendamento confirmado\nCliente: ${appointment.customerName}\nTelefone: ${appointment.phoneNumber}\nValor: R$ ${appointment.value}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          }
        );

        googleCalendarEventId = calendarEvent.id;
        googleCalendarSynced = true;
        logger.info({ appointmentId: appointment.id, calendarEventId: googleCalendarEventId }, 'Google Calendar event created');
      } catch (calendarError: any) {
        googleCalendarSyncError = calendarError.message;
        logger.warn({ error: calendarError, appointmentId: appointment.id }, 'Failed to create Google Calendar event');
      }
    }

    // Save appointment to database
    const { data, error } = await supabase.from('agendamentos').insert({
      id: appointment.id,
      tenant_id: tenantId,
      cliente_nome: appointment.customerName,
      cliente_fone: appointment.phoneNumber,
      servico_id: appointment.serviceId,
      servico_nome: appointment.serviceName,
      data_hora: appointment.date,
      status: appointment.status,
      valor: appointment.value,
      google_calendar_event_id: googleCalendarEventId,
      google_calendar_synced: googleCalendarSynced,
      google_calendar_sync_error: googleCalendarSyncError
    }).select().single();

    if (error) throw error;

    // Log activity
    await logActivity(
      tenantId,
      userId,
      'appointment.created',
      'appointment',
      appointment.id,
      { customerName: appointment.customerName, serviceName: appointment.serviceName }
    );

    res.json({ 
      appointment: data,
      googleCalendarSynced
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to create appointment');
    res.status(500).json({ error: error.message });
  }
});

// Get appointments for tenant
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId } = req.query;

    // Check permissions
    if (userId) {
      const hasPermission = await canAccess(userId as string, 'appointments', 'read');
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('data_hora', { ascending: true });

    if (error) throw error;

    res.json({ appointments: data });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get appointments');
    res.status(500).json({ error: error.message });
  }
});

// Delete appointment (also removes from Google Calendar)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, tenantId } = req.query;

    // Check permissions
    if (userId) {
      const hasPermission = await canAccess(userId as string, 'appointments', 'delete');
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    // Get appointment
    const { data: appointment } = await supabase
      .from('agendamentos')
      .select('*, tenants!inner(google_oauth_token)')
      .eq('id', id)
      .single();

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Delete from Google Calendar if synced
    if (appointment.google_calendar_event_id && appointment.tenants?.google_oauth_token) {
      try {
        await deleteCalendarEvent(
          appointment.tenants.google_oauth_token,
          appointment.google_calendar_event_id
        );
        logger.info({ appointmentId: id }, 'Deleted from Google Calendar');
      } catch (error) {
        logger.warn({ error, appointmentId: id }, 'Failed to delete from Google Calendar');
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await logActivity(
      tenantId as string,
      userId as string,
      'appointment.deleted',
      'appointment',
      id
    );

    res.json({ success: true });
  } catch (error: any) {
    logger.error({ error }, 'Failed to delete appointment');
    res.status(500).json({ error: error.message });
  }
});

export default router;
