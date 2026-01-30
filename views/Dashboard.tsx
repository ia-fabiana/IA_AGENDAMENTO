
import React from 'react';
import { 
  TrendingUp, 
  Zap, 
  Activity, 
  PieChart, 
  CalendarDays,
  CheckCircle2,
  Users,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { UserCredits, DashboardMetrics } from '../types';

interface DashboardProps {
  credits: UserCredits;
}

const Dashboard: React.FC<DashboardProps> = ({ credits }) => {
  const metrics: DashboardMetrics = {
    totalRevenue: 4850.00,
    conversionRate: 84.5,
    occupancyRate: 72,
    activeAppointments: 24
  };

  const stats = [
    { label: 'Saldo de Mensagens', value: `${credits.balance}`, trend: 'Mensal', icon: Zap, color: 'text-brand-purple', bg: 'bg-brand-purple/5' },
    { label: 'Conversão de Leads', value: `${metrics.conversionRate}%`, trend: '+5.2%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Ocupação da Agenda', value: `${metrics.occupancyRate}%`, trend: 'Semanal', icon: PieChart, color: 'text-brand-blue', bg: 'bg-brand-blue/5' },
    { label: 'Agendamentos Ativos', value: `${metrics.activeAppointments}`, trend: 'Hoje', icon: Users, color: 'text-brand-dark', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Banner Executivo para o Lojista (Focado em Negócios) */}
      <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <TrendingUp className="w-64 h-64 text-brand-purple" />
         </div>
         <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-brand-dark text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-dark/20">
              <Activity className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-black text-3xl text-brand-dark uppercase tracking-tighter leading-none">Resumo do Dia</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Gestão Automatizada de Agendamentos</p>
            </div>
         </div>
         <div className="flex items-center gap-10 relative z-10 mt-6 md:mt-0">
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento Previsto</p>
               <p className="text-3xl font-black text-brand-dark tracking-tighter">R$ {metrics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-px h-12 bg-slate-100"></div>
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-xl">
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">Sofia Atendendo</span>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Sem pendências críticas</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-brand-dark mt-2 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-3">
              <CalendarDays className="w-7 h-7 text-brand-purple" /> Últimas Conversões
            </h3>
            <button className="text-[10px] font-black text-brand-purple uppercase tracking-widest flex items-center gap-2 hover:underline">
               Ver Agenda Completa <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:border-brand-purple/20 transition-all group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center font-black text-brand-purple shadow-sm group-hover:bg-brand-purple group-hover:text-white transition-all">
                    {['JS', 'AM', 'RL'][i-1]}
                  </div>
                  <div>
                    <p className="text-lg font-black text-brand-dark leading-none">{['Julia Souza', 'André Martins', 'Renata Lima'][i-1]}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Agendado via IA • {i * 12} min atrás</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-brand-dark tracking-tighter">R$ {i * 120},00</p>
                  <p className="text-[9px] text-brand-green font-black uppercase flex items-center justify-end gap-1 mt-1">
                     <CheckCircle2 className="w-3 h-3" /> Confirmado
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-brand-dark p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                 <DollarSign className="w-48 h-48 text-brand-purple" />
              </div>
              <div className="relative z-10 space-y-6">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Lucro Direto IA</p>
                 <h4 className="text-5xl font-black tracking-tighter">R$ 1.840</h4>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    Valor total gerado em agendamentos realizados exclusivamente pela sua assistente Sofia este mês.
                 </p>
                 <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-purple">
                       <span>Economia de Tempo</span>
                       <span>~18 horas</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dica de Conversão</p>
              <p className="text-sm font-bold text-brand-dark leading-relaxed italic">
                 "Oferecer um pequeno desconto para novos clientes via IA aumenta sua taxa de ocupação em até 15%."
              </p>
              <button className="mt-6 text-xs font-black text-brand-purple uppercase tracking-widest hover:underline">
                 Configurar Promoção
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
