
import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  UserCircle,
  Gem,
  Lock,
  ChevronDown,
  Database,
  Info
} from 'lucide-react';
import { AIConfig, AIProvider, UserCredits } from '../types';

interface AgentsProps {
  config: AIConfig;
  onSave: (config: AIConfig) => void;
  credits: UserCredits;
}

// Logotipo Oficial da OpenAI em SVG de alta fidelidade
const OpenAILogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-3.9412-3.1311 6.0145 6.0145 0 0 0-5.1151.9863 6.0151 6.0151 0 0 0-4.693-2.3197 6.047 6.047 0 0 0-5.1206 2.8105 6.0141 6.0141 0 0 0-2.3243 4.694 6.0151 6.0151 0 0 0 .5153 4.9066 6.0462 6.0462 0 0 0 3.9412 3.1311 6.0145 6.0145 0 0 0 5.1151-.9863 6.0151 6.0151 0 0 0 4.693 2.3197 6.047 6.047 0 0 0 5.1206-2.8105 6.0141 6.0141 0 0 0 2.3243-4.694Zm-10.2819 11.4116a4.5161 4.5161 0 0 1-2.2516-.6046l.0147-.0084 4.5804-2.6445a.6318.6318 0 0 0 .3173-.5482v-6.4716l2.0628 1.1912a.0353.0353 0 0 1 .0176.0286v5.3344a4.5262 4.5262 0 0 1-4.7412 4.7231Zm-8.4721-3.6922a4.5147 4.5147 0 0 1-1.0963-2.0543l.0147.0084 4.5804 2.6445a.6318.6318 0 0 0 .6347 0l5.6041-3.2356v2.3824a.0353.0353 0 0 1-.0153.0315l-4.6198 2.6672a4.5262 4.5262 0 0 1-5.1025-.4441Zm-1.7451-8.5255a4.5147 4.5147 0 0 1 1.1553-2.0223l-.0147.0084 4.5804 2.6445a.6318.6318 0 0 0 .3173.0818h0c.2186 0 .428-.1124.5482-.3173l3.2356-5.6041h2.3824a.0353.0353 0 0 1 .0315.0153l2.6672 4.6198a4.5262 4.5262 0 0 1-.4441 5.1025l-14.4576-8.3486Zm13.0645-1.1197-4.5804-2.6445a.6318.6318 0 0 0-.6347 0l-5.6041 3.2356v-2.3824a.0353.0353 0 0 1 .0153-.0315l4.6198-2.6672a4.5262 4.5262 0 0 1 7.1245 2.1124l-1.011 2.3824v-.0049Zm2.2516 6.6033-5.6041 3.2356a.6318.6318 0 0 0-.3173.5482v6.4716l-2.0628-1.1912a.0353.0353 0 0 1-.0176-.0286v-5.3344a4.5262 4.5262 0 0 1 4.7412-4.7231l3.2605 1.0219Zm-2.5859-4.7573-2.0628-1.1912a.0353.0353 0 0 1-.0176-.0286V5.3344a4.5262 4.5262 0 0 1 5.1025-4.4441l-3.0221 5.6639Zm-4.5298 2.6148 2.0628 1.1912-2.0628 1.1912-2.0628-1.1912 2.0628-1.1912Z" />
  </svg>
);

