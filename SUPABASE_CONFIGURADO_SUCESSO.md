# ✅ Supabase Configurado com Sucesso!

**Data:** 24 de janeiro de 2026  
**Projeto:** IA Agendamentos  
**Supabase Project ID:** ztfnnzclwvycpbapbbhb

---

## 🎉 Configuração Completa Realizada

### 1. Google OAuth Provider ✅

**Status:** Habilitado e configurado

**Configurações:**
- **Client ID:** 870139342019-0c3qncbrklr6hf35iom5iv4qvr9drmfb.apps.googleusercontent.com
- **Client Secret:** Configurado (oculto por segurança)
- **Callback URL:** https://ztfnnzclwvycpbapbbhb.supabase.co/auth/v1/callback
- **Scopes necessários:** Serão configurados no código da aplicação
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/userinfo.email`
  - `https://www.googleapis.com/auth/userinfo.profile`

---

### 2. Estrutura do Banco de Dados ✅

**Tabelas criadas:**

#### `profiles`
- Armazena perfis dos usuários
- Colunas: id, full_name, phone, created_at, updated_at

#### `tenants`
- Armazena dados dos clientes (tenants) do sistema
- Colunas: id, user_id, name, email, phone, **google_access_token**, **google_refresh_token**, **google_token_expires_at**, **google_calendar_id**, created_at, updated_at
- **Nota:** Já possui todas as colunas necessárias para Google OAuth!

#### `whatsapp_instances`
- Armazena instâncias do WhatsApp por tenant
- Colunas: id, tenant_id, instance_name, instance_id, api_key, qr_code, status, phone_number, created_at, updated_at

#### `whatsapp_connections`
- Armazena conexões do WhatsApp por usuário
- Colunas: id, user_id, instance_name, phone_number, status, qr_code, connected_at, created_at, updated_at

#### `tenant_onboarding`
- Armazena dados do processo de onboarding
- Colunas: id, tenant_id, business_name, business_phone, business_address, business_hours, services, onboarding_completed, onboarding_step, created_at, updated_at

#### `appointments`
- Armazena agendamentos
- Colunas: id, user_id, customer_id, service_id, scheduled_at, status, notes, created_at, updated_at

#### `customers`
- Armazena clientes dos tenants
- Colunas: id, user_id, name, email, phone, notes, created_at, updated_at

#### `services`
- Armazena serviços oferecidos
- Colunas: id, user_id, name, description, duration, price, active, created_at, updated_at

#### `messages`
- Armazena mensagens do WhatsApp
- Colunas: id, user_id, customer_phone, content, direction, event, extension, message_type, payload, private, status, topic, inserted_at, updated_at

#### `business_configs`
- Armazena configurações do negócio
- Colunas: id, user_id, business_name, business_description, business_hours, created_at, updated_at

#### Outras tabelas existentes:
- `credits` - Sistema de créditos
- `credit_transactions` - Transações de créditos
- `promotions` - Promoções e campanhas

---

### 3. Segurança (Row Level Security - RLS) ✅

**Status:** Habilitado em todas as tabelas

**Políticas criadas:**

Todas as tabelas possuem políticas RLS que garantem que:
- ✅ Usuários só podem ver seus próprios dados
- ✅ Usuários só podem criar dados associados a eles
- ✅ Usuários só podem atualizar seus próprios dados
- ✅ Usuários só podem deletar seus próprios dados

**Tipos de políticas:**
- **SELECT:** Visualização de dados próprios
- **INSERT:** Criação de novos registros
- **UPDATE:** Atualização de registros próprios
- **DELETE:** Exclusão de registros próprios (onde aplicável)

---

## 📊 Arquitetura do Sistema

### Modelo Multi-tenant

O sistema utiliza uma arquitetura **multi-tenant** onde:

1. **User (auth.users)** - Usuário autenticado via Supabase Auth
2. **Tenant** - Representa um cliente do sistema (salão, clínica, etc.)
3. **Relacionamento:** 1 User = 1 Tenant (relação 1:1)

### Fluxo de Autenticação

