
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Zap, ShieldCheck, Gem, CheckCircle2, Loader2, Wallet, 
  ArrowRight, Landmark, Activity, ShoppingBag, X, QrCode, Smartphone, Copy, Check, Clock, Lock, Sparkles, AlertCircle
} from 'lucide-react';
import { UserCredits, AppRoute } from '../types';
import { mercadopagoService } from '../services/mercadopagoService';

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
  const [paymentData, setPaymentData] = useState<any>(null);

  const packs = [
    { id: 'p1', name: 'Start', msgs: 500, price: 47, color: 'brand-purple', popular: false },
    { id: 'p2', name: 'Professional', msgs: 2500, price: 147, color: 'brand-blue', popular: true },
    { id: 'p3', name: 'Enterprise', msgs: 10000, price: 497, color: 'brand-dark', popular: false }
  ];

  const handleBuyClick = async (pack: any) => {
    setSelectedPack(pack);
    setShowCheckoutModal(true);
    setPaymentStep('processing');
    
    // CHAMADA REAL AO MERCADO PAGO
    const preference = await mercadopagoService.createPreference(pack);
    setPaymentData(preference);
    setPaymentStep('method');
  };

  const startPaymentProcess = (type: 'pix' | 'card') => {
    setPaymentStep('processing');
    
    // Simula a confirmação do Webhook do servidor
    setTimeout(() => {
      setCredits((prev: UserCredits) => ({
        ...prev,
        balance: prev.balance + (selectedPack?.msgs || 0)
      }));
      setPaymentStep('success');
    }, 2000);
  };

  const copyPix = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      <div className="bg-brand-dark p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-10">
           <div className="w-28 h-28 bg-brand-purple rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-purple/40">
              <Wallet className="w-14 h-14" />
           </div>
           <div>
              <p className="text-[11px] font-black text-brand-purple uppercase tracking-[0.4em] mb-2">Carteira Operacional</p>
              <h3 className="text-6xl font-black tracking-tighter flex items-baseline gap-4">
                <span className="animate-in zoom-in" key={credits.balance}>{credits.balance}</span>
                <span className="text-2xl text-slate-600 font-medium tracking-tight">Créditos</span>
              </h3>
           </div>
        </div>
        <div className="relative z-10 bg-white/5 backdrop-blur-md px-8 py-5 rounded-[2rem] border border-white/10 flex items-center gap-6">
           <ShieldCheck className="w-8 h-8 text-brand-green" />
           <div>
             <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">SaaS Ativo</p>
             <p className="text-lg font-bold text-white uppercase tracking-tighter">Plano {credits.planName}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative transition-all hover:shadow-2xl hover:-translate-y-3 flex flex-col">
            <div className="mb-10">
               <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">{pack.name}</h4>
               <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-brand-dark tracking-tighter">{pack.msgs}</span>
                  <span className="text-slate-400 font-bold text-sm">Mensagens</span>
               </div>
            </div>
            <div className="space-y-4 mb-12 flex-1">
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600"><CheckCircle2 className="w-5 h-5 text-brand-green" /> Gemini 3 Flash</li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600"><CheckCircle2 className="w-5 h-5 text-brand-green" /> Checkout Transparente</li>
            </div>
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
               <p className="text-3xl font-black text-brand-dark">R$ {pack.price}</p>
               <button onClick={() => handleBuyClick(pack)} className="bg-brand-dark text-white p-5 rounded-2xl hover:bg-brand-purple transition-all shadow-xl">
                 <ShoppingBag className="w-6 h-6" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            {paymentStep !== 'processing' && (
              <button onClick={() => setShowCheckoutModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-brand-dark">
                <X className="w-7 h-7" />
              </button>
            )}

            {paymentStep === 'method' && (
              <div className="space-y-8">
                <div className="text-center">
                   <h3 className="text-2xl font-black text-brand-dark uppercase">Pagamento Seguro</h3>
                   <p className="text-xs text-slate-500 font-bold mt-2">Escolha como prefere pagar sua recarga</p>
                </div>

                <div className="space-y-4">
                  <button onClick={() => setPaymentStep('pix')} className="w-full p-6 border-2 border-slate-100 rounded-3xl flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <div className="flex items-center gap-4">
                       <QrCode className="w-8 h-8 text-emerald-500" />
                       <div className="text-left">
                          <p className="font-black text-brand-dark">PIX (Instantâneo)</p>
                          <p className="text-[10px] text-slate-400 font-bold">CRÉDITO NA HORA</p>
                       </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </button>

                  <button onClick={() => setPaymentStep('card_form')} className="w-full p-6 border-2 border-slate-100 rounded-3xl flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <div className="flex items-center gap-4">
                       <CreditCard className="w-8 h-8 text-blue-500" />
                       <div className="text-left">
                          <p className="font-black text-brand-dark">Cartão de Crédito</p>
                          <p className="text-[10px] text-slate-400 font-bold">EM ATÉ 12X</p>
                       </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'pix' && (
              <div className="text-center space-y-8">
                <div className="bg-slate-50 p-6 rounded-[3.5rem] border border-slate-100 inline-block">
                   <img src={`data:image/png;base64,${paymentData?.qr_code_base64}`} className="w-56 h-56" />
                </div>
                <div>
                   <h4 className="text-xl font-black uppercase">Escaneie o QR Code</h4>
                   <p className="text-xs text-slate-400 font-bold mt-1">R$ {selectedPack?.price} • {selectedPack?.msgs} Mensagens</p>
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-between">
                   <p className="text-[10px] font-mono text-slate-400 truncate">{paymentData?.qr_code}</p>
                   <button onClick={copyPix} className="bg-white p-2 rounded-lg shadow-sm">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
                <button onClick={() => startPaymentProcess('pix')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                    Já realizei o pagamento
                </button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-24 text-center space-y-8">
                <Loader2 className="w-16 h-16 animate-spin text-brand-purple mx-auto" />
                <h4 className="text-xl font-black uppercase tracking-widest">Processando...</h4>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="space-y-8 text-center py-12">
                <div className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle2 className="w-16 h-16" />
                </div>
                <h4 className="text-3xl font-black uppercase">Recarga Concluída!</h4>
                <button onClick={() => setShowCheckoutModal(false)} className="w-full bg-brand-dark text-white py-6 rounded-3xl font-black uppercase text-xs">
                  Voltar ao Painel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanAndCredits;
