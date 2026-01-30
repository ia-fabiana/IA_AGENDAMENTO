
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Cpu, 
  Activity, 
  Search, 
  MoreHorizontal, 
  ArrowUpRight, 
  AlertCircle, 
  Server, 
  ShieldCheck,
  TrendingUp,
  Mail,
  Filter
} from 'lucide-react';
import { GlobalAdminMetrics, TenantInfo } from '../types';

const AdminDashboard: React.FC = () => {
  const [globalMetrics, setGlobalMetrics] = useState<GlobalAdminMetrics>({
    totalTenants: 0,
    totalRevenue: 0,
    totalTokensConsumed: 0,
    serverStatus: 'loading'
  });

  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados reais da API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/metrics');
        
        if (!response.ok) {
          throw new Error('Falha ao carregar métricas');
        }

        const data = await response.json();
        setGlobalMetrics(data.globalMetrics);
        setTenants(data.tenants);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados admin:', err);
        setError(err.message);
        // Manter dados vazios em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAdminData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-brand-purple" />
          <p className="text-slate-600">Carregando métricas administrativas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Mensagem de erro se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-bold text-red-900">Erro ao carregar dados</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Top Bar Admin */}
      <div className="flex items-center justify-between bg-brand-dark p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-1">Visão de Proprietário</p>
          <h2 className="text-3xl font-black">Admin Console <span className="text-brand-purple">.</span></h2>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="text-right border-r border-white/10 pr-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status do Cluster</p>
              <div className="flex items-center gap-2 justify-end mt-1">
                 <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
                 <span className="text-sm font-bold text-brand-green">SaaS Healthy</span>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Custo de API (Mês)</p>
              <p className="text-lg font-bold text-white mt-1">U$ 142.50</p>
           </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase">Total Inquilinos</p>
           <h4 className="text-2xl font-black text-brand-dark">{globalMetrics.totalTenants}</h4>
           <div className="flex items-center gap-1 text-[10px] text-brand-green font-bold mt-2">
              <ArrowUpRight className="w-3 h-3" /> +12 este mês
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5" />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase">MRR (Recorrência)</p>
           <h4 className="text-2xl font-black text-brand-dark">R$ {globalMetrics.totalRevenue.toLocaleString()}</h4>
           <div className="flex items-center gap-1 text-[10px] text-brand-green font-bold mt-2">
              <ArrowUpRight className="w-3 h-3" /> +5.4% vs mês anterior
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase">Tokens Totais (Globais)</p>
           <h4 className="text-2xl font-black text-brand-dark">{(globalMetrics.totalTokensConsumed / 1000000).toFixed(1)}M</h4>
           <p className="text-[10px] text-slate-400 mt-2 font-medium">Consumo distribuído em 128 instâncias</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase">Instâncias WA Ativas</p>
           <h4 className="text-2xl font-black text-brand-dark">114 / 128</h4>
           <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-2">
              <AlertCircle className="w-3 h-3" /> 14 clientes pendentes de QR Code
           </div>
        </div>
      </div>

      {/* Tenant Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-purple" /> Gerenciar Inquilinos (Tenants)
            </h3>
            <p className="text-xs text-slate-500">Controle financeiro e técnico de todos os clientes da base.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar cliente ou ID..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-purple outline-none w-64"
                />
             </div>
             <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-brand-purple transition-all">
                <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquilino / Owner</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Plano</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Mensagens (Mês)</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Última Ativ.</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/5 text-brand-purple flex items-center justify-center font-black text-xs">
                      {tenant.name.substring(0,2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{tenant.name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {tenant.owner}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                    tenant.plan === 'Ouro' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                    tenant.plan === 'Prata' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                    'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      tenant.status === 'active' ? 'bg-brand-green' :
                      tenant.status === 'suspended' ? 'bg-red-500' :
                      'bg-amber-500'
                    }`}></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                      {tenant.status === 'active' ? 'Ativo' : tenant.status === 'suspended' ? 'Suspenso' : 'Trial'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-brand-dark">{tenant.consumption}</p>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                         <div className="h-full bg-brand-purple" style={{ width: `${Math.min(100, (tenant.consumption/2500)*100)}%` }}></div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5 text-center text-[10px] font-medium text-slate-400">
                  {tenant.lastActive}
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-400 hover:text-brand-purple hover:bg-slate-100 rounded-lg transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] text-slate-400 font-bold uppercase">Exibindo 5 de {globalMetrics.totalTenants} inquilinos registrados</p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-purple transition-all">Anterior</button>
              <button className="px-4 py-2 bg-brand-purple text-white rounded-xl text-[10px] font-bold shadow-lg shadow-brand-purple/20">Próxima</button>
           </div>
        </div>
      </div>

      {/* Global Config Sidebar or Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-brand-purple" /> Projeção de Crescimento
            </h3>
            <div className="h-48 flex items-end gap-2 px-2">
               {[40, 60, 45, 80, 75, 95, 120].map((h, i) => (
                 <div key={i} className="flex-1 space-y-2">
                    <div className="bg-brand-purple/20 hover:bg-brand-purple transition-all rounded-t-lg" style={{ height: `${h}%` }}></div>
                    <p className="text-[8px] text-slate-500 text-center font-bold">SET {i+1}</p>
                 </div>
               ))}
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
               <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meta de faturamento</p>
                  <p className="text-xl font-bold">R$ 50.000 <span className="text-xs text-brand-green">/ 64%</span></p>
               </div>
               <button className="bg-brand-purple px-4 py-2 rounded-xl text-[10px] font-bold">Ver Relatório</button>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
               <Server className="w-5 h-5 text-brand-purple" /> Gerenciar Servidores WA
            </h3>
            <div className="space-y-4">
               {[
                 { name: 'Cluster BR-São Paulo', active: 45, total: 50, health: 'Excellent' },
                 { name: 'Cluster US-Virginia', active: 69, total: 78, health: 'Warning' }
               ].map((srv, idx) => (
                 <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-brand-dark">{srv.name}</p>
                       <p className="text-[10px] text-slate-400 font-medium">{srv.active} Instâncias rodando / {srv.total} limite</p>
                    </div>
                    <div className="text-right">
                       <p className={`text-[10px] font-black uppercase ${srv.health === 'Excellent' ? 'text-brand-green' : 'text-amber-500'}`}>{srv.health}</p>
                       <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${srv.health === 'Excellent' ? 'bg-brand-green' : 'bg-amber-500'}`} style={{ width: `${(srv.active/srv.total)*100}%` }}></div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-brand-purple hover:text-brand-purple transition-all">
               + Adicionar Novo Nó de Cluster
            </button>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
