
import React from 'react';
import { Database, Server, Cpu, Globe, Lock, Zap, Calendar as CalendarIcon, Smartphone } from 'lucide-react';

const Architecture: React.FC = () => {
  return (
    <div className="space-y-12 pb-10">
      <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-3">
          <Server className="text-brand-purple" /> Conectividade Simplificada
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-brand-dark">Google Calendar (Service Account)</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Em vez de usar o fluxo OAuth tradicional (que exige aprovação do Google e telas de aviso), utilizamos uma <strong>Conta de Serviço</strong>. 
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2">
              <li className="flex gap-2">
                <span className="text-brand-blue font-bold">•</span>
                O app gera um e-mail de identidade única.
              </li>
              <li className="flex gap-2">
                <span className="text-brand-blue font-bold">•</span>
                Você compartilha sua agenda com esse e-mail (como se fosse um funcionário).
              </li>
              <li className="flex gap-2">
                <span className="text-brand-blue font-bold">•</span>
                A IA ganha acesso instantâneo sem expor sua senha principal.
              </li>
            </ul>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-brand-dark">WhatsApp (Instance Bridge)</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Utilizamos um sistema de <strong>Instâncias Dinâmicas</strong> via QR Code. O app emula um "WhatsApp Web" de alta performance.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2">
              <li className="flex gap-2">
                <span className="text-brand-green font-bold">•</span>
                Zero necessidade de aprovação da Meta (WhatsApp Oficial API).
              </li>
              <li className="flex gap-2">
                <span className="text-brand-green font-bold">•</span>
                Suporte a envio de áudio, localização e arquivos.
              </li>
              <li className="flex gap-2">
                <span className="text-brand-green font-bold">•</span>
                Criptografia ponta-a-ponta mantida entre o servidor e o cliente.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="font-bold text-brand-dark mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-blue" /> Segurança e LGPD
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-brand-dark text-brand-purple rounded-2xl font-mono text-[10px] overflow-x-auto">
              <p className="font-bold text-white mb-2">// Verificação de Segurança Google</p>
              {`{
  "auth_method": "ServiceAccount_v3",
  "scopes": ["calendar.events", "calendar.readonly"],
  "encryption": "AES-256-GCM",
  "data_retention": "0_days (Stateless)"
}`}
            </div>
            <p className="text-xs text-slate-500 italic">
              * A "Stateless Architecture" garante que se a conexão for removida no painel, todos os tokens temporários são destruídos imediatamente.
            </p>
          </div>
        </section>

        <section className="bg-brand-dark p-8 rounded-[2rem] text-white shadow-xl shadow-brand-dark/20">
          <h3 className="font-bold mb-6 flex items-center gap-2 text-brand-purple">
            <Zap className="w-5 h-5" /> Por que esta é a melhor forma?
          </h3>
          <ul className="space-y-4 text-xs text-slate-300">
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold text-white">1</div>
              <p><strong>Configuração em Segundos:</strong> O usuário não precisa ser técnico.</p>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold text-white">2</div>
              <p><strong>Estabilidade:</strong> Contas de serviço são mais estáveis que logins de usuários que expiram.</p>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold text-white">3</div>
              <p><strong>Custo Zero:</strong> Não exige contas Enterprise pagas do Google Workspace para funcionar.</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Architecture;
