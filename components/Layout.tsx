
import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  MessageSquare, 
  Calendar, 
  Users, 
  Link as LinkIcon, 
  LogOut,
  Cpu,
  CreditCard,
  ChevronDown,
  ShieldAlert,
  Terminal,
  Activity,
  Globe,
  Key,
  Database,
  CloudZap
} from 'lucide-react';
import { AppRoute, AIProvider, UserCredits } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isWaConnected: boolean;
  selectedAI: AIProvider;
  credits: UserCredits;
  businessName: string;
  userRole: 'admin' | 'user';
  onRoleSwitch: (role: 'admin' | 'user') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeRoute, 
  onNavigate, 
  isWaConnected,
  selectedAI,
  credits,
  businessName,
  userRole,
  onRoleSwitch
}) => {
  const isAdmin = userRole === 'admin';

  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.AGENTS, label: 'Agentes IA', icon: Cpu },
    { id: AppRoute.APPOINTMENTS, label: 'Agendamentos', icon: Calendar },
    { id: AppRoute.TRAINING, label: 'Painel de Treino', icon: Settings },
    { id: AppRoute.CONNECTIONS, label: 'Conexões', icon: LinkIcon },
    { id: AppRoute.CHAT_MONITOR, label: 'Monitoramento', icon: Activity },
    { id: AppRoute.PLAN_AND_CREDITS, label: 'Faturamento', icon: CreditCard },
  ];

  const adminMenu = [
    { id: AppRoute.ADMIN, label: 'Painel Master SaaS', icon: ShieldAlert },
  ];

  const toggleSecretRole = () => {
    onRoleSwitch(userRole === 'admin' ? 'user' : 'admin');
  };

  return (
    <div className={`flex h-screen ${isAdmin ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-500`}>
      {/* Sidebar com visual diferenciado */}
      <aside className={`w-72 ${isAdmin ? 'bg-black border-r border-amber-500/20' : 'bg-brand-dark'} flex flex-col shadow-2xl z-20 shrink-0 transition-all duration-500`}>
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
             <button 
                onClick={toggleSecretRole}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all outline-none ${
                  isAdmin 
                  ? 'bg-amber-500 shadow-amber-500/40 scale-110 rotate-12' 
                  : 'bg-brand-purple shadow-brand-purple/20 hover:scale-105'
                }`}
             >
                {isAdmin ? <Key className="w-5 h-5" /> : <Calendar className="w-6 h-6" />}
             </button>
             <div className="overflow-hidden">
                <h1 className={`text-sm font-black truncate tracking-tighter uppercase ${isAdmin ? 'text-amber-500' : 'text-white'}`}>
                  {isAdmin ? 'IA.MASTER ROOT' : 'IA.AGENDAMENTOS'}
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                  {isAdmin ? 'System Administrator' : 'SaaS Production'}
                </p>
             </div>
          </div>
        </div>

        <div className="px-6 py-4">
           {isAdmin ? (
             <div className="w-full bg-amber-500/5 border border-amber-500/30 p-4 rounded-3xl flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-150 transition-transform">
                   <ShieldAlert className="w-16 h-16 text-amber-500" />
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Acesso Master Ativo</p>
                </div>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Infraestrutura Global</p>
             </div>
           ) : (
             <div className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-[10px] font-bold text-white uppercase">
                     {businessName.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Negócio Ativo</p>
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{businessName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div title="Supabase Connected" className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_#4ABF4A] animate-pulse"></div>
                   <div title="WhatsApp Connected" className={`w-1.5 h-1.5 rounded-full ${isWaConnected ? 'bg-brand-blue' : 'bg-red-500'}`}></div>
                </div>
             </div>
           )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isAdmin && (
             <div className="mb-6 space-y-1">
                <p className="px-4 text-[9px] font-black text-amber-500/50 uppercase tracking-widest mb-2">Administração Central</p>
                {adminMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as AppRoute)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      activeRoute === item.id 
                      ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
             </div>
          )}

          <p className={`px-4 text-[9px] font-black uppercase tracking-widest mb-2 ${isAdmin ? 'text-slate-700' : 'text-slate-600'}`}>
            {isAdmin ? 'Espelhamento de Operação' : 'Painel de Operação'}
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppRoute)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeRoute === item.id 
                ? (isAdmin ? 'bg-white text-black' : 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20') 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeRoute === item.id ? (isAdmin ? 'text-black' : 'text-white') : 'text-slate-600'}`} />
              <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          {/* Badge de Ambiente para o Lojista */}
          {!isAdmin && (
            <div className="mb-4 px-4 py-3 bg-brand-green/5 rounded-2xl border border-brand-green/10 flex items-center gap-3">
               <CloudZap className="w-4 h-4 text-brand-green" />
               <div>
                  <p className="text-[9px] font-black text-brand-green uppercase tracking-widest">Produção Ativa</p>
                  <p className="text-[8px] text-slate-500 font-bold">Ambiente Criptografado</p>
               </div>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
             <Database className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-500' : 'text-slate-500'}`} />
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Supabase Node: Online</span>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-xs uppercase tracking-widest">
            <LogOut className="w-5 h-5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto transition-all duration-500">
        <header className={`h-20 border-b flex items-center justify-between px-10 sticky top-0 z-10 backdrop-blur-md transition-all duration-500 ${
          isAdmin ? 'bg-black/90 border-amber-500/20' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-black uppercase tracking-tighter ${isAdmin ? 'text-white' : 'text-brand-dark'}`}>
              {isAdmin && activeRoute === AppRoute.ADMIN ? 'COMANDO CENTRAL MASTER' : (menuItems.find(i => i.id === activeRoute)?.label || 'Visão Geral')}
            </h2>
            {isAdmin && (
               <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-black text-[9px] font-black rounded-full shadow-lg shadow-amber-500/20 animate-pulse">
                  <ShieldAlert className="w-3 h-3" /> MODO MASTER
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 border-l pl-6 ${isAdmin ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="text-right hidden md:block">
                <p className={`text-xs font-bold ${isAdmin ? 'text-amber-500' : 'text-brand-dark'}`}>
                  {isAdmin ? 'ADMINISTRADOR ROOT' : 'GESTOR DE UNIDADE'}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Status: {isAdmin ? 'Infra Online' : 'Produção Ativa'}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg transition-all ${
                isAdmin 
                ? 'bg-amber-500 shadow-amber-500/20 rotate-3' 
                : 'bg-brand-purple shadow-brand-purple/20'
              }`}>
                {isAdmin ? 'ROOT' : 'OP'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
