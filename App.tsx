import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Agents from './views/Agents';
import Training from './views/Training';
import ChatSimulation from './views/ChatSimulation';
import Connections from './views/Connections';
import Appointments from './views/Appointments';
import PlanAndCredits from './views/PlanAndCredits';
import AdminDashboard from './views/AdminDashboard';
import Login from './views/Login';
import AuthCallback from './views/AuthCallback';
import { AppRoute, Service, BusinessConfig, Appointment, AIConfig, UserCredits } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isWaConnected, setIsWaConnected] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCallback, setIsAuthCallback] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

  const [credits, setCredits] = useState<UserCredits>({
    balance: 150,
    totalLimit: 1000,
    planName: 'Prata',
    usageThisMonth: 0,
    tokensTotal: 0
  });

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    id: 'Sofia_Agente',
    tenantId: currentTenantId || '',
    provider: 'gemini',
    model: 'gemini-3-flash-preview',
    temperature: 0.7,
    maxTokens: 2048,
    name: 'Sofia',
    behavior: 'Você é um assistente profissional da Estúdio Shine. Seu tom de voz é elegante e prestativo.',
    useMasterKey: true,
    botActive: true
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<BusinessConfig>({
    id: currentTenantId || '',
    name: 'Meu Negócio',
    address: '',
    mapsLink: '',
    openingHours: '',
    cancellationPolicy: '',
    minAdvanceTime: 2,
    promotion: { enabled: false, description: '', callToAction: '', imageData: '' }
  });

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();

    // Verificar se é callback do OAuth
    if (window.location.pathname === '/auth/callback' || window.location.hash.includes('access_token')) {
      setIsAuthCallback(true);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsLoading(false);
        return;
      }

      if (session) {
        setIsAuthenticated(true);
        setCurrentUserId(session.user.id);
        await loadUserData(session.user.id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Carregar tenant do usuário
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (tenantError) {
        console.error('Erro ao carregar tenant:', tenantError);
        return;
      }

      if (tenant) {
        setCurrentTenantId(tenant.id);
        
        // Carregar configuração do negócio
        const { data: businessConfig } = await supabase
          .from('business_configs')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (businessConfig) {
          setConfig({
            id: tenant.id,
            name: businessConfig.business_name || 'Meu Negócio',
            address: businessConfig.business_address || '',
            mapsLink: '',
            openingHours: businessConfig.business_hours ? JSON.stringify(businessConfig.business_hours) : '',
            cancellationPolicy: '',
            minAdvanceTime: 2,
            promotion: { enabled: false, description: '', callToAction: '', imageData: '' }
          });
        }

        // Carregar serviços
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', userId);

        if (servicesData) {
          setServices(servicesData.map(s => ({
            id: s.id,
            tenantId: tenant.id,
            name: s.name,
            price: s.price,
            duration: s.duration
          })));
        }

        // Carregar agendamentos
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userId);

        if (appointmentsData) {
          setAppointments(appointmentsData.map(a => ({
            id: a.id,
            tenantId: tenant.id,
            customerName: '', // Precisaria fazer join com customers
            phoneNumber: '',
            serviceId: a.service_id,
            serviceName: '',
            date: a.scheduled_at,
            status: a.status,
            value: 0
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthCallback(false);
    setIsAuthenticated(true);
    checkAuth();
  };

  const handleNewAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-brand-purple w-10 h-10" />
        </div>
      );
    }

    // Se é callback de autenticação
    if (isAuthCallback) {
      return <AuthCallback onAuthSuccess={handleAuthSuccess} />;
    }

    // Se não está autenticado, mostrar login
    if (!isAuthenticated) {
      return <Login />;
    }

    // Renderizar conteúdo baseado na rota
    switch (activeRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard credits={credits} />;
      case AppRoute.AGENTS:
        return <Agents config={aiConfig} onSave={setAiConfig} credits={credits} />;
      case AppRoute.APPOINTMENTS:
        return <Appointments appointments={appointments} />;
      case AppRoute.TRAINING:
        return <Training config={config} setConfig={setConfig} services={services} setServices={setServices} />;
      case AppRoute.CONNECTIONS:
        return (
          <Connections
            tenantId={currentTenantId || ''}
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
      case AppRoute.PLAN_AND_CREDITS:
        return <PlanAndCredits credits={credits} setCredits={setCredits} onNavigate={setActiveRoute} />;
      case AppRoute.ADMIN:
        return <AdminDashboard />;
      default:
        return <Dashboard credits={credits} />;
    }
  };

  // Se não está autenticado ou é callback, não mostrar layout
  if (!isAuthenticated || isAuthCallback) {
    return renderContent();
  }

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
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
