
import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  QrCode, 
  X, 
  Loader2, 
  Terminal,
  Zap,
  ShieldCheck,
  SmartphoneIcon,
  PlusCircle,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Users,
  Calendar
} from 'lucide-react';
// Import EVOLUTION_API_URL to fix reference error in CORS authorization button
import { evolutionService, EVOLUTION_API_URL } from '../services/evolutionService';
import { Instance } from '../types';

interface ConnectionsProps {
  tenantId: string;
  businessName: string;
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const Connections: React.FC<ConnectionsProps> = ({ tenantId, businessName, isConnected, onConnectionChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorType, setErrorType] = useState<null | 'CORS' | 'GENERIC'>(null);
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);
  const qrPollInterval = useRef<any>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  
  // Nome único da instância para este cliente
  const instanceName = evolutionService.formatInstanceName(tenantId);

  const [instance, setInstance] = useState<Instance | null>(
    isConnected ? {
      id: instanceName,
      tenant_id: tenantId,
      instance_name: instanceName,
      evolution_token: 'existing',
      status_conexao: 'connected',
    } : null
  );

  const addLog = (msg: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p].slice(0, 10));

  const handleCreateInstance = async () => {
    setIsModalOpen(true);
    setLoading(true);
    setQrCode(null);
    setErrorType(null);
    addLog(`Sincronizando cliente: ${businessName}`);
    
    try {
      const newInst = await evolutionService.createInstance(tenantId);
      setInstance(newInst);
      
      // Verifica se já está conectado antes de pedir QR
      const check = await evolutionService.validateHandshake(instanceName);
      if (check.connected) {
        handleSuccessConnection(check.number);
        return;
      }

      addLog("Gerando QR Code único para esta conta...");
      await new Promise(r => setTimeout(r, 2000));
      
      const qr = await evolutionService.getQRCode(instanceName);
      setQrCode(qr);
      addLog("QR Code pronto para leitura.");

      startPolling(instanceName);
    } catch (e: any) {
      if (e.message === "BLOCK_CORS") {
        setErrorType('CORS');
        addLog("BLOQUEIO: Navegador impediu conexão com IP de cluster.");
      } else {
        setErrorType('GENERIC');
        addLog(`ERRO API: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (name: string) => {
    if (qrPollInterval.current) clearInterval(qrPollInterval.current);
    qrPollInterval.current = setInterval(async () => {
      const res = await evolutionService.validateHandshake(name);
      if (res.connected) {
        clearInterval(qrPollInterval.current);
        handleSuccessConnection(res.number);
      }
    }, 5000);
  };

  const handleSuccessConnection = (number?: string) => {
    setShowSuccessCheck(true);
    addLog(`WhatsApp ${number || ''} vinculado ao Tenant!`);
    setTimeout(() => {
      setInstance(prev => prev ? { 
        ...prev, 
        status_conexao: 'connected',
        whatsapp_number: number 
      } : null);
      onConnectionChange(true);
      setIsModalOpen(false);
      setShowSuccessCheck(false);
    }, 2000);
  };

  const handleLogout = async () => {
    if (instance) {
      addLog("Removendo vínculo do dispositivo...");
      await evolutionService.logoutInstance(instance.instance_name);
      setInstance(null);
      onConnectionChange(false);
      if (qrPollInterval.current) clearInterval(qrPollInterval.current);
    }
  };

  const handleConnectCalendar = async () => {
    setCalendarLoading(true);
    try {
      // Busca URL de autorização do backend
      const response = await fetch('/auth/google/calendar', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
});
const response = await fetch('/auth/google/calendar', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
});
      const data = await response.json();
      
      // Abre popup para autorização
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        data.authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Escuta mensagem do popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_CALENDAR_CONNECTED') {
          setCalendarConnected(true);
          addLog('Google Calendar conectado com sucesso!');
          // Aqui você deve salvar os tokens no Supabase
          console.log('Calendar tokens:', event.data.tokens);
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Remove listener após 5 minutos
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
      }, 300000);
      
    } catch (error) {
      console.error('Error connecting calendar:', error);
      addLog('Erro ao conectar Google Calendar');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = () => {
    setCalendarConnected(false);
    addLog('Google Calendar desconectado');
    // Aqui você deve remover os tokens do Supabase
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-brand-dark p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
           <Users className="w-48 h-48 text-brand-purple" />
        </div>
        <div className="relative z-10 space-y-2">
          <p className="text-[10px] text-brand-purple font-black uppercase tracking-[0.3em]">Ambiente SaaS Multitenant</p>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Gestão de Conectividade</h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-widest border border-white/5">
                ID: {tenantId.substring(0, 8)}...
             </div>
             <div className="px-3 py-1 bg-brand-purple/20 rounded-lg text-[9px] font-bold text-brand-purple uppercase tracking-widest border border-brand-purple/20">
                {businessName}
             </div>
          </div>
        </div>
        <div className="px-8 py-4 bg-white/5 rounded-3xl border border-white/10 text-center backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2 text-brand-green font-black text-[10px] uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Cluster Ativo
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-3">
              <SmartphoneIcon className="w-6 h-6 text-brand-purple" /> Sua Instância Exclusiva
            </h3>
            {!instance && (
              <button 
                onClick={handleCreateInstance}
                className="bg-brand-purple text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-purple/20 hover:scale-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Conectar WhatsApp
              </button>
            )}
          </div>

          {!instance ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                <QrCode className="w-10 h-10" />
              </div>
              <h4 className="font-black text-brand-dark uppercase text-sm">Pronto para nova conexão</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Cada cliente possui seu próprio túnel de comunicação isolado.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] shadow-inner">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl ${instance.status_conexao === 'connected' ? 'bg-brand-green text-white shadow-brand-green/20' : 'bg-slate-200 text-slate-400'}`}>
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-brand-dark uppercase tracking-tighter">{instance.instance_name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                         {instance.whatsapp_number ? `Vinculado: ${instance.whatsapp_number}` : 'Sincronizando número...'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${instance.status_conexao === 'connected' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-amber-100 text-amber-600 border-amber-200 animate-pulse'}`}>
                    {instance.status_conexao === 'connected' ? 'CONECTADO' : 'PENDENTE'}
                  </span>
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/20 hover:scale-105 transition-all z-50 relative"
                  >
                    <LogOut className="w-4 h-4" />
                    Desconectar
                  </button>
                </div>
              </div>

              <div className="bg-brand-purple/5 p-6 rounded-3xl border border-brand-purple/10 flex items-start gap-3">
                 <Info className="w-5 h-5 text-brand-purple mt-0.5" />
                 <p className="text-xs text-brand-purple/80 font-medium leading-relaxed">
                   Esta instância é permanente para <strong>{businessName}</strong>. Caso o cliente troque de aparelho, ele deverá clicar em desconectar e gerar um novo código.
                 </p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-slate-100">
             <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logs do Túnel Evolution</span>
             </div>
             <div className="bg-brand-dark rounded-2xl p-5 font-mono text-[10px] space-y-1.5 h-32 overflow-y-auto shadow-inner scrollbar-hide">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">Monitorando eventos de rede...</p>
                ) : logs.map((log, i) => (
                  <p key={i} className={i === 0 ? 'text-brand-purple font-bold' : 'text-slate-500'}>{log}</p>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
              <h3 className="font-black text-brand-dark uppercase text-sm flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-purple" /> Sofia IA
              </h3>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-brand-dark uppercase tracking-tighter">Status do Bot</p>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-green animate-pulse shadow-[0_0_8px_#4ABF4A]' : 'bg-slate-300'}`}></span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                    Quando conectado, a IA Sofia responderá automaticamente todas as mensagens recebidas nesta instância.
                 </p>
              </div>
           </div>

           {/* Google Calendar */}
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
              <h3 className="font-black text-brand-dark uppercase text-sm flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Google Calendar
              </h3>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-brand-dark uppercase tracking-tighter">Status da Sincronização</p>
                    <span className={`w-2 h-2 rounded-full ${calendarConnected ? 'bg-brand-green animate-pulse shadow-[0_0_8px_#4ABF4A]' : 'bg-slate-300'}`}></span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed mb-6">
                    {calendarConnected 
                      ? 'Sua agenda Google está sincronizada. Agendamentos serão criados automaticamente.' 
                      : 'Conecte sua conta Google para sincronizar agendamentos automaticamente.'}
                 </p>
                 {!calendarConnected ? (
                   <button 
                     onClick={handleConnectCalendar}
                     disabled={calendarLoading}
                     className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {calendarLoading ? (
                       <>
                         <Loader2 className="w-4 h-4 animate-spin" />
                         Conectando...
                       </>
                     ) : (
                       <>
                         <Calendar className="w-4 h-4" />
                         Conectar Google Calendar
                       </>
                     )}
                   </button>
                 ) : (
                   <button 
                     onClick={handleDisconnectCalendar}
                     className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                   >
                     <LogOut className="w-4 h-4" />
                     Desconectar Calendar
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* MODAL DE QR CODE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-brand-dark">
              <X className="w-8 h-8" />
            </button>
            
            <div className="text-center space-y-10">
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tighter leading-none">Vincular Cliente</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Negócio: {businessName}</p>
               </div>
               
               <div className="relative w-64 h-64 mx-auto">
                  <div className="w-full h-full bg-slate-50 border-[12px] border-slate-100 p-8 rounded-[3.5rem] shadow-inner flex items-center justify-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provisionando...</span>
                      </div>
                    ) : qrCode ? (
                      <img src={qrCode} className="w-full h-full object-contain" alt="QR Code" />
                    ) : errorType === 'CORS' ? (
                      <div className="text-center space-y-4 px-2">
                         <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                         <p className="text-[9px] font-black text-amber-600 uppercase leading-tight">Falha de Segurança: Clique abaixo para autorizar o cluster.</p>
                         <button onClick={() => window.open(`${EVOLUTION_API_URL}`, '_blank')} className="text-[9px] font-black text-brand-purple underline flex items-center justify-center gap-1 mx-auto">
                            AUTORIZAR ACESSO <ExternalLink className="w-3 h-3" />
                         </button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <span className="text-[10px] font-black text-red-500 uppercase">Instância Offline.</span>
                      </div>
                    )}
                  </div>
                  
                  {showSuccessCheck && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-green/10 backdrop-blur-md rounded-[3.5rem] animate-in zoom-in">
                       <CheckCircle2 className="w-24 h-24 text-brand-green" />
                       <span className="text-sm font-black text-brand-green uppercase mt-4 tracking-[0.2em]">SINCRO OK!</span>
                    </div>
                  )}
               </div>

               <div className="pt-4">
                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span className={`w-2.5 h-2.5 rounded-full animate-ping ${loading ? 'bg-amber-500' : 'bg-brand-green'}`}></span>
                    {loading ? 'Buscando Dados...' : 'Aguardando Sincronia Celular...'}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
