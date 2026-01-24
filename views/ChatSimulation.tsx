
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smartphone, Zap, Loader2, CalendarCheck, CheckCircle2, Clock, MapPin, Search, Cpu } from 'lucide-react';
import { BusinessConfig, Service, Appointment, ChatMessage, AIConfig, UserCredits } from '../types';
import { getAIResponse } from '../services/aiService';

interface ChatSimulationProps {
  config: BusinessConfig;
  services: Service[];
  appointments: Appointment[];
  aiConfig: AIConfig;
  credits: UserCredits;
  setCredits: (credits: UserCredits) => void;
  onNewAppointment?: (apt: Appointment) => void;
}

const ChatSimulation: React.FC<ChatSimulationProps> = ({ 
  config, services, appointments, aiConfig, credits, setCredits, onNewAppointment 
}) => {
  const [whatsappName, setWhatsappName] = useState('Mariana Silva');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'model', 
      text: `Olá ${whatsappName}! 👋 Eu sou ${aiConfig.name}, a assistente virtual da ${config.name}. Como posso te ajudar hoje?`, 
      timestamp: new Date() 
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isProcessingAction]);

  const handleSend = async () => {
    if (!inputValue.trim() || credits.balance <= 0) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    
    try {
      const result = await getAIResponse(inputValue, history, config, services, appointments, whatsappName, aiConfig);
      setIsTyping(false);

      if (result.functionCalls) {
        setIsProcessingAction(true);
        for (const fc of result.functionCalls) {
          // Pequena pausa para simular a execução da função no "servidor"
          await new Promise(r => setTimeout(r, 1500));

          if (fc.name === 'book_appointment') {
            const { serviceId, date } = fc.args;
            const service = services.find(s => s.id === serviceId) || services[0];
            
            const newApt: Appointment = {
              id: `apt_${Math.random().toString(36).substr(2, 5)}`,
              tenantId: config.id,
              customerName: whatsappName,
              phoneNumber: '11999999999',
              serviceId: service.id,
              serviceName: service.name,
              date: date,
              status: 'confirmed',
              value: service.price
            };
            
            if (onNewAppointment) onNewAppointment(newApt);
            
            setMessages(prev => [...prev, {
              role: 'model',
              text: `✨ Reserva confirmada! Agendei seu(sua) **${service.name}** para **${new Date(date).toLocaleString('pt-BR')}**. Mal podemos esperar para te atender!`,
              timestamp: new Date()
            }]);
          } else if (fc.name === 'get_services') {
             setMessages(prev => [...prev, {
              role: 'model',
              text: `Nossos principais serviços são:\n${services.map(s => `• **${s.name}**: R$ ${s.price.toFixed(2)}`).join('\n')}\nQual deles você deseja agendar?`,
              timestamp: new Date()
            }]);
          } else if (fc.name === 'check_availability') {
             setMessages(prev => [...prev, {
              role: 'model',
              text: `Consultei minha agenda aqui e esse horário está **disponível**! Podemos confirmar a sua reserva?`,
              timestamp: new Date()
            }]);
          }
        }
        setIsProcessingAction(false);
      } else {
        setMessages(prev => [...prev, { 
            role: 'model', 
            text: result.text, 
            timestamp: new Date(), 
            tokensConsumed: result.usage.totalTokens 
        }]);
      }

      setCredits({ ...credits, balance: Math.max(0, credits.balance - 1) });
    } catch (e) {
      console.error(e);
      setIsTyping(false);
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20 animate-slide-up">
      
      {/* Phone Showcase */}
      <div className="lg:col-span-2 relative">
        <div className="bg-brand-dark rounded-[4.5rem] p-4 shadow-2xl border-[16px] border-slate-900 aspect-[9/18.5] flex flex-col overflow-hidden relative z-10">
          
          {/* Hardware Details */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-slate-900 rounded-b-[2rem] z-30 flex justify-center items-center">
             <div className="w-14 h-1.5 bg-slate-800 rounded-full"></div>
             <div className="w-2 h-2 bg-slate-800 rounded-full ml-3"></div>
          </div>

          {/* Chat Navbar */}
          <div className="bg-[#075e54] text-white p-5 pt-12 flex items-center justify-between relative z-20">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-white/20 border border-white/20 flex items-center justify-center font-black text-xl shadow-lg">
                  {config.name.substring(0,1)}
               </div>
               <div>
                  <h4 className="font-bold text-sm leading-tight">{config.name}</h4>
                  <p className="text-[10px] text-emerald-200 flex items-center gap-1.5 mt-0.5">
                     <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse shadow-[0_0_8px_#4ABF4A]"></span> 
                     IA {aiConfig.name} online
                  </p>
               </div>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#e5ddd5] scroll-smooth"
            style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '450px' }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] shadow-sm relative leading-relaxed ${
                  msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}>
                  {msg.text}
                  <div className="flex items-center justify-end gap-1.5 mt-2 opacity-40">
                    <span className="text-[9px] font-bold uppercase">
                       {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'user' && <CheckCircle2 className="w-3 h-3 text-brand-blue" />}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-white/95 px-5 py-3 rounded-full text-[11px] w-fit animate-pulse font-bold text-slate-500 shadow-xl border border-white">
                IA está processando sua fala...
              </div>
            )}

            {isProcessingAction && (
              <div className="bg-brand-purple/10 border border-brand-purple/20 px-6 py-4 rounded-[2rem] text-[11px] w-fit animate-in zoom-in duration-300 flex items-center gap-4 shadow-xl backdrop-blur-sm">
                 <Loader2 className="w-5 h-5 text-brand-purple animate-spin" />
                 <span className="font-black text-brand-purple uppercase tracking-[0.2em]">Executando Agendamento...</span>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="bg-[#f0f2f5] p-5 flex items-center gap-4 border-t border-slate-200">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Fale com a IA..."
              className="flex-1 px-6 py-4 rounded-full border-none text-sm outline-none shadow-inner bg-white font-medium focus:ring-2 focus:ring-brand-purple transition-all"
            />
            <button 
              onClick={handleSend} 
              disabled={isTyping || isProcessingAction}
              className="w-14 h-14 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-90 transition-all disabled:opacity-50"
            >
              <Send className="w-6 h-6 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Intelligence Panel */}
      <div className="space-y-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-brand-dark flex items-center gap-3 uppercase tracking-tighter">
                <Cpu className="w-6 h-6 text-brand-purple" /> Agent Status
              </h3>
              <div className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-lg text-[9px] font-black uppercase">Live</div>
           </div>

           <div className="space-y-5">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> Engine v3.5
                 </div>
                 <p className="text-xs font-bold text-brand-dark leading-tight">Gemini 3 Pro + Native Function Calling</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Search className="w-3.5 h-3.5" /> Orquestração Ativa
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {['Reserva Real', 'Verificação Agenda', 'Catálogo Dinâmico'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 text-brand-dark text-[9px] font-black rounded-xl uppercase shadow-sm">
                        {tag}
                      </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-brand-dark p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-white/5">
           <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
              <Zap className="w-20 h-20 text-brand-purple" />
           </div>
           <p className="text-5xl font-black mb-1 tracking-tighter">{credits.balance}</p>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Saldo de Operação</p>
           <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <button className="text-[10px] font-black uppercase tracking-widest text-brand-purple hover:text-white transition-all flex items-center gap-2">
                Recarregar <CalendarCheck className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSimulation;
