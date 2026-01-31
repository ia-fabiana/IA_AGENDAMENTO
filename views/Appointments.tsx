
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, RefreshCcw, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Appointment } from '../types';
import { dbService } from '../services/dbService';

interface AppointmentsProps {
  appointments: Appointment[];
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const Appointments: React.FC<AppointmentsProps> = ({ appointments }) => {
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check Google Calendar connection status on mount
  useEffect(() => {
    checkCalendarConnection();
  }, []);

  const checkCalendarConnection = async () => {
    try {
      const config = await dbService.getBusinessConfig(TENANT_ID);
      if (config) {
        setIsCalendarConnected(config.googleCalendarSyncEnabled || false);
        // Try to get last sync time from database
        const token = await dbService.getGoogleCalendarToken(TENANT_ID);
        if (token) {
          setConnectedEmail('agenda.negocio@gmail.com'); // This could be fetched from the backend
        }
      }
    } catch (error) {
      console.error('Failed to check calendar connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      // Get the OAuth authorization URL
      const response = await fetch(`${SERVER_URL}/api/calendar/auth-url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const { authUrl } = await response.json();

      // Open OAuth flow in a popup window
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for the OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          const { code } = event.data;
          
          // Exchange code for tokens
          const callbackResponse = await fetch(`${SERVER_URL}/api/calendar/oauth-callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              tenantId: TENANT_ID,
            }),
          });

          if (callbackResponse.ok) {
            setIsCalendarConnected(true);
            await checkCalendarConnection();
            alert('Google Calendar conectado com sucesso!');
          } else {
            throw new Error('Failed to connect Google Calendar');
          }
          
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      alert('Erro ao conectar Google Calendar. Por favor, tente novamente.');
    }
  };

  const handleForceSync = async () => {
    if (!isCalendarConnected) {
      alert('Google Calendar não está conectado. Por favor, conecte primeiro.');
      return;
    }

    setIsSyncing(true);
    try {
      // Force sync all appointments
      // This would trigger a backend endpoint to sync all appointments
      const response = await fetch(`${SERVER_URL}/api/calendar/force-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: TENANT_ID,
        }),
      });

      if (response.ok) {
        setLastSync(new Date().toISOString());
        alert('Sincronização concluída com sucesso!');
      } else {
        throw new Error('Failed to sync');
      }
    } catch (error) {
      console.error('Failed to force sync:', error);
      alert('Erro ao sincronizar. Por favor, tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenGoogleCalendar = () => {
    // Open Google Calendar in a new tab
    window.open('https://calendar.google.com', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Sync Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${isCalendarConnected ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-400'} rounded-xl flex items-center justify-center`}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Google Calendar</h3>
            {isCalendarConnected ? (
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-brand-green" /> 
                Sincronização ativa
              </p>
            ) : (
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" /> 
                Não conectado
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isCalendarConnected ? (
            <button 
              onClick={handleConnectGoogleCalendar}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-purple rounded-xl hover:bg-brand-purple/90 transition-all shadow-md shadow-brand-purple/20"
            >
              <CalendarIcon className="w-4 h-4" /> Conectar Google Calendar
            </button>
          ) : (
            <>
              <button 
                onClick={handleForceSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
                {isSyncing ? 'Sincronizando...' : 'Forçar Sincronia'}
              </button>
              <button 
                onClick={handleOpenGoogleCalendar}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-xl hover:bg-brand-blue/90 transition-all shadow-md shadow-brand-blue/20"
              >
                Abrir Agenda Google <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-brand-dark flex items-center gap-2">
            Agendamentos Confirmados
            <span className="bg-brand-purple text-white text-[10px] px-2 py-0.5 rounded-full">
              {appointments.length}
            </span>
          </h4>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Serviço</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-dark">{apt.customerName}</p>
                      <p className="text-xs text-slate-400">{apt.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{apt.serviceName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-purple" />
                        {new Date(apt.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 rounded-lg bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase border border-brand-green/20">
                        Confirmado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendar Insights */}
        <div className="space-y-6">
          <div className="bg-brand-dark p-6 rounded-2xl text-white shadow-xl shadow-brand-dark/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl"></div>
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-brand-purple" /> Configuração Google
            </h4>
            <div className="space-y-4 text-sm relative z-10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Agenda Conectada</p>
                <p className="font-medium">agenda.negocio@gmail.com</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "A IA verifica automaticamente esta agenda antes de sugerir horários para os clientes no WhatsApp."
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-brand-dark mb-4">Próximos Horários Livres</h4>
            <div className="space-y-2">
              {['15:00', '16:30', '17:45'].map(time => (
                <div key={time} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl text-sm">
                  <span className="text-slate-600 font-medium">Hoje, {time}</span>
                  <span className="text-brand-purple font-bold text-xs uppercase tracking-tight">Disponível</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
