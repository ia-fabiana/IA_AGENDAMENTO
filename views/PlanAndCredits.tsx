
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Zap, Check, ShieldCheck, Gem, CheckCircle2, Loader2, Wallet, 
  ArrowRight, Landmark, ExternalLink, Activity
} from 'lucide-react';
import { UserCredits, AppRoute } from '../types';

interface PlanAndCreditsProps {
  credits: UserCredits;
  setCredits: (credits: UserCredits) => void;
  onNavigate: (route: AppRoute) => void;
}

const PlanAndCredits: React.FC<PlanAndCreditsProps> = ({ credits, setCredits, onNavigate }) => {
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  
  // Public Key fornecida pelo usuário
  const MP_PUBLIC_KEY = 'APP_USR-04ba2a1b-298b-4c0c-a870-5ad8a3a37014';
  const EDGE_FUNCTION_URL = 'https://ztfnnzclwvycpbapbbhb.supabase.co/functions/v1/create-payment';

  const packs = [
    { id: 'p1', name: 'Start', msgs: 500, price: 47.00, color: 'brand-purple' },
    { id: 'p2', name: 'Professional', msgs: 2500, price: 147.00, bestValue: true, color: 'brand-blue' },
    { id: 'p3', name: 'Enterprise', msgs: 10000, price: 497.00, color: 'brand-dark' }
  ];

  const handlePurchase = async (pack: any) => {
    setLoadingPack(pack.id);
    
    try {
      // Chamada para a Edge Function de Pagamento
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack.id,
          amount: pack.price,
          description: `Recarga SaaS: ${pack.msgs} Créditos IA`,
          // O Access Token é passado no header ou tratado internamente na Edge Function
          // Aqui simulamos o envio se a function exigir, mas idealmente fica nas ENV do Supabase
          meta: { tenantId: 'shine-123' }
        })
      });

      const data = await response.json();
      
      if (data.init_point) {
        // Redireciona para o checkout real do Mercado Pago
        window.location.href = data.init_point;
      } else {
        throw new Error("Falha ao gerar preferência de pagamento");
      }
    } catch (error) {
      console.error("Payment Gateway Error:", error);
      alert("Houve um erro ao processar o checkout. Por favor, tente novamente em instantes.");
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-slide-up pb-20">
      
      {/* Wallet Status Header */}
      <div className="bg-brand-dark p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center gap-8">
           <div className="w-24 h-24 bg-brand-purple rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-purple/40 rotate-6 transition-transform hover:rotate-0">
              <Wallet className="w-12 h-12" />
           </div>
           <div>
              <p className="text-[10px] font-black text-brand-purple uppercase tracking-[0.4em] mb-2">Central de Créditos SaaS</p>
              <h3 className="text-5xl font-black tracking-tighter">
                {credits.balance} <span className="text-xl text-slate-500 font-medium">Msgs Disponíveis</span>
              </h3>
           </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
           <div className="bg-white/5 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/10 flex items-center justify-between gap-6">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Status do Ciclo</p>
                <p className="text-sm font-bold text-brand-green flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Plano {credits.planName} Ativo
                </p>
              </div>
              <div className="w-[1px] h-8 bg-white/10"></div>
              <button className="text-[10px] font-black text-brand-purple uppercase hover:text-white transition-colors">Ver Detalhes</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packs.map((pack) => (
          <div key={pack.id} className="group bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative transition-all hover:shadow-2xl hover:-translate-y-3 flex flex-col overflow-hidden">
            {pack.bestValue && (
              <div className="absolute top-0 right-0 bg-brand-purple text-white text-[9px] font-black px-5 py-2 rounded-bl-3xl uppercase tracking-widest shadow-lg">
                Mais Popular
              </div>
            )}
            
            <div className="mb-10">
               <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{pack.name}</h4>
               <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-brand-dark tracking-tighter">{pack.msgs}</span>
                  <span className="text-slate-400 font-bold text-sm uppercase">Tokens IA</span>
               </div>
            </div>

            <div className="space-y-4 mb-12 flex-1">
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Inteligência Gemini 3 Pro
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Function Calling Enterprise
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Suporte Evolution API
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <CheckCircle2 className="w-5 h-5 text-brand-green" /> Sem expiração de saldo
               </li>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Valor Único</p>
                  <p className="text-3xl font-black text-brand-dark">R$ {pack.price.toFixed(0)}</p>
               </div>
               <button 
                onClick={() => handlePurchase(pack)}
                disabled={!!loadingPack}
                className="bg-brand-dark text-white p-5 rounded-2xl hover:bg-brand-purple transition-all shadow-xl shadow-brand-dark/20 group-hover:scale-110 active:scale-95 disabled:opacity-50"
               >
                 {loadingPack === pack.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance & Security Footer */}
      <div className="bg-slate-100/50 p-10 rounded-[3rem] border border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
               <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" className="h-5 grayscale hover:grayscale-0 transition-all" alt="Mercado Pago" />
            </div>
            <div>
               <p className="text-xs font-bold text-brand-dark mb-1 flex items-center gap-2">
                 <Landmark className="w-4 h-4 text-brand-purple" /> Gateway Mercado Pago Ativo
               </p>
               <p className="text-[10px] text-slate-500 font-medium">Ambiente de produção certificado PCI-DSS com criptografia de 256 bits.</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-white px-6 py-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-brand-dark hover:text-white transition-all">Relatório de Transações</button>
            <div className="h-10 w-[1px] bg-slate-300 hidden md:block"></div>
            <Activity className="w-6 h-6 text-brand-purple animate-pulse" />
         </div>
      </div>
    </div>
  );
};

export default PlanAndCredits;
