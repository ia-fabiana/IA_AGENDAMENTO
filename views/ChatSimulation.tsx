
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, CalendarCheck, CheckCircle2, Clock, MapPin, Cpu, ShieldCheck, Zap, Volume2, AlertTriangle } from 'lucide-react';
import { BusinessConfig, Service, Appointment, ChatMessage, AIConfig, UserCredits, AppRoute } from '../types';
import { getAIResponse } from '../services/aiService';

interface ChatSimulationProps {
  config: BusinessConfig;
  services: Service[];
  appointments: Appointment[];
  aiConfig: AIConfig;
  credits: UserCredits;
  setCredits: (credits: UserCredits) => void;
  onNewAppointment?: (apt: Appointment) => void;
  // Added onNavigate to props interface
  onNavigate: (route: AppRoute) => void;
}

const ChatSimulation: React.FC<ChatSimulationProps> = ({ 
  config, services, appointments, aiConfig, credits, setCredits, onNewAppointment, onNavigate 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAction, setIsAction] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'model', 
      text: `Olá Mariana! 👋 Sou ${aiConfig.name}, assistente da ${config.name}. Como posso te ajudar hoje?`, 
      timestamp: new Date() 
    }]);
  }, [aiConfig.name, config.name]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isAction]);

  const addLog = (msg: string) => setSystemLogs(prev => [msg, ...prev].slice(0, 5));

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (credits.balance <= 0) {
      setMessages(prev => [...prev, 
        { role: 'user', text: inputValue, timestamp: new Date() },
        { role: 'model', text: "⚠️ **SALDO INSUFICIENTE**\nSeu limite de mensagens para este mês foi atingido. Por favor, adquira mais créditos na aba 'Plano e Faturamento' para continuar utilizando a IA.", timestamp: new Date() }
      ]);
      setInputValue('');
      addLog("ERRO: Tentativa de envio sem créditos.");
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const result = await getAIResponse(inputValue, history, config, services, appointments, 'Mariana Silva', aiConfig);
      setIsTyping(false);

      if (result.functionCalls) {
        setIsAction(true);
        for (const fc of result.functionCalls) {
          addLog(`IA invocando ferramenta: ${fc.name}...`);
          await new Promise(r => setTimeout(r, 1500)); 

          if (fc.name === 'book_appointment') {
            const { serviceId, date } = fc.args;
            const service = services.find(s => s.id === serviceId) || services[0];
            const newApt: Appointment = {
              id: `apt_${Date.now()}`,
              tenantId: config.id,
              customerName: 'Mariana Silva',
              phoneNumber: '11999998888',
              serviceId: service.id,
              serviceName: service.name,
              date: String(date),
              status: 'confirmed',
              value: service.price
            };
            if (onNewAppointment) onNewAppointment(newApt);
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `✨ Reserva concluída! Marquei seu horário de **${service.name}** para o dia **${new Date(String(date)).toLocaleString('pt-BR')}**. Te esperamos lá!`, 
              timestamp: new Date() 
            }]);
          } else if (fc.name === 'get_services') {
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `Claro! Aqui estão nossos serviços:\n${services.map(s => `• **${s.name}**: R$ ${s.price}`).join('\n')}\nQual deles você tem interesse?`, 
              timestamp: new Date() 
            }]);
          } else if (fc.name === 'check_availability') {
             setMessages(prev => [...prev, { 
              role: 'model', 
              text: `Verifiquei aqui na agenda e esse horário está **disponível**! Gostaria que eu fizesse a reserva agora?`, 
              timestamp: new Date() 
            }]);
          }
        }
        setIsAction(false);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: result.text, timestamp: new Date(), tokensConsumed: result.usage.totalTokens }]);
      }
      setCredits({ ...credits, balance: Math.max(0, credits.balance - 1) });
    } catch (e) {
      console.error(e);
      setIsTyping(false);
      setIsAction(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20 animate-slide-up">
      {/* Coluna do WhatsApp */}
      <div className="lg:col-span-2 relative">
        <div className="bg-brand-dark rounded-[4.5rem] p-4 shadow-2xl border-[14px] border-slate-900 aspect-[9/18.5] flex flex-col overflow-hidden relative z-10">
          
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white p-5 pt-12 flex items-center justify-between relative z-20">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-xl shadow-lg">
                  {config.name.substring(0,1)}
               </div>
               <div>
                  <h4 className="font-bold text-sm tracking-tight">{config.name}</h4>
                  <p className="text-[10px] text-emerald-200 flex items-center gap-1.5 mt-0.5">
                     <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse shadow-[0_0_8px_#4ABF4A]"></span> 
                     {aiConfig.name} está online
                  </p>
               </div>
            </div>
            <Volume2 className="w-5 h-5 text-emerald-300 opacity-50" />
          </div>

          {/* Área de Mensagens */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#e5ddd5] scroll-smooth"
            style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] shadow-sm relative ${
                  msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                } ${msg.text.includes('⚠️') ? 'border-2 border-amber-500 shadow-xl' : ''}`}>
                  {msg.text.includes('⚠️') && <AlertTriangle className="w-4 h-4 text-amber-500 mb-2" />}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-2 opacity-50">
                    <span className="text-[9px] font-bold">
                       {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'user' && <CheckCircle2 className="w-3 h-3 text-brand-blue" />}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-white/90 px-5 py-2 rounded-full text-[11px] w-fit animate-pulse font-bold text-slate-500 shadow-sm border border-white">
                {aiConfig.name} está digitando...
              </div>
            )}

            {isAction && (
              <div className="bg-brand-purple/10 border border-brand-purple/20 px-5 py-4 rounded-3xl text-[11px] w-fit animate-in zoom-in duration-300 flex items-center gap-3 shadow-xl backdrop-blur-md">
                 <Loader2 className="w-4 h-4 text-brand-purple animate-spin" />
                 <span className="font-black text-brand-purple uppercase tracking-widest">Acessando API de Agenda...</span>
              </div>
            )}
          </div>

          {/* Input do WhatsApp */}
          <div className="bg-[#f0f2f5] p-5 flex items-center gap-3 border-t border-slate-200">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-5 py-4 rounded-full border-none text-sm outline-none shadow-inner bg-white font-medium"
            />
            <button 
              onClick={handleSend} 
              disabled={isTyping || isAction}
              className="w-14 h-14 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
            >
              <Send className="w-6 h-6 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar de Inteligência */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-brand-dark flex items-center gap-3 uppercase tracking-tighter">
                <Cpu className="w-6 h-6 text-brand-purple" /> Agent Status
              </h3>
              <span className="w-3 h-3 bg-brand-green rounded-full shadow-[0_0_10px_#4ABF4A]"></span>
           </div>

           <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Motor Ativo
                 </p>
                 <p className="text-xs font-bold text-brand-dark">Gemini 3 Pro (Function Calling)</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Logs de Execução
                 </p>
                 <div className="bg-brand-dark text-emerald-400 p-3 rounded-xl font-mono text-[9px] min-h-[100px] overflow-hidden">
                    {systemLogs.length === 0 ? (
                      <span className="opacity-30">Aguardando gatilhos...</span>
                    ) : systemLogs.map((log, i) => (
                      <div key={i} className="mb-1">{`> ${log}`}</div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-brand-dark p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-white/5">
           <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
              <Zap className="w-20 h-20 text-brand-purple" />
           </div>
           <p className="text-5xl font-black mb-1 tracking-tighter animate-in zoom-in duration-500" key={credits.balance}>{credits.balance}</p>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Saldo de Operação</p>
           <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <button 
                // Updated to use the passed onNavigate prop
                onClick={() => onNavigate(AppRoute.PLAN_AND_CREDITS)}
                className="text-[10px] font-black uppercase tracking-widest text-brand-purple hover:text-white transition-all flex items-center gap-2"
              >
                Recarregar SaaS <CalendarCheck className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSimulation;
