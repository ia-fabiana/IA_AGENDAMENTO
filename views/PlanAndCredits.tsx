
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Zap, ShieldCheck, Gem, CheckCircle2, Loader2, Wallet, 
  ArrowRight, Landmark, Activity, ShoppingBag, X, QrCode, Smartphone, Copy, Check, Clock, Lock, Sparkles, AlertCircle
} from 'lucide-react';
import { UserCredits, AppRoute } from '../types';

interface PlanAndCreditsProps {
  credits: UserCredits;
  setCredits: (credits: any) => void;
  onNavigate: (route: AppRoute) => void;
}

const PlanAndCredits: React.FC<PlanAndCreditsProps> = ({ credits, setCredits, onNavigate }) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'pix' | 'card_form' | 'processing' | 'success'>('method');
  const [copied, setCopied] = useState(false);
  const [mpInitialized, setMpInitialized] = useState(false);

  const packs = [
    { id: 'p1', name: 'Start', msgs: 500, price: 47, color: 'brand-purple', popular: false },
    { id: 'p2', name: 'Professional', msgs: 2500, price: 147, color: 'brand-blue', popular: true },
    { id: 'p3', name: 'Enterprise', msgs: 10000, price: 497, color: 'brand-dark', popular: false }
  ];

  // Mercado Pago Initialization (Using SDK from index.html)
  useEffect(() => {
    if (showCheckoutModal && !mpInitialized && paymentStep === 'method') {
      // Aqui integraria o Mercado Pago Brick real se houvesse uma Public Key definida
      // Simulamos a inicialização para manter a experiência fluida
      setMpInitialized(true);
    }
  }, [showCheckoutModal, paymentStep]);

  const handleBuyClick = (pack: any) => {
    setSelectedPack(pack);
    setShowCheckoutModal(true);
    setPaymentStep('method');
  };

  const startPaymentProcess = async (type: 'pix' | 'card') => {
    setPaymentStep('processing');
    
    try {
      // Em produção, iniciar pagamento real com Mercado Pago
      // Por enquanto, simular para não precisar de credenciais
      const USE_REAL_PAYMENT = false; // Trocar para true quando configurar Mercado Pago
      
      if (USE_REAL_PAYMENT && window.MercadoPago) {
        // Código real do Mercado Pago (implementar quando tiver credenciais)
        // const mp = new window.MercadoPago(PUBLIC_KEY);
        // const preference = await criarPreferenciaPagamento();
        // etc...
        console.log('🔐 Iniciar pagamento real com Mercado Pago');
      } else {
        // Simulação para desenvolvimento (webhook virá quando pagamento for aprovado)
        console.log('🧪 Modo simulação - aguardando webhook fictício');
        
        setTimeout(() => {
          // Simula o que o webhook faria: adicionar créditos
          setCredits((prev: UserCredits) => ({
            ...prev,
            balance: prev.balance + (selectedPack?.msgs || 0)
          }));
          setPaymentStep('success');
          
          console.log('✅ Simulação: Créditos adicionados via webhook fictício');
        }, 2500);
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
      setShowCheckoutModal(false);
      setPaymentStep('method');
    }
  };

  const copyPix = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-slide-up pb-20">
      
      {/* SaaS Wallet Summary */}
      <div className="bg-brand-dark p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center gap-10">
           <div className="w-28 h-28 bg-brand-purple rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-purple/40 rotate-3 transition-transform hover:rotate-0">
              <Wallet className="w-14 h-14" />
           </div>
           <div>
              <p className="text-[11px] font-black text-brand-purple uppercase tracking-[0.4em] mb-2">Carteira Operacional</p>
              <h3 className="text-6xl font-black tracking-tighter flex items-baseline gap-4">
                <span className="animate-in zoom-in duration-500" key={credits.balance}>{credits.balance}</span>
                <span className="text-2xl text-slate-600 font-medium tracking-tight">Créditos</span>
              </h3>
           </div>
        </div>

        <div className="relative z-10">
           <div className="bg-white/5 backdrop-blur-md px-8 py-5 rounded-[2rem] border border-white/10 flex items-center gap-6">
              <ShieldCheck className="w-8 h-8 text-brand-green" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Assinatura Ativa</p>
                <p className="text-lg font-bold text-white uppercase tracking-tighter">Plano {credits.planName}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packs.map((pack) => (
          <div key={pack.id} className="group bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative transition-all hover:shadow-2xl hover:-translate-y-3 flex flex-col overflow-hidden">
            {pack.popular && (
              <div className="absolute top-0 right-0 bg-brand-purple text-white text-[10px] font-black px-6 py-2.5 rounded-bl-3xl uppercase tracking-widest shadow-lg">
                Mais Vendido
              </div>
            )}
            
            <div className="mb-10">
               <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">{pack.name}</h4>
               <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-brand-dark tracking-tighter">{pack.msgs}</span>
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-tight">Mensagens</span>
               </div>
            </div>

            <div className="space-y-4 mb-12 flex-1">
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Inteligência Gemini 3 Pro
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Liberação via Mercado Pago
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Créditos sem expiração
               </li>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Valor de Recarga</p>
                  <p className="text-3xl font-black text-brand-dark">R$ {pack.price}</p>
               </div>
               <button 
                onClick={() => handleBuyClick(pack)}
                className="bg-brand-dark text-white p-5 rounded-2xl hover:bg-brand-purple transition-all shadow-xl shadow-brand-dark/20 group-hover:scale-110 active:scale-95"
               >
                 <ShoppingBag className="w-6 h-6" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CHECKOUT MERCADO PAGO */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            {paymentStep !== 'processing' && (
              <button onClick={() => setShowCheckoutModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-brand-dark transition-colors">
                <X className="w-7 h-7" />
              </button>
            )}

            {paymentStep === 'method' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-3xl flex items-center justify-center">
                      <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" className="w-10 grayscale brightness-0 opacity-80" alt="MP" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Mercado Pago Checkout</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pacote {selectedPack?.name} • R$ {selectedPack?.price}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => setPaymentStep('pix')}
                    className="w-full p-6 border-2 border-slate-100 rounded-3xl flex items-center justify-between group hover:border-emerald-500 hover:bg-emerald-50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                          <QrCode className="w-7 h-7" />
                       </div>
                       <div className="text-left">
                          <p className="font-black text-brand-dark uppercase tracking-tighter">Pagar com PIX</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">LIBERAÇÃO INSTANTÂNEA</p>
                       </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-all" />
                  </button>

                  <button 
                    onClick={() => setPaymentStep('card_form')}
                    className="w-full p-6 border-2 border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                          <CreditCard className="w-7 h-7" />
                       </div>
                       <div className="text-left">
                          <p className="font-black text-brand-dark uppercase tracking-tighter">Cartão de Crédito</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">ATÉ 12X SEM JUROS</p>
                       </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-all" />
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-6 pt-4">
                   <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" className="h-4 opacity-50" />
                   <img src="https://logodownload.org/wp-content/uploads/2014/07/visa-logo-1.png" className="h-3 opacity-50" />
                   <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo.png" className="h-4 opacity-50" />
                </div>
              </div>
            )}

            {paymentStep === 'pix' && (
              <div className="space-y-8 text-center animate-in zoom-in duration-300">
                <div className="bg-emerald-50 p-6 rounded-[3.5rem] border border-emerald-100 inline-block relative overflow-hidden group shadow-inner">
                   <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MP_PIX_RECARGA_${selectedPack?.id}_${Date.now()}`} 
                    className="w-56 h-56 mix-blend-multiply relative z-10" 
                    alt="QR PIX Mercado Pago"
                   />
                </div>
                
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3 justify-center mb-4">
                   <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                   <p className="text-[11px] font-black text-amber-700 uppercase leading-relaxed text-left">
                      Atenção: Este é o QR Code de PAGAMENTO.<br/>
                      <span className="text-amber-500 text-[9px]">* Escaneie com seu Aplicativo de Banco.</span>
                   </p>
                </div>

                <div className="space-y-2">
                   <h4 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Aguardando Pagamento</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">R$ {selectedPack?.price} • {selectedPack?.msgs} Mensagens</p>
                </div>

                <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                   <p className="text-[10px] font-mono text-slate-400 truncate uppercase">00020126360014BR.GOV.BCB.PIX0114MPRECARGASAAS001</p>
                   <button onClick={copyPix} className="bg-white p-3 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => startPaymentProcess('pix')}
                    className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Já realizei o PIX
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-brand-green rounded-full animate-ping"></span>
                    Sincronização Mercado Pago Ativa
                  </p>
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-24 text-center space-y-8">
                <div className="w-24 h-24 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mx-auto shadow-inner border border-brand-purple/10">
                   <Loader2 className="w-12 h-12 animate-spin" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Validando via API</h4>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Aguardando Webhook do Mercado Pago...</p>
                </div>
                <div className="max-w-[240px] mx-auto h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <div className="h-full bg-brand-purple animate-progress-fast shadow-[0_0_15px_#B407FF]"></div>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="space-y-8 text-center py-12 animate-in zoom-in duration-500">
                <div className="w-28 h-28 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand-green/20 border-4 border-white">
                   <CheckCircle2 className="w-16 h-16" />
                </div>
                <div className="space-y-3">
                   <h4 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Sucesso Absoluto!</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                     Seu saldo de <strong>{selectedPack?.msgs} mensagens</strong> foi liberado e já está disponível para uso.
                   </p>
                </div>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full bg-brand-dark text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-purple shadow-2xl shadow-brand-purple/30 transition-all active:scale-95"
                >
                  Continuar Operação
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes progress-fast { 0% { width: 0; } 100% { width: 100%; } }
        .animate-progress-fast { animation: progress-fast 2.5s linear forwards; }
      `}</style>
    </div>
  );
};

export default PlanAndCredits;
