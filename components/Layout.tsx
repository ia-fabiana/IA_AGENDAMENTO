
import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  MessageSquare, 
  Calendar, 
  Users, 
  Link as LinkIcon, 
  LogOut,
  BookOpen
} from 'lucide-react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isWaConnected: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate, isWaConnected }) => {
  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.APPOINTMENTS, label: 'Agendamentos', icon: Calendar },
    { id: AppRoute.TRAINING, label: 'Treinar IA', icon: Settings },
    { id: AppRoute.CONNECTIONS, label: 'Conexões', icon: LinkIcon },
    { id: AppRoute.CUSTOMERS, label: 'Clientes', icon: Users },
    { id: AppRoute.CHAT_DEMO, label: 'Simulador Chat', icon: MessageSquare },
    { id: AppRoute.DOCS, label: 'Arquitetura', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="bg-brand-purple p-1.5 rounded-lg shrink-0">
                <Calendar className="w-5 h-5 text-white" />
            </div>
            IA.AGENDAMENTOS
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeRoute === item.id 
                ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeRoute === item.id ? 'text-white' : 'text-slate-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-brand-dark capitalize">
            {menuItems.find(i => i.id === activeRoute)?.label}
          </h2>
          <div className="flex items-center gap-4">
            {isWaConnected ? (
              <div className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-brand-green/20 uppercase tracking-wider">
                <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
                WhatsApp Ativo
              </div>
            ) : (
              <div className="bg-red-50 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-red-100 uppercase tracking-wider">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                WhatsApp Desconectado
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold border border-brand-purple/20">
              AD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
