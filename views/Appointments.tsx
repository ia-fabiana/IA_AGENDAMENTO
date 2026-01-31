
import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, RefreshCcw, ExternalLink, AlertCircle } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentsProps {
  appointments: Appointment[];
  errorMessage?: string | null;
  onDismissError?: () => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ appointments, errorMessage, onDismissError }) => {
  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-600">Erro</h4>
              <p className="text-xs text-slate-500">Failed to fetch</p>
              <p className="text-xs text-slate-500">Não foi possível carregar a lista de tarefas. Verifique a conexão e tente novamente.</p>
            </div>
          </div>
          <button
            onClick={onDismissError}
            className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700"
          >
            Fechar
          </button>
        </div>
      )}
      {/* Header & Sync Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Google Calendar</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-brand-green" /> 
              Sincronização ativa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
            <RefreshCcw className="w-4 h-4" /> Forçar Sincronia
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-xl hover:bg-brand-blue/90 transition-all shadow-md shadow-brand-blue/20">
            Abrir Agenda Google <ExternalLink className="w-4 h-4" />
          </button>
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
