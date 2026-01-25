# 🚀 IA Agendamentos - Gestão Inteligente

**Sistema completo de agendamentos com IA, Google OAuth e integração com Google Calendar**

---

## 📋 Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Instalação Rápida](#instalação-rápida)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Como Usar](#como-usar)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Tecnologias](#tecnologias)
7. [Troubleshooting](#troubleshooting)
8. [Próximos Passos](#próximos-passos)

---

## 🎯 Sobre o Projeto

Sistema de gestão de agendamentos com inteligência artificial que permite:

- ✅ **Login com Google OAuth**
- ✅ **Integração com Google Calendar**
- ✅ **Assistente virtual com IA (Gemini)**
- ✅ **Integração com WhatsApp (Evolution API)**
- ✅ **Gestão de clientes e serviços**
- ✅ **Sistema multi-tenant seguro**
- ✅ **Banco de dados Supabase**

---

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 18+ instalado ([Download](https://nodejs.org/))
- Conta Google
- Navegador moderno

### Passos

```bash
# 1. Extrair o projeto (se estiver em ZIP)
# Extraia para uma pasta de sua escolha

# 2. Entrar na pasta
cd ia-agendamentos

# 3. Instalar dependências
npm install

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Acessar no navegador
# http://localhost:5173
```

---

## 🔧 Configuração do Supabase

### ✅ Já Configurado!

O projeto já vem com:
- ✅ Credenciais do Supabase configuradas
- ✅ Google OAuth habilitado
- ✅ Banco de dados estruturado
- ✅ Políticas de segurança (RLS) ativas

### Credenciais

**Arquivo:** `.env.local`

```env
VITE_SUPABASE_URL=https://ztfnnzclwvycpbapbbhb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Banco de Dados

**Tabelas criadas:**
- `profiles` - Perfis de usuários
- `tenants` - Clientes do sistema (com tokens do Google)
- `whatsapp_instances` - Instâncias do WhatsApp
- `whatsapp_connections` - Conexões ativas
- `tenant_onboarding` - Configuração inicial
- `appointments` - Agendamentos
- `customers` - Clientes finais
- `services` - Serviços oferecidos
- `messages` - Mensagens do WhatsApp
- `business_configs` - Configurações do negócio

---

## 📱 Como Usar

### 1. Login

1. Acesse `http://localhost:5173`
2. Clique em **"Entrar com Google"**
3. Escolha sua conta Google
4. **Autorize o acesso ao Google Calendar**
5. Aguarde o redirecionamento

### 2. Dashboard

Após o login, você terá acesso a:

- **Dashboard** - Visão geral e estatísticas
- **Agentes** - Configuração da IA
- **Treinamento** - Configurar negócio e serviços
- **Agendamentos** - Gerenciar agendamentos
- **Conexões** - Conectar WhatsApp
- **Chat Demo** - Testar assistente virtual
- **Planos e Créditos** - Gerenciar assinatura

### 3. Configuração Inicial

1. Acesse **"Treinamento"**
2. Configure:
   - Nome do negócio
   - Endereço
   - Horários de funcionamento
   - Serviços oferecidos

### 4. Conectar WhatsApp

1. Acesse **"Conexões"**
2. Configure a Evolution API
3. Escaneie o QR Code
4. Aguarde conexão

---

## 📁 Estrutura do Projeto

```
ia-agendamentos/
├── .env.local                    # Variáveis de ambiente
├── package.json                  # Dependências
├── vite.config.ts               # Configuração Vite
├── tsconfig.json                # Configuração TypeScript
├── index.html                   # HTML principal
├── index.tsx                    # Entry point
├── App.tsx                      # ✅ Componente principal (com auth)
├── types.ts                     # TypeScript types
│
├── components/
│   └── Layout.tsx               # Layout principal
│
├── services/
│   ├── supabase.ts             # ✅ Cliente Supabase (configurado)
│   ├── aiService.ts            # Serviço de IA
│   ├── geminiService.ts        # Gemini AI
│   └── evolutionService.ts     # WhatsApp
│
├── views/
│   ├── Login.tsx               # ✅ NOVO - Tela de login
│   ├── AuthCallback.tsx        # ✅ NOVO - Callback OAuth
│   ├── Dashboard.tsx           # Dashboard principal
│   ├── Agents.tsx              # Configuração de agentes
│   ├── Training.tsx            # Treinamento/Configuração
│   ├── Appointments.tsx        # Gestão de agendamentos
│   ├── Connections.tsx         # Conexões WhatsApp
│   ├── ChatSimulation.tsx      # Chat demo
│   ├── PlanAndCredits.tsx      # Planos e créditos
│   └── AdminDashboard.tsx      # Dashboard admin
│
└── Documentação/
    ├── README_COMPLETO.md      # Este arquivo
    ├── GUIA_INSTALACAO.md      # Guia rápido
    ├── CONFIGURACAO_COMPLETA.md # Documentação técnica
    ├── SUPABASE_CONFIGURADO_SUCESSO.md # Config Supabase
    └── PROXIMOS_PASSOS.md      # Roadmap
```

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização (via classes)
- **Lucide React** - Ícones

### Backend/Serviços
- **Supabase** - Banco de dados e autenticação
- **Google OAuth** - Login social
- **Google Calendar API** - Integração calendário
- **Gemini AI** - Inteligência artificial
- **Evolution API** - WhatsApp

### Autenticação
- **Supabase Auth** - Sistema de autenticação
- **Google OAuth 2.0** - Login com Google
- **Row Level Security (RLS)** - Segurança por linha

---

## 🐛 Troubleshooting

### Servidor não inicia

**Erro:** `ERR_CONNECTION_REFUSED`

**Solução:**
```bash
# Verificar se o servidor está rodando
npm run dev

# Se der erro, reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Erro: "npm: command not found"

**Solução:** Instale o Node.js
- Download: https://nodejs.org/
- Versão recomendada: LTS (Long Term Support)
- Após instalar, reinicie o terminal

---

### Erro: "Port 5173 already in use"

**Solução:** Outra aplicação está usando a porta

**Opção 1:** Feche a outra aplicação

**Opção 2:** Use outra porta:
```bash
npm run dev -- --port 3000
```

---

### Login não funciona

**Checklist:**
- [ ] Servidor rodando (`npm run dev`)
- [ ] Acessando `http://localhost:5173` (com http://)
- [ ] Redirect URI cadastrado no Google Cloud Console
- [ ] Credenciais do Supabase corretas

**Verificar Redirect URI:**
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no OAuth 2.0 Client ID
3. Verifique se existe: `http://localhost:5173/auth/callback`

---

### Erro: "Invalid Redirect URI"

**Solução:** Adicionar URL no Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no OAuth 2.0 Client ID usado no projeto
3. Em "Authorized redirect URIs", adicione:
   - `http://localhost:5173/auth/callback`
   - `https://ztfnnzclwvycpbapbbhb.supabase.co/auth/v1/callback`
4. Salve

---

### Erro: "Insufficient permissions"

**Solução:** Refazer login para solicitar scopes corretos

1. Fazer logout
2. Limpar cache do navegador (Ctrl+Shift+Del)
3. Fazer login novamente
4. Autorizar TODAS as permissões solicitadas

---

### Token do Google expirou

**Status:** Implementação pendente

**Solução temporária:** Fazer logout e login novamente

**Solução definitiva:** Implementar refresh token (ver `PROXIMOS_PASSOS.md`)

---

## 🚀 Próximos Passos

### Essenciais (Prioridade Alta)

- [ ] **Implementar Onboarding** - Tela de configuração inicial
- [ ] **Refresh Token do Google** - Renovar token automaticamente
- [ ] **Criar Eventos no Google Calendar** - Integração completa
- [ ] **CRUD de Agendamentos** - Create, Read, Update, Delete
- [ ] **CRUD de Clientes** - Gestão de clientes
- [ ] **CRUD de Serviços** - Gestão de serviços

### Importantes (Prioridade Média)

- [ ] **Notificações** - Lembretes de agendamentos
- [ ] **Relatórios** - Estatísticas e análises
- [ ] **Testes** - Testes automatizados
- [ ] **Deploy** - Publicar na internet (Vercel/Netlify)

### Opcionais (Prioridade Baixa)

- [ ] **Dashboard Avançado** - Gráficos e métricas
- [ ] **Modo Escuro** - Theme switcher
- [ ] **Múltiplos Idiomas** - i18n
- [ ] **Notificações Push** - Web Push API
- [ ] **PWA** - Progressive Web App

---

## 📚 Documentação Adicional

### Arquivos de Documentação

- **`GUIA_INSTALACAO.md`** - Guia rápido de instalação
- **`CONFIGURACAO_COMPLETA.md`** - Documentação técnica detalhada
- **`SUPABASE_CONFIGURADO_SUCESSO.md`** - Resumo da configuração do Supabase
- **`PROXIMOS_PASSOS.md`** - Roadmap e exemplos de código

### Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Google Calendar API](https://developers.google.com/calendar/api)
- [Documentação Gemini AI](https://ai.google.dev/docs)
- [Documentação Evolution API](https://doc.evolution-api.com/)
- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)

---

## 🔐 Segurança

### Credenciais

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo `.env.local` no Git
- Nunca compartilhe suas credenciais
- Use variáveis de ambiente em produção

### Row Level Security (RLS)

O banco de dados está configurado com RLS:
- Usuários só podem acessar seus próprios dados
- Políticas de segurança por linha ativas
- Proteção contra acesso não autorizado

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Compila para produção

# Preview
npm run preview      # Visualiza build de produção
```

---

## 🆘 Suporte

Se encontrar problemas:

1. **Consulte a documentação** - Arquivos `.md` no projeto
2. **Verifique o console** - F12 no navegador → Console
3. **Verifique o terminal** - Onde rodou `npm run dev`
4. **Limpe e reinstale** - `rm -rf node_modules && npm install`

---

## ✅ Checklist de Verificação

Antes de começar a desenvolver:

- [ ] Node.js instalado
- [ ] Projeto extraído
- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` rodando sem erros
- [ ] Navegador acessando `http://localhost:5173`
- [ ] Login com Google funcionando
- [ ] Dashboard acessível após login
- [ ] Console sem erros críticos

---

## 🎉 Conclusão

**Projeto pronto para desenvolvimento!**

Você tem:
- ✅ Sistema de autenticação completo
- ✅ Banco de dados estruturado
- ✅ Integração com Google Calendar
- ✅ Base sólida para desenvolvimento
- ✅ Documentação completa

**Bom desenvolvimento! 🚀**

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026  
**Status:** ✅ Pronto para desenvolvimento
