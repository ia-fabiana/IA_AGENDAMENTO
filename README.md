<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# IA.AGENDAMENTOS - Gestão Inteligente

Sistema inteligente de gerenciamento de agendamentos com integração WhatsApp, Google Calendar e IA (Gemini) para atendimento automatizado.

## 🚀 Recursos

- **Agendamento Inteligente**: IA que compreende conversas naturais e agenda automaticamente
- **Multi-tenant**: Suporte para múltiplos clientes/salões em uma única plataforma
- **WhatsApp Integration**: Integração via Evolution API para comunicação direta
- **Google Calendar**: Sincronização automática de agendamentos
- **Painel de Treino**: Configure o comportamento da IA e informações do negócio
- **Controle de Créditos**: Sistema de planos (Bronze, Prata, Ouro) com controle de consumo
- **Admin Dashboard**: Visão global de todos os tenants e métricas

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- Conta **Supabase** (banco de dados)
- Instância **Evolution API** (WhatsApp)
- Credenciais **Google Cloud** (Calendar API)

## 🏃 Início Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/ia-fabiana/IA_AGENDAMENTO.git
cd IA_AGENDAMENTO
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Ambiente

Copie `.env.example` para `.env` e preencha as credenciais:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase, Evolution API e Google OAuth.

**📖 Guia completo**: Veja [SETUP.md](./SETUP.md) para instruções detalhadas.

### 4. Execute as Migrações

Execute os scripts SQL no painel do Supabase ou via script:

```bash
export SUPABASE_SERVICE_KEY=sua_chave_aqui
node run_migration.js
```

### 5. Inicie a Aplicação

**Backend:**
```bash
npm run server
```

**Frontend (desenvolvimento):**
```bash
npm run dev
```

Acesse: http://localhost:5173

## 🛠️ Tecnologias

- **Frontend**: React 19.2.3, TypeScript 5.8.2, Vite 6.2.0
- **Backend**: Node.js 22, Express 4.18.2
- **Banco de Dados**: Supabase (PostgreSQL)
- **IA**: Google Gemini API
- **Integrações**: Evolution API (WhatsApp), Google Calendar
- **Deploy**: Google Cloud Run, Docker

## 📚 Documentação

- [🔧 Guia de Configuração](./SETUP.md) - Setup completo (local e produção)
- [📅 Google Calendar Setup](./GOOGLE_CALENDAR_SETUP.md) - Configurar OAuth2
- [👨‍💻 Copilot Instructions](./.github/copilot-instructions.md) - Guia para desenvolvedores

## 🏗️ Estrutura do Projeto

```
/
├── services/          # Backend services (TypeScript)
│   ├── aiService.ts          # Integração Gemini AI
│   ├── calendarService.ts    # Google Calendar
│   ├── evolutionService.ts   # WhatsApp/Evolution API
│   ├── trainingService.ts    # Persistência de treinamento
│   └── supabase.ts          # Cliente Supabase
├── views/             # Componentes React principais
│   ├── Dashboard.tsx
│   ├── Training.tsx
│   ├── Connections.tsx
│   ├── Appointments.tsx
│   └── AdminDashboard.tsx
├── migrations/        # Migrações SQL
├── server.js          # Servidor Express
└── App.tsx           # Aplicação React principal
```

## 🔐 Segurança

⚠️ **Importante**:
- Nunca commite credenciais no repositório
- Use variáveis de ambiente para todas as chaves
- Configure Secret Manager em produção
- Mantenha `SUPABASE_SERVICE_KEY` segura

## 🚢 Deploy

### Google Cloud Run

O projeto está configurado para deploy automático via Cloud Build:

```bash
# Build e deploy manual
npm run build
docker build -t gcr.io/SEU_PROJETO/ia-agendamentos .
gcloud run deploy ia-agendamentos --image gcr.io/SEU_PROJETO/ia-agendamentos
```

Veja [SETUP.md](./SETUP.md#2-configuração-de-produção-google-cloud-run) para instruções completas.

## 🧪 Testes

Atualmente não há testes automatizados. Para adicionar:

```bash
npm install --save-dev vitest @testing-library/react
```

## 📊 Multi-Tenant

O sistema suporta múltiplos tenants:
- Admin acessa sem parâmetro: `/dashboard`
- Tenant acessa com: `/dashboard?tenant=uuid`
- Isolamento de dados via RLS (Row Level Security) no Supabase

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

© 2026 IA.AGENDAMENTOS - Todos os direitos reservados

## 💬 Suporte

Para questões ou problemas:
- Consulte a [documentação](./SETUP.md)
- Abra uma [issue](https://github.com/ia-fabiana/IA_AGENDAMENTO/issues)
- Revise os logs da aplicação

---

**View app in AI Studio**: https://ai.studio/apps/drive/1kAeFkfoyjjXABDmDwPHcZzjpnSS-wHZO
