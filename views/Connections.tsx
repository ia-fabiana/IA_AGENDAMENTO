
import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle, 
  RefreshCcw, 
  QrCode, 
  X, 
  Loader2, 
  Terminal,
  Zap,
  Power,
  ShieldCheck,
  SmartphoneIcon,
  PlusCircle,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { evolutionService } from '../services/evolutionService';
import { Instance } from '../types';

interface ConnectionsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const Connections: React.FC<ConnectionsProps> = ({ isConnected, onConnectionChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Simulação de Instância do Tenant (Vindo do "Supabase")
  const [instance, setInstance] = useState<Instance | null>(
    isConnected ? {
      id: 'inst_1',
      tenant_id: 'shine-123',
      instance_name: 'estudio-shine-main',
      evolution_token: 'tok_abc123',
      status_conexao: 'connected',
      whatsapp_number: '5511999998888'
    } : null
  );

  const addLog = (msg: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p].slice(0, 5));

  const handleCreateInstance = async () => {
    setLoading(true);
    addLog("Iniciando criação de instância na Evolution API...");
    try {
      const newInst = await evolutionService.createInstance('shine-123', 'estudio-shine-main');
      setInstance(newInst);
      const qr = await evolutionService.getQRCode(newInst.instance_name);
      setQrCode(qr);
      setIsModalOpen(true);
      addLog("QR Code gerado. Aguardando leitura...");
    } catch (e) {
      addLog("Erro ao criar instância.");
    } finally {
      setLoading(false);
    }
  };

  const simulateSuccess = () => {
    if (instance) {
      setInstance({ ...instance, status_conexao: 'connected', whatsapp_number: '5511999998888' });
      onConnectionChange(true);
      setIsModalOpen(false);
      addLog("WhatsApp Conectado com Sucesso!");
    }
  };

  const handleLogout = async () => {
    if (instance) {
      addLog("Finalizando sessão...");
      await evolutionService.logoutInstance(instance.instance_name);
      setInstance(null);
      onConnectionChange(false);
      addLog("Instância removida.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SaaS Infrastructure Header */}
      <div className="bg-brand-dark p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Gateway WhatsApp</h2>
          <p className="text-xs text-slate-400 font-medium max-w-md leading-relaxed">
            Gerencie sua conexão oficial com a Evolution API. Sua instância é isolada e criptografada para máxima segurança dos seus dados.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status Global</p>
              <div className="flex items-center gap-2 text-brand-green font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> Servidor OK
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Connection Panel */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <SmartphoneIcon className="w-5 h-5 text-brand-purple" /> Suas Instâncias
            </h3>
            {!instance && (
              <button 
                onClick={handleCreateInstance}
                disabled={loading}
                className="bg-brand-purple text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-purple/20 hover:scale-105 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Nova Instância
              </button>
            )}
          </div>

          {!instance ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-300">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-brand-dark">Nenhuma conexão ativa</h4>
                <p className="text-xs text-slate-500 mt-1">Crie uma instância para começar a automatizar seu WhatsApp.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${instance.status_conexao === 'connected' ? 'bg-brand-green text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm uppercase tracking-tighter">{instance.instance_name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{instance.whatsapp_number || 'Aguardando pareamento...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${instance.status_conexao === 'connected' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                        {instance.status_conexao === 'connected' ? 'CONECTADO' : 'AGUARDANDO QR'}
                     </div>
                     <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                     </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Evolution Token</p>
                    <p className="text-[10px] font-mono text-brand-purple truncate">{instance.evolution_token}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Mensagens / Dia</p>
                    <p className="text-sm font-bold text-brand-dark">142</p>
                  </div>
               </div>
            </div>
          )}

          {/* Connection Logs */}
          <div className="mt-auto pt-8 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logs de Eventos</span>
             </div>
             <div className="bg-brand-dark rounded-2xl p-4 font-mono text-[10px] space-y-1.5 min-h-[100px]">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">Aguardando sinais do gateway...</p>
                ) : logs.map((log, i) => (
                  <p key={i} className={i === 0 ? 'text-brand-purple' : 'text-slate-500'}>{log}</p>
                ))}
             </div>
          </div>
        </div>

        {/* Bot Status & Settings */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-brand-dark flex items-center gap-2">
                <Power className="w-5 h-5 text-brand-purple" /> Controle do Bot
              </h3>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <div>
                   <p className="text-xs font-bold text-brand-dark">Ativação Mestra</p>
                   <p className="text-[10px] text-slate-500 italic">Liga/Desliga IA no WhatsApp</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isConnected} disabled={!isConnected} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                 </label>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Check</p>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Latência da API</span>
                    <span className="text-brand-green font-bold">142ms</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Uptime Instância</span>
                    <span className="text-slate-400 font-bold">99.98%</span>
                 </div>
              </div>
           </div>

           <div className="bg-brand-purple p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-purple/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                 <CheckCircle className="w-20 h-20" />
              </div>
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Webhook Security
              </h4>
              <p className="text-[11px] text-brand-purple/20 leading-relaxed font-medium">
                Seu webhook foi gerado automaticamente. Todas as mensagens recebidas pela Evolution API são processadas pelo nosso orquestrador de IA com isolamento de tenant.
              </p>
           </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl scale-in-center overflow-hidden relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-brand-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-6">
               <div className="inline-flex p-3 bg-brand-purple/10 text-brand-purple rounded-2xl mb-2">
                 <QrCode className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Conectar WhatsApp</h3>
               <p className="text-xs text-slate-500 max-w-xs mx-auto">Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo.</p>
               
               <div className="w-64 h-64 bg-slate-50 border-4 border-brand-purple/10 p-4 rounded-[2.5rem] mx-auto shadow-inner relative">
                  <img src={qrCode || ''} className="w-full h-full" alt="QR Code Evolution" />
                  <div className="absolute inset-0 bg-brand-purple/5 pointer-events-none rounded-[2.3rem] animate-pulse"></div>
               </div>

               <div className="pt-4 space-y-3">
                  <button 
                    onClick={simulateSuccess}
                    className="w-full bg-brand-purple text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-purple/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Simular Leitura (Ok)
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Aguardando Webhook do Gateway...
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scale-in-center { animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
        @keyframes scale-in-center { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Connections;
