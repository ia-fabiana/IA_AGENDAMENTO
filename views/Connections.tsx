
import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  QrCode, 
  X, 
  Loader2, 
  PlusCircle, 
  LogOut, 
  CheckCircle2, 
  SmartphoneIcon,
  RefreshCcw,
  Zap,
  Lock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { evolutionService, evolutionApiKey } from '../services/evolutionService';
import { dbService } from '../services/dbService';
import { Instance, BusinessConfig } from '../types';

interface ConnectionsProps {
  tenantId: string;
  businessName: string;
  registeredPhone: string;
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
  // Adicionado para permitir atualização do config pai
  onUpdateConfig?: (config: BusinessConfig) => void;
  currentConfig?: BusinessConfig;
}

const Connections: React.FC<ConnectionsProps> = ({ 
  tenantId, 
  businessName, 
  registeredPhone, 
  isConnected, 
  onConnectionChange,
  onUpdateConfig,
  currentConfig
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<'none' | 'protocol' | 'missing-key' | 'generic'>('none');
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const qrPollInterval = useRef<any>(null);
  
  const instanceName = evolutionService.formatInstanceName(businessName);
  const [instance, setInstance] = useState<Instance | null>(
    isConnected ? {
      id: instanceName,
      tenant_id: tenantId,
      instance_name: instanceName,
      evolution_token: 'existing',
      status_conexao: 'connected',
    } : null
  );

  // Verifica se o número conectado é o mesmo do perfil
  const isPhoneMismatch = connectedNumber && registeredPhone && 
    connectedNumber.replace(/\D/g, '') !== registeredPhone.replace(/\D/g, '');

  const handleConnect = async () => {
    setIsModalOpen(true);
    setLoading(true);
    setErrorStatus('none');
    setQrCode(null);
    
    try {
      if (!evolutionApiKey) {
        setErrorStatus('missing-key');
        setLoading(false);
        return;
      }

      const newInst = await evolutionService.createInstance(businessName);
      setInstance(newInst);
      
      const check = await evolutionService.validateHandshake(instanceName);
      if (check.connected) {
        onSuccess(check.number);
        return;
      }

      try {
        const qr = await evolutionService.getQRCode(instanceName);
        setQrCode(qr);
        setLoading(false);
        startPolling(instanceName);
      } catch (e: any) {
        if (e.message === "PROTOCOL_MISMATCH") {
          setErrorStatus('protocol');
          setLoading(false);
        } else {
          setTimeout(handleConnect, 3000);
        }
      }
    } catch (e: any) {
      if (e.message === "PROTOCOL_MISMATCH") setErrorStatus('protocol');
      else setErrorStatus('generic');
      setLoading(false);
    }
  };

  const startPolling = (name: string) => {
    if (qrPollInterval.current) clearInterval(qrPollInterval.current);
    qrPollInterval.current = setInterval(async () => {
      const res = await evolutionService.validateHandshake(name);
      if (res.connected) {
        clearInterval(qrPollInterval.current);
        onSuccess(res.number);
      }
    }, 5000);
  };

  const onSuccess = (number?: string) => {
    const cleanNumber = number?.split('@')[0] || '';
    setConnectedNumber(cleanNumber);
    setShowSuccess(true);
    
    setTimeout(() => {
      setInstance(prev => prev ? { ...prev, status_conexao: 'connected', whatsapp_number: cleanNumber } : null);
      onConnectionChange(true);
      setIsModalOpen(false);
      setShowSuccess(false);
    }, 2500);
  };

  const handleSyncPhone = async () => {
    if (connectedNumber && currentConfig && onUpdateConfig) {
      const newConfig = { ...currentConfig, phoneNumber: connectedNumber };
      await dbService.updateBusinessConfig(newConfig);
      onUpdateConfig(newConfig);
      alert("Número do perfil atualizado com sucesso!");
    }
  };

  const handleDisconnect = async () => {
    if (confirm(`Deseja desativar a assistente Sofia para ${businessName}? Isso interromperá os atendimentos automáticos imediatamente.`)) {
      await evolutionService.logoutInstance(instanceName);
      setInstance(null);
      setConnectedNumber(null);
      onConnectionChange(false);
      if (qrPollInterval.current) clearInterval(qrPollInterval.current);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
           <Zap className="w-64 h-64 text-brand-purple" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
           <div className="w-16 h-16 bg-brand-purple/10 text-brand-purple rounded-3xl flex items-center justify-center shadow-inner">
              <SmartphoneIcon className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter leading-none">Canal de Atendimento</h2>
              <p className="text-xs text-slate-500 font-medium mt-2">Vincule seu WhatsApp para ativar a inteligência artificial.</p>
           </div>
        </div>
        <div className="relative z-10">
           {!instance ? (
             <button 
                onClick={handleConnect}
                className="bg-brand-purple text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-purple/20 hover:scale-105 transition-all"
              >
                <PlusCircle className="w-5 h-5" /> Ativar Sofia
              </button>
           ) : (
             <div className="flex items-center gap-3 px-6 py-3 bg-brand-green/10 rounded-2xl border border-brand-green/20">
                <CheckCircle2 className="w-5 h-5 text-brand-green" />
                <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Sincronizado</span>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col min-h-[380px]">
            {!instance ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                  <QrCode className="w-12 h-12" />
                </div>
                <h4 className="font-black text-brand-dark uppercase text-sm tracking-widest">Aguardando Configuração</h4>
                <p className="text-[11px] text-slate-400 mt-3 max-w-[300px] leading-relaxed">
                  Ao clicar em ativar, geraremos um código de segurança exclusivo para vincular sua conta à nossa IA.
                </p>
              </div>
            ) : (
              <div className="space-y-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-green text-white flex items-center justify-center shadow-lg shadow-brand-green/20">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-brand-dark uppercase tracking-tight">Status: Conectado</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                         Instância: {instance.instance_name}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDisconnect} 
                    className="flex items-center gap-3 px-5 py-3 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl shadow-sm transition-all border border-slate-100 group"
                  >
                      <LogOut className="w-6 h-6" />
                  </button>
                </div>

                {/* ALERTA DE DIVERGÊNCIA DE NÚMERO */}
                {isPhoneMismatch && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4">
                     <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                     <div className="flex-1">
                        <h5 className="text-xs font-black text-amber-800 uppercase tracking-tight">Divergência de Identidade</h5>
                        <p className="text-[11px] text-amber-600 mt-1 leading-relaxed">
                          O WhatsApp conectado é o <strong>{connectedNumber}</strong>, mas no seu perfil consta o número <strong>{registeredPhone}</strong>. A IA pode informar o número errado para seus clientes.
                        </p>
                        <button 
                          onClick={handleSyncPhone}
                          className="mt-3 flex items-center gap-2 text-[10px] font-black text-amber-700 hover:underline uppercase tracking-widest"
                        >
                          Atualizar Perfil com este número <ArrowRight className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                      <ShieldCheck className="w-6 h-6 text-brand-purple" />
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase">Segurança</p>
                         <p className="text-[11px] font-bold text-brand-dark">Conexão Blindada</p>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                      <Zap className="w-6 h-6 text-brand-blue" />
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase">Motor IA</p>
                         <p className="text-[11px] font-bold text-brand-dark">Operação em Tempo Real</p>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-brand-dark p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Zap className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Sofia v2.5</h3>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    Sua assistente está configurada para converter conversas em agendamentos oficiais 24 horas por dia.
                 </p>
              </div>
              
              <div className="space-y-3 pt-8 relative z-10">
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" /> Automação de Agenda
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" /> Respostas Inteligentes
                 </div>
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
            {(!loading && !showSuccess) && (
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-brand-dark transition-colors">
                <X className="w-8 h-8" />
              </button>
            )}
            
            <div className="text-center space-y-10">
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tighter leading-none">Vincular WhatsApp</h3>
                  <p className="text-[10px] text-brand-purple font-black uppercase tracking-widest">{businessName}</p>
               </div>
               
               <div className="relative w-64 h-64 mx-auto">
                  <div className="w-full h-full bg-slate-50 border-[12px] border-slate-100 p-8 rounded-[3.5rem] shadow-inner flex items-center justify-center relative overflow-hidden">
                    
                    {loading ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iniciando Sincronia...</span>
                      </div>
                    ) : qrCode ? (
                      <img src={qrCode} className="w-full h-full object-contain animate-in fade-in" alt="Aguardando Leitura" />
                    ) : errorStatus === 'protocol' ? (
                      <div className="text-center space-y-4 px-4">
                         <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <RefreshCcw className="w-8 h-8 text-amber-500 animate-spin" />
                         </div>
                         <p className="text-[11px] font-bold text-slate-500 leading-tight italic">Preparando túnel de comunicação segura...</p>
                         <p className="text-[9px] text-slate-400 uppercase font-black">Isso pode levar até 30 segundos.</p>
                      </div>
                    ) : errorStatus === 'missing-key' ? (
                      <div className="text-center space-y-4 px-4">
                         <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                         </div>
                         <p className="text-[11px] font-bold text-slate-500 leading-tight italic">Chave da Evolution API não configurada.</p>
                         <p className="text-[9px] text-slate-400 uppercase font-black">Atualize a configuração de ambiente para continuar.</p>
                      </div>
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <Loader2 className="w-8 h-8 text-brand-purple animate-spin mx-auto" />
                        <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Conectando...</span>
                      </div>
                    )}

                    {showSuccess && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-green/10 backdrop-blur-md rounded-[3.5rem] animate-in zoom-in">
                         <CheckCircle2 className="w-20 h-20 text-brand-green" />
                         <span className="text-xs font-black text-brand-green uppercase mt-4 tracking-widest">CONECTADO!</span>
                      </div>
                    )}
                  </div>
               </div>

               <div className="pt-4 space-y-6">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                     Escaneie o código com seu celular para que a Sofia comece a atender seus clientes.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                     <div className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Criptografado</div>
                     <div className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Alta Velocidade</div>
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
