
import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  RefreshCcw, 
  Info, 
  Calendar as CalendarIcon, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Copy,
  ChevronRight,
  HelpCircle,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  Video
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ConnectionsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const Connections: React.FC<ConnectionsProps> = ({ isConnected, onConnectionChange }) => {
  const [waLocalStatus, setWaLocalStatus] = useState<'idle' | 'scanning'>(isConnected ? 'idle' : 'idle');
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'setup' | 'connected'>('idle');
  const [calendarId, setCalendarId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  
  // Video Tutorial States
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState('');

  const serviceEmail = "integracao@ia-agendamentos.iam.gserviceaccount.com";

  const handleStartWA = () => {
    setWaLocalStatus('scanning');
  };

  const simulateScanSuccess = () => {
    onConnectionChange(true);
    setWaLocalStatus('idle');
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(serviceEmail);
    alert("E-mail copiado!");
  };

  const testConnection = () => {
    if (!calendarId.includes('@')) {
      alert("Por favor, insira um ID de agenda válido.");
      return;
    }
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setGoogleStatus('connected');
    }, 2000);
  };

  // VEO 3.1 Video Generation Logic
  const generateTutorialVideo = async () => {
    try {
      // 1. Check for API Key selection (Required for Veo)
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Proceeding assuming selection as per race condition rules
      }

      setIsVideoLoading(true);
      setVideoStatus('Iniciando o diretor de cena da IA...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const prompt = "A clean, professional screen recording tutorial animation showing a Google Calendar interface. The cursor moves to settings, clicks on a specific calendar, scrolls to 'Share with specific people', adds an email, and then copies the 'Calendar ID' from the 'Integrate calendar' section. High quality, modern flat design style.";

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setVideoStatus('A IA está renderizando os quadros do tutorial (isso pode levar alguns minutos)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setVideoStatus('Processando movimentos e interface do Google... quase lá!');
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
      
      setIsVideoLoading(false);
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      setIsVideoLoading(false);
      if (error.message?.includes("Requested entity was not found")) {
         // @ts-ignore
         await window.aistudio.openSelectKey();
      } else {
        alert("Ocorreu um erro ao gerar o vídeo. Verifique sua chave de API e faturamento.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Aviso de Protótipo */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">Nota do Desenvolvedor:</p>
          Como este ambiente é uma demonstração segura, o QR Code abaixo é <strong>apenas ilustrativo</strong>. Para testar o fluxo do app, use o botão roxo <span className="font-bold">"Confirmar Leitura (Simular)"</span> que aparecerá após você gerar o código.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* WhatsApp Connection Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${
              isConnected 
              ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
              : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-green animate-pulse' : 'bg-slate-300'}`}></span>
              {isConnected ? 'ATIVO' : 'DESCONECTADO'}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center shadow-inner">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-dark">WhatsApp Business</h3>
              <p className="text-sm text-slate-500">Conexão via QR Code</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {!isConnected && waLocalStatus === 'idle' && (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center mx-auto text-slate-300 group-hover:border-brand-purple/50 group-hover:text-brand-purple transition-all">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="max-w-[200px] mx-auto">
                   <p className="text-[11px] text-slate-400 mb-4">Clique abaixo para gerar o código de demonstração.</p>
                </div>
                <button 
                  onClick={handleStartWA}
                  className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-brand-dark/20 flex items-center gap-2 mx-auto"
                >
                  Gerar QR Code Demo
                </button>
              </div>
            )}

            {!isConnected && waLocalStatus === 'scanning' && (
              <div className="text-center space-y-6">
                <div className="w-48 h-48 bg-white border-4 border-brand-purple/20 p-4 rounded-3xl mx-auto shadow-2xl relative">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=IA_AGENDAMENTOS_DEMO" alt="QR Code" className="w-full h-full grayscale" title="Este código é apenas para fins de demonstração visual." />
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px] rounded-2xl">
                    <div className="w-full h-0.5 bg-brand-purple shadow-[0_0_10px_#B407FF] absolute top-0 animate-[scan_2s_linear_infinite]"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-brand-purple/5 p-4 rounded-2xl border border-brand-purple/10 max-w-[280px] mx-auto">
                    <p className="text-xs text-brand-purple font-bold flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-4 h-4 animate-pulse" />
                      Ação Necessária
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4 italic">
                      "Para testar o sistema agora, clique no botão abaixo para simular que seu celular escaneou o código com sucesso."
                    </p>
                    <button 
                      onClick={simulateScanSuccess}
                      className="w-full bg-brand-purple text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-brand-purple/30 hover:scale-105 transition-all uppercase tracking-widest"
                    >
                      Confirmar Leitura (Simular)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="w-full space-y-6">
                <div className="bg-brand-green/5 p-6 rounded-3xl border border-brand-green/10 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                     <CheckCircle className="w-20 h-20 -mr-6 -mt-6" />
                   </div>
                   <div className="w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-green/30 relative z-10">
                     <CheckCircle className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-brand-dark relative z-10">WhatsApp Demo Ativo</h4>
                   <p className="text-sm text-slate-500 mt-1 relative z-10">Conectado ao simulador de instâncias.</p>
                </div>
                
                <button 
                  onClick={() => {
                    onConnectionChange(false);
                    setWaLocalStatus('idle');
                  }} 
                  className="w-full text-red-500 font-bold text-xs hover:bg-red-50 py-3 rounded-xl transition-all border border-transparent hover:border-red-100 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Desconectar Demonstração
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Google Calendar Connection Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${
              googleStatus === 'connected' 
              ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' 
              : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${googleStatus === 'connected' ? 'bg-brand-blue' : 'bg-slate-300'}`}></span>
              {googleStatus === 'connected' ? 'CONECTADO' : 'AGUARDANDO'}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center shadow-inner">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-dark">Google Calendar</h3>
              <p className="text-sm text-slate-500">Integração via Service Account</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {googleStatus !== 'connected' ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <span className="absolute -left-2 top-4 w-6 h-6 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">1</span>
                  <p className="text-xs font-bold text-brand-dark mb-2">Compartilhe sua Agenda</p>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <code className="text-[10px] text-brand-blue flex-1 truncate">{serviceEmail}</code>
                    <button onClick={copyEmail} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <span className="absolute -left-2 top-4 w-6 h-6 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">2</span>
                  <p className="text-xs font-bold text-brand-dark mb-2">Cole o ID da Agenda</p>
                  <input 
                    type="text" 
                    placeholder="ex: seuemail@gmail.com"
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={testConnection}
                    disabled={isTesting || !calendarId}
                    className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Verificar Conexão <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <button 
                    onClick={generateTutorialVideo}
                    className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-brand-purple/10 hover:text-brand-purple transition-all"
                    title="Ver vídeo explicativo (IA Veo)"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10 space-y-4">
                   <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Agenda Monitorada</p>
                      <p className="text-sm font-bold text-brand-dark">{calendarId}</p>
                    </div>
                    <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setGoogleStatus('idle')}
                  className="w-full text-slate-400 font-bold text-[10px] hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  Remover Integração
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Video Generation Modal/Overlay */}
      {(isVideoLoading || videoUrl) && (
        <div className="fixed inset-0 z-50 bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-purple text-white rounded-xl flex items-center justify-center">
                   <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark">Tutorial: Conectar Google Calendar</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gerado por IA (Veo 3.1)</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsVideoLoading(false);
                  setVideoUrl(null);
                }}
                className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex flex-col items-center justify-center relative">
              {isVideoLoading ? (
                <div className="text-center p-8 space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-brand-purple animate-spin mx-auto opacity-50" />
                    <Zap className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-medium text-sm px-10 leading-relaxed">
                      {videoStatus}
                    </p>
                    <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-brand-purple animate-[progress_20s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Veo 3.1 Fast Preview</p>
                </div>
              ) : videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
              ) : null}
            </div>

            {!isVideoLoading && videoUrl && (
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex items-start gap-3 bg-brand-blue/5 p-4 rounded-2xl border border-brand-blue/10">
                  <Info className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Este vídeo mostra como acessar as configurações da sua agenda no Google, compartilhar com o e-mail de serviço e copiar o ID da agenda necessário para o campo ao lado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Connections;
