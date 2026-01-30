
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Agents from './views/Agents';
import Training from './views/Training';
import ChatMonitor from './views/ChatMonitor';
import Connections from './views/Connections';
import Appointments from './views/Appointments';
import PlanAndCredits from './views/PlanAndCredits';
import AdminDashboard from './views/AdminDashboard';
import { dbService } from './services/dbService';
import { AppRoute, Service, BusinessConfig, Appointment, AIConfig, UserCredits } from './types';

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isWaConnected, setIsWaConnected] = useState(false);
  const [dbConnected, setDbConnected] = useState<'checking' | 'online' | 'offline'>('checking');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(true);
  
  const currentTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const [credits, setCredits] = useState<UserCredits>({
    balance: 0, totalLimit: 5000, planName: 'Prata', usageThisMonth: 0 
  });

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    id: 'Sofia_Agente', tenantId: currentTenantId, provider: 'gemini', 
    model: 'gemini-3-flash-preview', temperature: 0.7, maxTokens: 2048, 
    name: 'Sofia', behavior: 'Você é um assistente profissional da Estúdio Shine.', 
    useMasterKey: true, botActive: true
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<BusinessConfig>({
    id: currentTenantId, name: 'Carregando...', phoneNumber: '',
    address: '', mapsLink: '', openingHours: '',
    cancellationPolicy: '', minAdvanceTime: 2,
    promotion: { enabled: false, description: '', callToAction: '', imageData: '' }
  });

  const refreshData = useCallback(async () => {
    try {
      const isConnected = await dbService.checkConnection();
      setDbConnected(isConnected ? 'online' : 'offline');

      const [dbConfig, dbServices, dbAppointments] = await Promise.all([
        dbService.getBusinessConfig(currentTenantId),
        dbService.getServices(currentTenantId),
        dbService.getAppointments(currentTenantId)
      ]);

      if (dbConfig) setConfig(dbConfig);
      if (dbServices.length > 0) setServices(dbServices);
      setAppointments(dbAppointments);
      setCredits(prev => ({ ...prev, balance: 240 })); 
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      setDbConnected('offline');
    }
  }, [currentTenantId]);

  useEffect(() => {
    refreshData().then(() => setIsLoading(false));
  }, [refreshData]);

  const handleUpdateConfig = async (newConfig: BusinessConfig) => {
    setConfig(newConfig);
    await dbService.updateBusinessConfig(newConfig);
  };

  const handleSaveServices = async (newServices: Service[]) => {
    setServices(newServices);
    for (const s of newServices) await dbService.saveService(s);
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex h-screen flex-col items-center justify-center bg-brand-dark text-white space-y-6">
        <Loader2 className="animate-spin text-brand-purple w-12 h-12" />
        <div className="text-center">
           <h2 className="text-xl font-black uppercase tracking-widest">Iniciando Protocolos SaaS</h2>
           <p className="text-[10px] text-slate-500 uppercase font-black mt-2 tracking-[0.3em]">Checking Supabase Cluster...</p>
        </div>
      </div>
    );

    if (dbConnected === 'offline') {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-10">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl text-center max-w-lg space-y-8 animate-in zoom-in">
             <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-12 h-12" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Banco de Dados Offline</h3>
                <p className="text-sm text-slate-600 mt-2">Não foi possível estabelecer conexão com o cluster de dados Supabase.</p>
                <div className="mt-4 text-left bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-2">
                  <p className="font-bold text-brand-dark">Como resolver:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Crie um arquivo <code className="bg-white px-1 py-0.5 rounded">.env</code> na raiz do projeto</li>
                    <li>Copie o conteúdo de <code className="bg-white px-1 py-0.5 rounded">.env.example</code></li>
                    <li>Configure suas credenciais do Supabase:
                      <ul className="list-disc list-inside ml-4 mt-1 text-[10px]">
                        <li>VITE_SUPABASE_URL</li>
                        <li>VITE_SUPABASE_ANON_KEY</li>
                      </ul>
                    </li>
                    <li>Reinicie a aplicação</li>
                  </ol>
                  <p className="text-[10px] text-slate-500 mt-2">Consulte o arquivo <code className="bg-white px-1 py-0.5 rounded">QUICKSTART.md</code> para mais detalhes</p>
                </div>
             </div>
             <button onClick={() => window.location.reload()} className="w-full bg-brand-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">
                Tentar Reconectar
             </button>
          </div>
        </div>
      );
    }

    switch (activeRoute) {
      case AppRoute.DASHBOARD: return <Dashboard credits={credits} />;
      case AppRoute.AGENTS: return <Agents config={aiConfig} onSave={setAiConfig} credits={credits} />;
      case AppRoute.APPOINTMENTS: return <Appointments appointments={appointments} />;
      case AppRoute.TRAINING: return <Training config={config} setConfig={handleUpdateConfig} services={services} setServices={handleSaveServices} />;
      case AppRoute.CONNECTIONS: 
        return (
          <Connections 
            tenantId={currentTenantId} 
            businessName={config.name} 
            registeredPhone={config.phoneNumber} 
            isConnected={isWaConnected} 
            onConnectionChange={setIsWaConnected}
            onUpdateConfig={setConfig}
            currentConfig={config}
          />
        );
      case AppRoute.CHAT_MONITOR: 
        return <ChatMonitor config={config} aiConfig={aiConfig} credits={credits} isConnected={isWaConnected} onNavigate={setActiveRoute} services={services} appointments={appointments} onRefreshData={refreshData} />;
      case AppRoute.PLAN_AND_CREDITS: return <PlanAndCredits credits={credits} setCredits={setCredits} onNavigate={setActiveRoute} />;
      case AppRoute.ADMIN: return <AdminDashboard />;
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
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
