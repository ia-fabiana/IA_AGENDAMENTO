
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Cpu, 
  Activity, 
  MoreHorizontal, 
  Server, 
  Github,
  RefreshCcw,
  Lock,
  ExternalLink,
  ShieldAlert,
  Globe,
  Settings,
  HardDrive,
  Search,
  Terminal,
  Zap,
  Layers,
  BarChart3,
  TrendingUp,
  Database
} from 'lucide-react';
import { GlobalAdminMetrics, TenantInfo } from '../types';
import { EVOLUTION_API_URL, EVOLUTION_API_KEY } from '../services/evolutionService';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'infra' | 'performance'>('tenants');
  const [apiHealth, setApiHealth] = useState<'checking' | 'protocol_error' | 'online' | 'offline'>('checking');
  const [loadPercentage, setLoadPercentage] = useState(74);
  
  const [globalMetrics] = useState<GlobalAdminMetrics>({
    totalTenants: 128,
    totalRevenue: 32450.00,
    totalTokensConsumed: 12450000,
    serverStatus: 'healthy',
    githubSync: {
      repo: 'owner/ia-agendamentos-saas',
      branch: 'main',
      lastCommit: '7f3a1b2',
      status: 'synced'
    }
  });

  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      setLoadPercentage(prev => {
        const next = prev + (Math.random() * 4 - 2);
        return Math.min(Math.max(next, 65), 85);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setApiHealth('checking');
    try {
      const response = await fetch(EVOLUTION_API_URL + '/instance/instanceName', { 
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY } 
      });
      setApiHealth(response.ok || response.status === 401 || response.status === 404 ? 'online' : 'offline');
    } catch (e: any) {
      setApiHealth('offline');
    }
  };

  const tenants: TenantInfo[] = [
    { id: '1', name: 'Estúdio Shine', owner: 'Maria Silva', plan: 'Prata', status: 'active', consumption: 850, lastActive: '2 min atrás' },
    { id: '2', name: 'Barbearia do Jota', owner: 'João Pedro', plan: 'Ouro', status: 'active', consumption: 2100, lastActive: '15 min atrás' },
    { id: '3', name: 'Clínica Sorriso', owner: 'Dra. Ana', plan: 'Bronze', status: 'active', consumption: 430, lastActive: '1 hora atrás' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Top Bar Admin - Visual AMBER/DARK */}
      <div className="flex items-center justify-between bg-black p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Database className="w-64 h-64 text-amber-500" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black rounded-lg">LIVE INFRA</div>
             <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em]">Master Control Tower</p>
          </div>
          <h2 className="text-5xl font-black tracking-tighter">Global Cluster <span className="text-amber-500">.</span></h2>
          <div className="flex items-center gap-6 mt-8">
             <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Region: us-central-1</span>
             </div>
             <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${apiHealth === 'online' ? 'bg-brand-green shadow-[0_0_15px_#4ABF4A]' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Evolution API: {apiHealth.toUpperCase()}</span>
             </div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-4">
           <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 text-right backdrop-blur-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Cloud Build Status</p>
              <div className="flex items-center gap-3 justify-end">
                 <Github className="w-5 h-5 text-amber-500" />
                 <span className="text-xs font-mono text-white font-black">v.{globalMetrics.githubSync.lastCommit}</span>
              </div>
           </div>
           <button onClick={checkHealth} className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-500 hover:text-white transition-colors">
              <RefreshCcw className="w-3.5 h-3.5" /> Re-scan Infra
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-10">
           {/* Performance Card - Visual Exclusivo Master */}
           <div className="bg-black p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[450px] border border-amber-500/10">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                 <Layers className="w-96 h-96 -rotate-12 text-amber-500" />
              </div>
              
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 rounded-3xl flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                       <Zap className="w-7 h-7" />
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Vitals SaaS</h3>
                 </div>
                 <p className="text-sm text-slate-400 leading-relaxed max-w-lg font-medium">
                   Monitoramento de baixa latência dos clusters de produção. Otimização de entrega de mensagens via brokers distribuídos.
                 </p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Tenants</p>
                       <p className="text-xl font-black text-amber-500">{globalMetrics.totalTenants}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Uptime</p>
                       <p className="text-xl font-black text-brand-green">99.99%</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Latency</p>
                       <p className="text-xl font-black text-brand-blue">38ms</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Build</p>
                       <p className="text-xl font-black text-emerald-500">Stable</p>
                    </div>
                 </div>
              </div>

              <div className="pt-12 border-t border-white/5 relative z-10">
                 <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Carga de Processamento Master</span>
                    <span className="text-4xl font-black text-amber-500 tracking-tighter tabular-nums">{Math.round(loadPercentage)}%</span>
                 </div>
                 <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-700 rounded-full shadow-[0_0_20px_#f59e0b] transition-all duration-1000 ease-in-out"
                      style={{ width: `${loadPercentage}%` }}
                    ></div>
                 </div>
              </div>
           </div>

           {/* Table Section */}
           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                 <div>
                    <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Gerenciamento de Tenants</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Monitoramento de Consumo e Licenciamento</p>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type="text" placeholder="Buscar tenant por ID ou Nome..." className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-xs outline-none focus:ring-2 focus:ring-amber-500 w-72 transition-all shadow-sm" />
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50/50">
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Negócio / Admin</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Assinatura</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Consumo Mensal</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Controle</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {tenants.map(t => (
                     <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                       <td className="px-10 py-8">
                         <p className="text-base font-black text-brand-dark leading-none">{t.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{t.owner} • Plano {t.plan}</p>
                       </td>
                       <td className="px-10 py-8 text-center">
                         <span className="px-4 py-1.5 bg-brand-green/10 text-brand-green rounded-xl text-[9px] font-black uppercase tracking-widest border border-brand-green/20">Active</span>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <p className="text-sm font-black text-slate-600 tabular-nums">{t.consumption.toLocaleString()} Msgs</p>
                          <p className="text-[9px] text-slate-300 font-bold uppercase mt-1">Última: {t.lastActive}</p>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <button className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center">
                             <MoreHorizontal className="w-6 h-6" />
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Master Insights */}
        <div className="space-y-10">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-amber-500/10 text-amber-600 rounded-3xl flex items-center justify-center shadow-inner">
                    <TrendingUp className="w-7 h-7" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Faturamento SaaS (MRR)</p>
                    <h4 className="text-3xl font-black text-brand-dark tracking-tighter">R$ {globalMetrics.totalRevenue.toLocaleString()}</h4>
                 </div>
              </div>
              
              <div className="space-y-6 pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Crescimento</span>
                    <span className="text-brand-green font-black flex items-center gap-1">+12.4%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Taxa de Churn</span>
                    <span className="text-slate-400 font-black">0.8%</span>
                 </div>
              </div>
           </div>

           <div className="bg-black p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-amber-500/10">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                 <Terminal className="w-48 h-48 text-amber-500" />
              </div>
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 text-black rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-500/40">
                       <Server className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tighter">Cluster Health</h4>
                       <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Sincronia Distribuída</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-500 font-bold">API Gateways</span>
                       <span className="text-brand-green">Healthy</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-500 font-bold">Postgres Cluster</span>
                       <span className="text-brand-green">Healthy</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-500 font-bold">Auth Sharding</span>
                       <span className="text-brand-green">Healthy</span>
                    </div>
                 </div>

                 <button className="w-full py-5 bg-amber-500 text-black rounded-3xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-500/10">
                    SaaS Management CLI
                 </button>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-amber-100">
                 <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                 <h4 className="font-black text-brand-dark uppercase tracking-tighter">Security Snapshot</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                   Backups automáticos replicados em 3 regiões geográficas a cada 15 minutos.
                 </p>
              </div>
              <button className="text-amber-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:underline">
                 Configurações de Refrigeração <ExternalLink className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
