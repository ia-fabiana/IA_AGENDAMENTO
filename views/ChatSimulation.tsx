
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Smartphone, Zap, ShieldCheck, Tag } from 'lucide-react';
import { BusinessConfig, Service, Appointment, ChatMessage } from '../types';
import { getAIResponse } from '../services/geminiService';

interface ChatSimulationProps {
  config: BusinessConfig;
  services: Service[];
  appointments: Appointment[];
}

const ChatSimulation: React.FC<ChatSimulationProps> = ({ config, services, appointments }) => {
  const [whatsappName, setWhatsappName] = useState('Mariana Silva');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { 
        role: 'model', 
        text: `Olá ${whatsappName}! 👋 Sou a IA da ${config.name}. Como posso te ajudar hoje?`, 
        timestamp: new Date() 
      }
    ]);
  }, [config.name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const result = await getAIResponse(
      inputValue, 
      history, 
      config, 
      services, 
      appointments, 
      whatsappName
    );
    
    setIsTyping(false);
    
    // Add text message
    setMessages(prev => [...prev, { role: 'model', text: result.text, timestamp: new Date() }]);

    // If AI decided to send promo art
    if (result.showPromotion && config.promotion.imageData) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: config.promotion.callToAction, 
          image: config.promotion.imageData,
          timestamp: new Date() 
        }]);
      }, 800);
    }
  };

  return (
    <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Phone Mockup */}
      <div className="lg:col-span-2 bg-brand-dark rounded-[3rem] p-3 shadow-2xl relative border-[12px] border-slate-800 aspect-[9/18] flex flex-col overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
        
        <div className="bg-[#075e54] text-white p-4 pt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">{config.name}</h4>
            <p className="text-[10px] text-emerald-100 italic">IA de Agendamento</p>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] scroll-smooth"
          style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
              }`}>
                {msg.image && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-slate-100">
                    <img src={msg.image} className="w-full h-auto" />
                  </div>
                )}
                {msg.text}
                <div className="text-[9px] text-slate-400 text-right mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="bg-white/80 px-4 py-2 rounded-full text-xs w-fit animate-pulse">IA digitando...</div>}
        </div>

        <div className="bg-slate-100 p-3 flex items-center gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite aqui..."
            className="flex-1 px-4 py-2 rounded-full border-none text-sm focus:ring-2 focus:ring-brand-purple"
          />
          <button onClick={handleSend} className="w-10 h-10 bg-[#075e54] text-white rounded-full flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-purple" />
            Modo Promoção
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            A IA está configurada para oferecer promoções quando o cliente perguntar sobre valores ou novos serviços.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Status da Promoção</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${config.promotion.enabled ? 'bg-brand-green animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-xs font-bold text-brand-dark">
                {config.promotion.enabled ? 'ATIVA E MONITORADA' : 'DESATIVADA'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-brand-purple text-white p-6 rounded-3xl shadow-xl shadow-brand-purple/20">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5" />
            <h4 className="font-bold">IA Persuasiva</h4>
          </div>
          <p className="text-xs text-brand-purple/10 bg-white/10 p-3 rounded-xl leading-relaxed">
            Ao detectar indecisão, a IA envia automaticamente a arte promocional salva no treinamento. Isso aumenta a taxa de agendamento em até 35%.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-brand-dark text-sm flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-brand-green" /> Seguro e Direto
          </h4>
          <p className="text-[11px] text-slate-500">
            Diferente de disparos em massa, a IA aborda apenas clientes que já iniciaram uma conversa, evitando bloqueios no WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSimulation;
