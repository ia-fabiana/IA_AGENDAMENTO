
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Training from './views/Training';
import ChatSimulation from './views/ChatSimulation';
import Connections from './views/Connections';
import Architecture from './views/Architecture';
import Appointments from './views/Appointments';
import { AppRoute, Service, BusinessConfig, Appointment } from './types';

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isWaConnected, setIsWaConnected] = useState(false);
  
  // State initialization
  const [config, setConfig] = useState<BusinessConfig>({
    name: 'Estúdio Shine',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    mapsLink: 'https://goo.gl/maps/shine-paulista',
    openingHours: 'Segunda a Sábado, das 08h às 20h',
    cancellationPolicy: 'Aviso prévio de pelo menos 2 horas. Caso contrário, será cobrada taxa de 50%.',
    minAdvanceTime: 2,
    promotion: {
      enabled: true,
      description: 'Ganhe 20% de desconto na sua primeira Limpeza de Pele este mês!',
      callToAction: 'Quer aproveitar essa oferta agora?',
      imageData: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=500&auto=format&fit=crop'
    }
  });

  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Manicure e Pedicure', price: 65, duration: 90 },
    { id: '2', name: 'Corte Feminino', price: 120, duration: 60 },
    { id: '3', name: 'Limpeza de Pele', price: 180, duration: 75 }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', customerName: 'Maria Oliveira', phoneNumber: '5511999991111', serviceId: '1', serviceName: 'Manicure', date: '2025-05-15T14:00:00Z', status: 'confirmed' },
    { id: '2', customerName: 'Ricardo Santos', phoneNumber: '5511988882222', serviceId: '3', serviceName: 'Limpeza de Pele', date: '2025-05-15T16:30:00Z', status: 'confirmed' }
  ]);

  const renderContent = () => {
    switch (activeRoute) {
      case AppRoute.DASHBOARD: return <Dashboard />;
      case AppRoute.APPOINTMENTS: return <Appointments appointments={appointments} />;
      case AppRoute.TRAINING: return (
        <Training 
          config={config} 
          setConfig={setConfig} 
          services={services} 
          setServices={setServices} 
        />
      );
      case AppRoute.CONNECTIONS: return (
        <Connections 
          isConnected={isWaConnected} 
          onConnectionChange={setIsWaConnected} 
        />
      );
      case AppRoute.CHAT_DEMO: return (
        <ChatSimulation 
          config={config} 
          services={services} 
          appointments={appointments} 
        />
      );
      case AppRoute.DOCS: return <Architecture />;
      default: return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-xl font-medium">Módulo em desenvolvimento...</p>
        </div>
      );
    }
  };

  return (
    <Layout 
      activeRoute={activeRoute} 
      onNavigate={setActiveRoute} 
      isWaConnected={isWaConnected}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
