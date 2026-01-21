
import React from 'react';
import { TrendingUp, Calendar, Users, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Agendamentos Hoje', value: '12', icon: Calendar, color: 'bg-brand-purple' },
    { label: 'Novos Clientes', value: '48', icon: Users, color: 'bg-brand-blue' },
    { label: 'Taxa de Conversão', value: '92%', icon: TrendingUp, color: 'bg-brand-green' },
    { label: 'Confirmados pela IA', value: '154', icon: CheckCircle, color: 'bg-brand-dark' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-current/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-brand-dark mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Próximos Agendamentos</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                    J{item}
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-dark">João Silva {item}</h4>
                    <p className="text-xs text-slate-500">Corte de Cabelo • 14:30</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-1 rounded-lg uppercase">
                  Confirmado
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Atividade Recente da IA</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4 relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-brand-purple/20">
                <div className="flex-1">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-brand-dark">IA</span> respondeu ao cliente <span className="font-bold text-brand-dark">+55 (11) 98877-6655</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 italic">"Horário das 16:00 confirmado para Barba e Bigode..."</p>
                  <p className="text-[10px] text-brand-purple mt-1 font-bold uppercase tracking-wider">HÁ 5 MINUTOS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
