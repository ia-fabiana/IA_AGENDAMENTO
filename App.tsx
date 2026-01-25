
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Agents from './views/Agents';
import Training from './views/Training';
import ChatSimulation from './views/ChatSimulation';
import Connections from './views/Connections';
import Architecture from './views/Architecture';
import Appointments from './views/Appointments';
import PlanAndCredits from './views/PlanAndCredits';
import AdminDashboard from './views/AdminDashboard';
import { AppRoute, Service, BusinessConfig, Appointment, AIConfig, UserCredits } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isWaConnected, setIsWaConnected] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(true);
  
  const currentTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const [credits, setCredits] = useState<UserCredits>({
    balance: 150, 
    totalLimit: 1000, 
    planName: 'Prata', 
    usageThisMonth: 0, 
    tokensTotal: 0
  });

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    id: 'Sofia_Agente', 
    tenantId: currentTenantId, 
    provider: 'gemini', 
    model: 'gemini-3-flash-preview',
    temperature: 0.7, 
    maxTokens: 2048, 
    name: 'Sofia', 
    behavior: 'Você é um assistente profissional da Estúdio Shine. Seu tom de voz é elegante e prestativo.', 
    useMasterKey: true, 
    botActive: true
  });

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 'a1', tenantId: currentTenantId, customerName: 'Maria Silva', phoneNumber: '11999999999', serviceId: 's1', serviceName: 'Corte Feminino', date: new Date().toISOString(), status: 'confirmed', value: 120 }
  ]);

  const [services, setServices] = useState<Service[]>([
    { id: 's1', tenantId: currentTenantId, name: 'Corte Feminino', price: 120, duration: 60 },
    { id: 's2', tenantId: currentTenantId, name: 'Escova Modelada', price: 80, duration: 45 }
  ]);

  const [config, setConfig] = useState<BusinessConfig>({
    id: currentTenantId, name: 'Estúdio Shine', address: 'Av. Paulista, 1000 - São Paulo',
    mapsLink: 'https://goo.gl/maps/shine', openingHours: 'Seg a Sáb, 08h-20h',
    cancellationPolicy: 'Aviso prévio 2h', minAdvanceTime: 2,
    promotion: { enabled: true, description: '20% OFF na primeira visita!', callToAction: 'Gostaria de agendar agora?', imageData: '' }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleNewAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-brand-purple w-10 h-10" /></div>;

    switch (activeRoute) {
      case AppRoute.DASHBOARD: return <Dashboard credits={credits} />;
      case AppRoute.AGENTS: return <Agents config={aiConfig} onSave={setAiConfig} credits={credits} />;
      case AppRoute.APPOINTMENTS: return <Appointments appointments={appointments} />;
      case AppRoute.TRAINING: return <Training config={config} setConfig={setConfig} services={services} setServices={setServices} />;
      case AppRoute.CONNECTIONS: 
        return (
          <Connections 
            tenantId={currentTenantId} 
            businessName={config.name} 
            isConnected={isWaConnected} 
            onConnectionChange={setIsWaConnected} 
          />
        );
      case AppRoute.CHAT_DEMO: 
        return (
          <ChatSimulation 
            config={config} 
            services={services} 
            appointments={appointments} 
            aiConfig={aiConfig} 
            credits={credits} 
            setCredits={setCredits} 
            onNewAppointment={handleNewAppointment} 
            onNavigate={setActiveRoute}
          />
        );
      case AppRoute.PLAN_AND_CREDITS: return <PlanAndCredits credits={credits} setCredits={setCredits} onNavigate={setActiveRoute} />;
      case AppRoute.ADMIN: return <AdminDashboard />;
      default: return <Dashboard credits={credits} />;
    }
  };

  return (
    <Layout activeRoute={activeRoute} onNavigate={setActiveRoute} isWaConnected={isWaConnected} selectedAI={aiConfig.provider} credits={credits} businessName={config.name} userRole={userRole} onRoleSwitch={setUserRole}>
      {renderContent()}
    </Layout>
  );
};

export default App;
