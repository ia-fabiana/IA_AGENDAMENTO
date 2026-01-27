
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
import TenantManagement from './views/TenantManagement';
import Login from './views/Login';
import { AppRoute, Service, BusinessConfig, Appointment, AIConfig, UserCredits } from './types';
import { supabase } from './services/supabase';
import { authService } from './services/authService';
import { tenantService } from './services/tenantService';

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isWaConnected, setIsWaConnected] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Ler tenant_id da URL ou usar padrão
  const getTenantIdFromUrl = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    
    // Se tem tenant na URL, é um cliente acessando
    if (tenantParam) {
      setUserRole('user');
      return tenantParam;
    }
    
    // Se não tem tenant na URL, é admin
    // Usar tenant padrão para compatibilidade
    return '550e8400-e29b-41d4-a716-446655440000';
  };

  const currentTenantId = getTenantIdFromUrl();

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

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    setCheckingAuth(true);
    
    // Se tem tenant na URL, não precisa de autenticação (é um cliente)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tenant')) {
      setIsAuthenticated(true);
      setUserRole('user');
      setCheckingAuth(false);
      loadTenantData(urlParams.get('tenant')!);
      return;
    }

    // Se não tem tenant na URL, precisa de autenticação (é admin)
    const hasSession = await authService.hasActiveSession();
    setIsAuthenticated(hasSession);
    
    if (hasSession) {
      setUserRole('admin');
      setActiveRoute(AppRoute.ADMIN);
    }
    
    setCheckingAuth(false);
  };

  const loadTenantData = async (tenantId: string) => {
    try {
      const tenant = await tenantService.getTenant(tenantId);
      if (tenant) {
        setCredits({
          balance: tenant.saldo_creditos,
          totalLimit: 1000,
          planName: tenant.plano,
          usageThisMonth: 0,
          tokensTotal: 0,
        });
        setConfig(prev => ({ ...prev, name: tenant.nome_negocio }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do tenant:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserRole('admin');
    setActiveRoute(AppRoute.ADMIN);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUserRole('user');
    setActiveRoute(AppRoute.DASHBOARD);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleNewAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
  };

  // Se está verificando autenticação, mostrar loading
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-brand-purple via-brand-dark to-brand-blue">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  // Se não está autenticado e não tem tenant na URL, mostrar login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
      case AppRoute.ADMIN: 
        return userRole === 'admin' ? <TenantManagement /> : <AdminDashboard />;
      default: return <Dashboard credits={credits} />;
    }
  };

  return (
    <Layout 
      activeRoute={activeRoute} 
      onNavigate={setActiveRoute} 
      isWaConnected={isWaConnected} 
      selectedAI={aiConfig.provider} 
      credits={credits} 
      businessName={config.name} 
      userRole={userRole} 
      onRoleSwitch={setUserRole}
      onLogout={userRole === 'admin' ? handleLogout : undefined}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
