
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, Cpu, ShieldCheck, Zap, Volume2, AlertTriangle, Smartphone, History, MessageSquare, Terminal, FlaskConical, Calendar } from 'lucide-react';
import { BusinessConfig, AIConfig, UserCredits, AppRoute, ChatMessage, Service, Appointment } from '../types';
import { getAIResponse } from '../services/aiService';
import { dbService } from '../services/dbService';

interface ChatMonitorProps {
  config: BusinessConfig;
  aiConfig: AIConfig;
  credits: UserCredits;
  isConnected: boolean;
  onNavigate: (route: AppRoute) => void;
  services: Service[];
  appointments: Appointment[];
  onRefreshData: () => void;
}

const ChatMonitor: React.FC<ChatMonitorProps> = ({ 
  config, aiConfig, credits, isConnected, onNavigate, services, appointments, onRefreshData
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

  const handleTestSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    addLog(`Usuário: ${inputValue}`);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const result = await getAIResponse(inputValue, history, config, services, appointments, 'Usuário de Teste', aiConfig);
      
      // EXECUTOR DE FUNÇÕES REAIS
      if (result.functionCalls) {
        for (const fc of result.functionCalls) {
          addLog(`EXECUTANDO: ${fc.name}`);
          
          let functionResponse: any = "ok";

          if (fc.name === 'listar_servicos') {
            functionResponse = services.map(s => `${s.name}: R$ ${s.price}`).join(', ');
          } 
          else if (fc.name === 'verificar_disponibilidade') {
            const { data_hora } = fc.args;
            const conflict = appointments.find(a => a.date === data_hora);
            functionResponse = conflict ? "horário_ocupado" : "disponível";
          }
          else if (fc.name === 'confirmar_agendamento') {
            const { cliente_nome, servico_id, data_hora } = fc.args;
            const service = services.find(s => s.id === servico_id) || services[0];
            
            const newApt: Appointment = {
              id: crypto.randomUUID(),
              tenantId: config.id,
              customerName: cliente_nome,
              phoneNumber: '5511999999999',
              serviceId: service.id,
              serviceName: service.name,
              date: data_hora,
              status: 'confirmed',
              value: service.price
            };

            addLog(`DATABASE: Gravando agendamento para ${cliente_nome}`);
            await dbService.createAppointment(newApt);
            onRefreshData(); // Atualiza a lista global
            functionResponse = "agendamento_confirmado_com_sucesso";
          }

          // Segunda chamada para a IA processar o resultado da função
          addLog(`FEEDBACK IA: Processando resultado da função...`);
          const followUp = await getAIResponse(
            `O resultado da função ${fc.name} foi: ${functionResponse}. Informe ao cliente.`,
            [...history, { role: 'user', parts: [{ text: inputValue }] }],
            config, services, appointments, 'Usuário de Teste', aiConfig
          );
          
          setMessages(prev => [...prev, { role: 'model', text: followUp.text, timestamp: new Date() }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: result.text, timestamp: new Date() }]);
      }
      addLog("IA: Resposta finalizada.");
    } catch (e) {
      addLog("ERRO: Falha no motor de execução.");
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20 animate-in fade-in duration-700">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col h-[700px]">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-3xl flex items-center justify-center">
                    <FlaskConical className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Laboratório de IA</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sandbox de Homologação em Tempo Real</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-dark rounded-xl">
                 <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black text-brand-purple uppercase tracking-[0.2em]">Engine Conectado</span>
              </div>
           </div>

           <div className="flex-1 bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden flex flex-col relative shadow-inner">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                      <MessageSquare className="w-12 h-12" />
                      <p className="text-xs font-bold uppercase tracking-widest">Diga "Olá" para testar o fluxo de agendamento</p>
                   </div>
                 )}
                 {messages.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[80%] p-5 rounded-3xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-brand-purple text-white' : 'bg-white border border-slate-100'}`}>
                         <p className="leading-relaxed">{msg.text}</p>
                         <p className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                           {msg.timestamp.toLocaleTimeString()}
                         </p>
                      </div>
                   </div>
                 ))}
                 {isTyping && (
                   <div className="bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm w-fit animate-pulse flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-brand-purple" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Sofia Processando...</span>
                   </div>
                 )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
                 <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTestSend()}
                  placeholder="Ex: Gostaria de marcar um corte amanhã às 15h"
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                 />
                 <button 
                  onClick={handleTestSend}
                  disabled={isTyping}
                  className="w-14 h-14 bg-brand-purple text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                   <Send className="w-6 h-6" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-brand-dark p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8 min-h-[400px]">
           <h3 className="font-black flex items-center gap-3 uppercase tracking-tighter text-brand-purple">
             <Terminal className="w-6 h-6" /> Logs do Database
           </h3>

           <div className="space-y-3 font-mono text-[9px]">
              {logs.map((log, i) => (
                <div key={i} className="text-emerald-400/80 border-l-2 border-emerald-500/20 pl-3 py-1 animate-in fade-in slide-in-from-left-2">
                   {log}
                </div>
              ))}
              {logs.length === 0 && <p className="text-slate-600 italic">Ouvindo gatilhos do sistema...</p>}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-4">
           <h4 className="text-xs font-black text-brand-dark uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-purple" /> Agendamento Real
           </h4>
           <p className="text-[10px] text-slate-500 leading-relaxed">
             Cada agendamento feito neste laboratório é **persistido no banco de dados**. Isso permite que você teste o sistema de ponta a ponta sem precisar de um chip de WhatsApp ativo.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMonitor;
