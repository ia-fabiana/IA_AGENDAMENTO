
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
  ChevronRight
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
  onLogout?: () => void;
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
  onRoleSwitch,
  onLogout
}) => {
  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.AGENTS, label: 'Agentes IA', icon: Cpu },
    { id: AppRoute.APPOINTMENTS, label: 'Agendamentos', icon: Calendar },
    { id: AppRoute.TRAINING, label: 'Painel de Treino', icon: Settings },
    { id: AppRoute.CONNECTIONS, label: 'Conexões', icon: LinkIcon },
    { id: AppRoute.CHAT_DEMO, label: 'Simulador Chat', icon: MessageSquare },
    { id: AppRoute.PLAN_AND_CREDITS, label: 'Plano e Faturamento', icon: CreditCard },
  ];

  const adminMenu = [
    { id: AppRoute.ADMIN, label: 'Painel Master SaaS', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-72 bg-brand-dark flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-purple rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-purple/20">
                <Calendar className="w-6 h-6" />
             </div>
             <div className="overflow-hidden">
                <h1 className="text-sm font-black text-white truncate tracking-tighter uppercase">IA.AGENDAMENTOS</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">SaaS Management</p>
             </div>
          </div>
        </div>

        {/* Business Selector (Mock) */}
        <div className="px-6 py-4">
           {userRole === 'admin' ? (
             <div className="w-full bg-brand-purple/10 border border-brand-purple/30 p-3 rounded-2xl flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-brand-purple flex items-center justify-center text-white">
                   <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-purple font-bold uppercase tracking-tighter">Acesso Master</p>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Plataforma OK</p>
                </div>
             </div>
           ) : (
             <button className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-[10px] font-bold text-white uppercase">
                     {businessName.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Negócio Atual</p>
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{businessName}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
             </button>
           )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Menu Admin (Se houver) */}
          {userRole === 'admin' && (
             <div className="mb-6 space-y-1">
                <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Administração Global</p>
                {adminMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as AppRoute)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      activeRoute === item.id 
                      ? 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-brand-purple/30'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
             </div>
          )}

          <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">
            {userRole === 'admin' ? 'Visualizar como Cliente' : 'Menu Principal'}
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppRoute)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeRoute === item.id 
                ? 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20 translate-x-1' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeRoute === item.id ? 'text-white' : 'text-slate-600 group-hover:text-white'}`} />
              <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin Switcher Hook (Para você testar o painel) */}
        <div className="p-4 mx-4 mb-4 bg-slate-800/50 rounded-2xl border border-white/5">
           <p className="text-[9px] font-black text-slate-500 uppercase text-center mb-3">Dev Mode: Alternar Perfil</p>
           <button 
            onClick={() => onRoleSwitch(userRole === 'admin' ? 'user' : 'admin')}
            className="w-full bg-brand-purple/10 text-brand-purple py-2 rounded-xl text-[10px] font-bold border border-brand-purple/30 flex items-center justify-center gap-2 hover:bg-brand-purple hover:text-white transition-all"
           >
             <Terminal className="w-3 h-3" />
             {userRole === 'admin' ? 'Sair do Modo Root' : 'Entrar como Admin'}
           </button>
        </div>

        {onLogout && (
          <div className="p-4 border-t border-white/5">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-xs uppercase tracking-widest"
            >
              <LogOut className="w-5 h-5" />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter">
              {userRole === 'admin' && activeRoute === AppRoute.ADMIN ? 'Controle SaaS' : menuItems.find(i => i.id === activeRoute)?.label || 'Painel'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-brand-dark">{userRole === 'admin' ? 'Super Admin' : 'Admin Estúdio'}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{userRole === 'admin' ? 'Nível: Root' : `Plano: ${credits.planName}`}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${userRole === 'admin' ? 'bg-brand-dark shadow-brand-dark/20' : 'bg-gradient-to-br from-brand-purple to-brand-blue shadow-brand-purple/20'}`}>
                {userRole === 'admin' ? 'AD' : 'AE'}
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
