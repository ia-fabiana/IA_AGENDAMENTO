
import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentsProps {
  appointments: Appointment[];
}

const Appointments: React.FC<AppointmentsProps> = ({ appointments }) => {
  return (
    <div className="space-y-8">
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