const Agents: React.FC<AgentsProps> = ({ config, onSave, credits }) => {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const openaiModels = [
    { id: 'gpt-4o', label: 'GPT-4o (Omni - Máxima Potência)', premium: true },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Velocidade e Custo)', premium: false }
  ];

  const geminiModels = [
    { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Avançado)', premium: true },
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Alta Performance)', premium: false }
  ];

  const handleProviderSelect = (provider: AIProvider) => {
    const defaultModel = provider === 'openai' ? 'gpt-4o-mini' : 'gemini-3-flash-preview';
    setLocalConfig({
      ...localConfig,
      provider,
      model: defaultModel
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave(localConfig);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-purple" /> Cérebro da Operação
          </h2>
          <p className="text-sm text-slate-500">Configure qual motor de Inteligência Artificial processará suas conversas.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 flex items-center gap-2"
        >
          {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {showSuccess ? 'Sincronizado!' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="font-bold text-lg text-brand-dark flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-purple" /> Escolha o Provedor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OpenAI Selector */}
              <button 
                onClick={() => handleProviderSelect('openai')} 
                className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group ${localConfig.provider === 'openai' ? 'border-brand-purple bg-brand-purple/5 shadow-lg shadow-brand-purple/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
              >
                {localConfig.provider === 'openai' && <div className="absolute top-4 right-4 bg-brand-purple text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                <div className={`p-4 rounded-2xl ${localConfig.provider === 'openai' ? 'bg-brand-dark text-white' : 'bg-white text-slate-400 border border-slate-200 group-hover:border-brand-purple/30 group-hover:text-brand-purple'}`}>
                  <OpenAILogo className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">OpenAI</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lógica e Raciocínio</p>
                </div>
              </button>

              {/* Gemini Selector */}
              <button 
                onClick={() => handleProviderSelect('gemini')} 
                className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group ${localConfig.provider === 'gemini' ? 'border-brand-purple bg-brand-purple/5 shadow-lg shadow-brand-purple/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
              >
                {localConfig.provider === 'gemini' && <div className="absolute top-4 right-4 bg-brand-purple text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                <div className={`p-4 rounded-2xl ${localConfig.provider === 'gemini' ? 'bg-brand-purple text-white' : 'bg-white text-slate-400 border border-slate-200 group-hover:border-brand-purple/30 group-hover:text-brand-purple'}`}>
                  <Sparkles className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Google Gemini</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Velocidade e Contexto</p>
                </div>
              </button>
            </div>

            <div className="pt-4 space-y-3">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Versão do Modelo (Configuração SaaS)</label>
               <div className="relative">
                  <select 
                    value={localConfig.model}
                    onChange={(e) => setLocalConfig({...localConfig, model: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark appearance-none outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                  >
                    {(localConfig.provider === 'openai' ? openaiModels : geminiModels).map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
               </div>
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                    A infraestrutura do seu bot utiliza nossos tokens corporativos. Cada mensagem enviada será deduzida do seu saldo de créditos da plataforma.
                  </p>
               </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="font-bold text-lg text-brand-dark flex items-center gap-2"><UserCircle className="w-5 h-5 text-brand-purple" /> Identidade Visual</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome da Assistente Virtual</label>
                <input 
                  type="text" 
                  value={localConfig.name} 
                  onChange={(e) => setLocalConfig({...localConfig, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-purple transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Instruções de Personalidade (System Prompt)</label>
                <textarea 
                  value={localConfig.behavior} 
                  onChange={(e) => setLocalConfig({...localConfig, behavior: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-600 min-h-[250px] outline-none resize-none focus:bg-white focus:ring-2 focus:ring-brand-purple transition-all" 
                  placeholder="Defina como o bot deve agir..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-brand-dark p-8 rounded-[2.5rem] text-white shadow-xl space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Database className="w-32 h-32" />
             </div>
             <div className="flex items-center gap-3 relative z-10">
                <ShieldCheck className="w-6 h-6 text-brand-purple" />
                <h3 className="font-bold text-lg">Proteção Enterprise</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed relative z-10">
               Suas comunicações são processadas através da nossa rede segura. Não armazenamos dados sensíveis fora do seu ambiente isolado no Supabase.
             </p>
             <div className="pt-4 space-y-4 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Saldo de Mensagens</span>
                   <span className="text-brand-green font-bold text-lg">{credits.balance} <span className="text-[10px]">Msgs</span></span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center gap-2">
                   <Lock className="w-3 h-3 text-brand-purple" />
                   <span className="text-[9px] font-bold uppercase tracking-widest">Gateway Ativo</span>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Agents;
