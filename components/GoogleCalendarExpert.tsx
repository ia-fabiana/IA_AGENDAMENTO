import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Shield, 
  Zap,
  RefreshCcw,
  Loader2,
  Info,
  ChevronRight,
  Settings,
  Clock,
  Users
} from 'lucide-react';

interface GoogleCalendarExpertProps {
  tenantId: string;
  onConnectionSuccess?: () => void;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastSync: string | null;
  syncEnabled: boolean;
  hasToken: boolean;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  helpText?: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const OAUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SYNC_ENABLE_DELAY_MS = 500; // 0.5 seconds

export const GoogleCalendarExpert: React.FC<GoogleCalendarExpertProps> = ({ 
  tenantId,
  onConnectionSuccess 
}) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastSync: null,
    syncEnabled: false,
    hasToken: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'check-credentials',
      title: 'Verificar Credenciais',
      description: 'Validando configurações do Google OAuth',
      status: 'pending',
      helpText: 'Certificando que o servidor está configurado corretamente'
    },
    {
      id: 'authorize',
      title: 'Autorizar Acesso',
      description: 'Conectar sua conta Google',
      status: 'pending',
      helpText: 'Você será redirecionado para autorizar o acesso ao Google Calendar'
    },
    {
      id: 'save-token',
      title: 'Salvar Credenciais',
      description: 'Armazenar tokens de forma segura',
      status: 'pending',
      helpText: 'As credenciais serão criptografadas e armazenadas com segurança'
    },
    {
      id: 'enable-sync',
      title: 'Ativar Sincronização',
      description: 'Habilitar sincronização automática',
      status: 'pending',
      helpText: 'Todos os agendamentos serão sincronizados automaticamente'
    }
  ]);
  
  // Use ref to track connection completion for timeout logic
  const connectionCompletedRef = useRef(false);

  useEffect(() => {
    checkConnectionStatus();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if credentials are configured
      const authUrlResponse = await fetch(`${SERVER_URL}/api/calendar/auth-url`);
      const canConnect = authUrlResponse.ok;
      
      if (canConnect) {
        updateStepStatus('check-credentials', 'completed');
      } else {
        updateStepStatus('check-credentials', 'error');
        setError('Servidor não configurado. Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET');
      }

      // Check tenant connection status
      // Note: In production, this would query the database
      // For now, we'll use a placeholder
      setStatus({
        isConnected: false,
        lastSync: null,
        syncEnabled: false,
        hasToken: false
      });
    } catch (err: any) {
      console.error('Failed to check connection status:', err);
      setError('Erro ao verificar status da conexão');
      updateStepStatus('check-credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStepStatus = (stepId: string, status: SetupStep['status']) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    connectionCompletedRef.current = false;
    
    try {
      // Step 1: Check credentials
      updateStepStatus('check-credentials', 'in-progress');
      const authUrlResponse = await fetch(`${SERVER_URL}/api/calendar/auth-url`);
      
      if (!authUrlResponse.ok) {
        throw new Error('Falha ao obter URL de autorização');
      }
      
      const { authUrl } = await authUrlResponse.json();
      updateStepStatus('check-credentials', 'completed');
      
      // Step 2: Authorize
      updateStepStatus('authorize', 'in-progress');
      
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          const { code } = event.data;
          connectionCompletedRef.current = true;
          clearTimeout(timeoutId);
          
          updateStepStatus('authorize', 'completed');
          
          // Step 3: Save token
          updateStepStatus('save-token', 'in-progress');
          
          const callbackResponse = await fetch(`${SERVER_URL}/api/calendar/oauth-callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              tenantId,
            }),
          });

          if (!callbackResponse.ok) {
            throw new Error('Falha ao salvar credenciais');
          }
          
          updateStepStatus('save-token', 'completed');
          
          // Step 4: Enable sync
          updateStepStatus('enable-sync', 'in-progress');
          await new Promise(resolve => setTimeout(resolve, SYNC_ENABLE_DELAY_MS));
          updateStepStatus('enable-sync', 'completed');
          
          // Update status
          setStatus({
            isConnected: true,
            lastSync: new Date().toISOString(),
            syncEnabled: true,
            hasToken: true
          });
          
          popup?.close();
          window.removeEventListener('message', handleMessage);
          
          if (onConnectionSuccess) {
            onConnectionSuccess();
          }
          
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Timeout for popup - check ref to see if connection completed
      const timeoutId = setTimeout(() => {
        if (!connectionCompletedRef.current) {
          if (popup && !popup.closed) {
            popup.close();
          }
          window.removeEventListener('message', handleMessage);
          updateStepStatus('authorize', 'error');
          setError('Timeout: Autorização não completada');
          setIsConnecting(false);
        }
      }, OAUTH_TIMEOUT_MS);
      
    } catch (err: any) {
      console.error('Connection failed:', err);
      setError(err.message || 'Erro ao conectar Google Calendar');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/calendar/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId }),
      });

      if (response.ok) {
        setStatus({
          isConnected: false,
          lastSync: null,
          syncEnabled: false,
          hasToken: false
        });
        
        // Reset steps
        setSetupSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Erro ao desconectar');
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/calendar/force-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId }),
      });

      if (response.ok) {
        setStatus(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      } else {
        throw new Error('Falha na sincronização');
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-blue p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Especialista em Google Calendar</h2>
                <p className="text-white/80 text-sm">Assistente inteligente para integração</p>
              </div>
            </div>
          </div>
          
          {status.isConnected && (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Conectado</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Erro</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-sm font-semibold"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Setup Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Setup Steps */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-brand-dark flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-purple" />
                Processo de Conexão
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {setupSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                    step.status === 'in-progress' ? 'bg-brand-purple/5 border-2 border-brand-purple' :
                    step.status === 'completed' ? 'bg-brand-green/5 border border-brand-green/20' :
                    step.status === 'error' ? 'bg-red-50 border border-red-200' :
                    'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'completed' ? (
                      <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : step.status === 'in-progress' ? (
                      <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
                    ) : step.status === 'error' ? (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-dark">{step.title}</h4>
                    <p className="text-sm text-slate-600">{step.description}</p>
                    {step.helpText && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {step.helpText}
                      </p>
                    )}
                  </div>
                  
                  {step.status === 'completed' && (
                    <ChevronRight className="w-5 h-5 text-brand-green" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {!status.isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Iniciar Conexão Inteligente
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleForceSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </button>
                  
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                  >
                    Desconectar
                  </button>
                  
                  <button
                    onClick={() => window.open('https://calendar.google.com', '_blank')}
                    className="flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
                  >
                    Abrir Calendar
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status & Info Panel */}
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-purple" />
              Status da Conexão
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Conectado</span>
                <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-brand-green' : 'bg-slate-300'}`} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Sincronização</span>
                <div className={`w-3 h-3 rounded-full ${status.syncEnabled ? 'bg-brand-green' : 'bg-slate-300'}`} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Token Seguro</span>
                <div className={`w-3 h-3 rounded-full ${status.hasToken ? 'bg-brand-green' : 'bg-slate-300'}`} />
              </div>
            </div>
            
            {status.lastSync && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Última sincronia: {new Date(status.lastSync).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-2xl border border-brand-purple/20 p-6 space-y-4">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-purple" />
              Benefícios
            </h3>
            
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>Sincronização automática e bidirecional</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>Notificações por email para clientes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>Lembretes automáticos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>Tokens criptografados com segurança</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <span>Verificação de conflitos de horários</span>
              </li>
            </ul>
          </div>

          {/* Help Card */}
          <div className="bg-brand-dark rounded-2xl p-6 text-white space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Precisa de Ajuda?
            </h3>
            <p className="text-sm text-white/80">
              O Especialista em Google Calendar guia você através de todo o processo de configuração de forma inteligente e segura.
            </p>
            <button 
              onClick={() => window.open('/docs/google-calendar-setup', '_blank')}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Ver Documentação
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
