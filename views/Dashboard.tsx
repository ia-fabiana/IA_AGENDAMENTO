
import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  Activity, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Database,
  Smartphone
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

  const usagePercent = (credits.usageThisMonth / (credits.totalLimit || 1000)) * 100;

  const stats = [
    { label: 'Saldo Disponível', value: `${credits.balance}`, trend: 'Mensagens', icon: Database, color: 'text-brand-purple', bg: 'bg-brand-purple/5' },
    { label: 'Conversão de Chat', value: `${metrics.conversionRate}%`, trend: '+5.2%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Ocupação Agenda', value: `${metrics.occupancyRate}%`, trend: '-2%', icon: PieChart, color: 'text-brand-blue', bg: 'bg-brand-blue/5' },
    { label: 'Instâncias WA', value: '1 Ativa', trend: 'Online', icon: Smartphone, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* SaaS Usage Alert */}
      {credits.balance < 20 && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-center justify-between shadow-sm animate-pulse">
           <div className="flex items-center gap-4 text-red-600">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold block uppercase tracking-widest text-[10px]">Alerta de Saldo Baixo</span>
                <span className="text-xs font-medium">Restam apenas {credits.balance} mensagens. Recarregue para evitar interrupções.</span>
              </div>
           </div>
           <button className="bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Recarregar Agora</button>
        </div>
      )}

      {/* Main Business Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stat.trend.includes('+') || stat.trend === 'Online' || stat.trend === 'Mensagens' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</h3>
            <p className="text-2xl font-black text-brand-dark mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Activity Feed */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-purple" /> Auditor de Tokens (Consumo)
            </h3>
            <button className="text-[10px] font-bold text-brand-purple uppercase hover:underline">Ver Logs Supabase</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start gap-4 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold shrink-0 group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-all">
                  {['MS', 'RJ', 'PL', 'CF'][item-1]}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-brand-dark">
                      {['Maria Silva', 'Ricardo Jorge', 'Paula Lima', 'Carlos Filho'][item-1]}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">-{item * 12} tokens</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic">
                    {['Resumo: Agendou horário via OpenAI.', 'Resumo: Consulta de preços via Gemini Flash.', 'Resumo: Cancelamento e reagendamento.', 'Resumo: Tirou dúvidas sobre localização.'][item-1]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-brand-green shadow-[0_0_8px_#4ABF4A]"></div>
                   <span className="text-[9px] font-black text-slate-400 uppercase">Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Tokens / Quota */}
        <div className="space-y-6">
          <div className="bg-brand-dark p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <PieChart className="w-32 h-32" />
             </div>
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
               <Zap className="w-5 h-5 text-brand-purple" /> Cota de Mensagens SaaS
             </h3>
             <div className="space-y-8 relative z-10">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">
                     <span>Consumo Atual</span>
                     <span className="text-white">{credits.balance} / {credits.totalLimit}</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-brand-purple transition-all duration-1000 shadow-[0_0_15px_#B407FF]" 
                      style={{ width: `${Math.min(100, (credits.balance / (credits.totalLimit || 1)) * 100)}%` }}
                     ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Custo Plataforma</p>
                    <p className="text-sm font-bold">1 Créd <span className="text-[8px] opacity-50">/msg</span></p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status API</p>
                    <p className="text-sm font-bold text-brand-green">99.9%</p>
                  </div>
                </div>

                <div className="p-4 bg-brand-purple/20 rounded-2xl border border-brand-purple/30 text-center">
                  <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">Plano de Dados {credits.planName}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