```
1. Usuário faz login com Google OAuth
2. Supabase Auth cria/autentica o usuário
3. Sistema cria um registro em `tenants` associado ao user_id
4. Tokens do Google (access_token, refresh_token) são armazenados em `tenants`
5. Sistema pode acessar Google Calendar do usuário usando os tokens
```

### Fluxo de Onboarding

```
1. Usuário faz login pela primeira vez
2. Sistema verifica se existe registro em `tenant_onboarding`
3. Se não existe, redireciona para tela de onboarding
4. Usuário preenche dados do negócio (nome, telefone, horários, serviços)
5. Sistema salva em `tenant_onboarding` e marca como completo
6. Usuário é redirecionado para o dashboard principal
```

---

## 🔐 Variáveis de Ambiente Necessárias

Para a aplicação funcionar, você precisa configurar estas variáveis de ambiente:

```env
# Supabase
VITE_SUPABASE_URL=https://ztfnnzclwvycpbapbbhb.supabase.co
VITE_SUPABASE_ANON_KEY=<sua_anon_key>

# Google OAuth (já configurado no Supabase)
# Não precisa adicionar no .env, pois está no Supabase Auth
```

**Como obter a ANON KEY:**
1. Acesse: https://supabase.com/dashboard/project/ztfnnzclwvycpbapbbhb/settings/api
2. Copie a chave "anon public"

---

## 🚀 Próximos Passos

### 1. Atualizar Código da Aplicação

**Arquivos que precisam ser atualizados/criados:**

- ✅ Configurar Supabase client com as credenciais
- ✅ Implementar fluxo de autenticação com Google OAuth
- ✅ Criar tela de onboarding
- ✅ Implementar integração com Google Calendar API
- ✅ Criar funções para gerenciar tokens do Google

### 2. Testar Autenticação

1. Fazer login com Google
2. Verificar se o registro é criado em `tenants`
3. Verificar se os tokens do Google são salvos
4. Testar refresh token quando o access token expirar

### 3. Implementar Funcionalidades

- ✅ Onboarding do usuário
- ✅ Configuração do negócio
- ✅ Integração com WhatsApp (Evolution API)
- ✅ Criação de agendamentos
- ✅ Sincronização com Google Calendar
- ✅ Envio de mensagens via WhatsApp

### 4. Deploy

- ✅ Fazer deploy da aplicação (Vercel, Netlify, etc.)
- ✅ Configurar variáveis de ambiente no serviço de deploy
- ✅ Testar em produção

---

## 📝 Notas Importantes

### Google OAuth Scopes

Os scopes do Google Calendar **não foram configurados na interface do Supabase** (campo não disponível na versão atual).

**Solução:** Os scopes serão passados diretamente no código da aplicação ao chamar `supabase.auth.signInWithOAuth()`:

```javascript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})
```

### Refresh Token

Para garantir que o sistema sempre tenha acesso ao Google Calendar, é importante:

1. Solicitar `access_type: 'offline'` no OAuth
2. Solicitar `prompt: 'consent'` para forçar o consentimento
3. Armazenar o `refresh_token` em `tenants.google_refresh_token`
4. Implementar lógica para renovar o `access_token` quando expirar

---

## 🎯 Status Atual

| Item | Status |
|------|--------|
| Google OAuth Provider | ✅ Configurado |
| Tabelas do banco | ✅ Criadas |
| Colunas Google OAuth | ✅ Adicionadas |
| Políticas RLS | ✅ Configuradas |
| Código da aplicação | ⏳ Pendente |
| Testes | ⏳ Pendente |
| Deploy | ⏳ Pendente |

---

## 📞 Suporte

Se tiver dúvidas sobre a configuração do Supabase:
- Dashboard: https://supabase.com/dashboard/project/ztfnnzclwvycpbapbbhb
- Documentação: https://supabase.com/docs
- SQL Editor: https://supabase.com/dashboard/project/ztfnnzclwvycpbapbbhb/sql/new

---

**Configuração realizada com sucesso em 24/01/2026** ✅
