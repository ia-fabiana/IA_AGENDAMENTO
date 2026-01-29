
import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Clock, Info, ShieldAlert, Navigation, Save, RotateCcw, CheckCircle2, Tag, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Service, BusinessConfig } from '../types';
import { supabase } from '../services/supabase';

interface TrainingProps {
  config: BusinessConfig;
  setConfig: (config: BusinessConfig) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
}

const Training: React.FC<TrainingProps> = ({ config, setConfig, services, setServices }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addService = () => {
    // Fix: Added required 'tenantId' property from config.id to match the Service interface
    const newService: Service = {
      id: Date.now().toString(),
      tenantId: config.id,
      name: '',
      price: 0,
      duration: 30
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setShowError(false);
    
    try {
      // Salvar tudo em localStorage por enquanto (solução temporária)
      // NOTA: As migrations SQL já foram criadas (migration_add_training_fields.sql)
      // Para persistência no banco, é necessário:
      // 1. Aplicar a migration no Supabase
      // 2. Substituir localStorage por chamadas ao backend/Supabase
      const trainingData = {
        config: config,
        services: services,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(`training_data_${config.id}`, JSON.stringify(trainingData));
      
      // Sucesso!
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setIsSaving(false);
      setShowError(true);
      setErrorMessage(error.message || 'Erro ao salvar alterações');
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({
          ...config,
          promotion: { ...config.promotion, imageData: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Painel de Conhecimento</h2>
          <p className="text-sm text-slate-500">Ajuste como a IA deve se comportar e o que ela sabe sobre seu negócio.</p>
        </div>
        <div className="flex items-center gap-3">
           {showSuccess && (
             <span className="flex items-center gap-1.5 text-brand-green font-bold text-sm animate-in zoom-in duration-300">
               <CheckCircle2 className="w-4 h-4" /> Atualizado!
             </span>
           )}
           {showError && (
             <span className="flex items-center gap-1.5 text-red-600 font-bold text-sm animate-in zoom-in duration-300">
               <AlertCircle className="w-4 h-4" /> {errorMessage}
             </span>
           )}
           <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-brand-dark/20 disabled:opacity-50"
           >
            {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informações Básicas */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-brand-purple">
              <Info className="w-5 h-5" />
              <h3 className="font-bold text-lg">Informações Gerais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Ex: Estúdio Shine"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Horário de Funcionamento</label>
                <input 
                  type="text" 
                  value={config.openingHours}
                  onChange={(e) => setConfig({...config, openingHours: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Ex: Seg a Sex 09h às 18h"
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Endereço Completo
                </label>
                <input 
                  type="text" 
                  value={config.address}
                  onChange={(e) => setConfig({...config, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Rua Exemplo, 123 - Centro"
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> Link Google Maps
                </label>
                <input 
                  type="text" 
                  value={config.mapsLink}
                  onChange={(e) => setConfig({...config, mapsLink: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all text-sm font-mono"
                  placeholder="https://goo.gl/maps/..."
                />
              </div>
            </div>
          </section>

          {/* Promoções Ativas */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Tag className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-purple">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-lg">Promoções e Marketing</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.promotion.enabled}
                  onChange={(e) => setConfig({
                    ...config, 
                    promotion: { ...config.promotion, enabled: e.target.checked }
                  })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple"></div>
                <span className="ms-3 text-xs font-bold text-slate-500 uppercase">Ativar IA Promo</span>
              </label>
            </div>

            <div className={`space-y-6 transition-all duration-300 ${config.promotion.enabled ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Descrição da Oferta</label>
                    <textarea 
                      rows={3}
                      value={config.promotion.description}
                      onChange={(e) => setConfig({
                        ...config, 
                        promotion: { ...config.promotion, description: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-purple outline-none transition-all text-sm resize-none"
                      placeholder="Ex: 20% de desconto na primeira visita..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frase de Abordagem (CTA)</label>
                    <input 
                      type="text" 
                      value={config.promotion.callToAction}
                      onChange={(e) => setConfig({
                        ...config, 
                        promotion: { ...config.promotion, callToAction: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-purple outline-none transition-all text-sm"
                      placeholder="Ex: Gostaria de aproveitar essa oferta?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Arte/Imagem da Promoção</label>
                   <div className="relative group aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-brand-purple/50 transition-colors">
                      {config.promotion.imageData ? (
                        <>
                          <img src={config.promotion.imageData} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-brand-dark px-4 py-2 rounded-lg font-bold text-xs">Trocar Imagem</label>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                          <p className="text-[10px] text-slate-400 font-bold">Clique para upload (JPEG/PNG)</p>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <p className="text-[10px] text-slate-400 italic">Esta imagem será enviada pela IA no WhatsApp quando a promoção for mencionada.</p>
                </div>
              </div>

              <div className="bg-brand-purple/5 p-4 rounded-2xl border border-brand-purple/10 flex items-start gap-3">
                 <Sparkles className="w-4 h-4 text-brand-purple mt-0.5" />
                 <p className="text-[11px] text-brand-purple font-medium leading-relaxed">
                   <strong>Dica da IA:</strong> Com a promoção ativa, eu abordarei novos clientes ou clientes indecisos oferecendo este benefício de forma natural durante a conversa.
                 </p>
              </div>
            </div>
          </section>

          {/* Regras de Agendamento */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-brand-blue">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-lg">Regras e Políticas</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Política de Cancelamento / Reagendamento</label>
                <textarea 
                  rows={3}
                  value={config.cancellationPolicy}
                  onChange={(e) => setConfig({...config, cancellationPolicy: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm resize-none"
                  placeholder="Quais as regras para cancelar?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Antecedência Mínima (Horas)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={config.minAdvanceTime}
                    onChange={(e) => setConfig({...config, minAdvanceTime: Number(e.target.value)})}
                    className="w-32 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Mínimo de <span className="font-bold text-brand-dark">{config.minAdvanceTime} horas</span> de antecedência.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SERVIÇOS */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-brand-green">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold">Serviços</h3>
              </div>
              <button 
                onClick={addService}
                className="w-8 h-8 bg-brand-green text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-brand-green/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
              {services.map((service) => (
                <div key={service.id} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-green/30 transition-all relative">
                  <button 
                    onClick={() => removeService(service.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={service.name}
                      onChange={(e) => updateService(service.id, 'name', e.target.value)}
                      placeholder="Nome do serviço"
                      className="w-full bg-transparent font-bold text-brand-dark focus:outline-none placeholder:text-slate-300 text-sm"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Preço (R$)</label>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400">R$</span>
                          <input 
                            type="number" 
                            value={service.price}
                            onChange={(e) => updateService(service.id, 'price', Number(e.target.value))}
                            className="w-full bg-transparent text-xs font-bold text-brand-dark outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Duração (Min)</label>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <input 
                            type="number" 
                            value={service.duration}
                            onChange={(e) => updateService(service.id, 'duration', Number(e.target.value))}
                            className="w-full bg-transparent text-xs font-bold text-brand-dark outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Training;
