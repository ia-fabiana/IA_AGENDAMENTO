# 🚀 Próximos Passos - IA Agendamentos

**Supabase configurado com sucesso!** ✅

Agora vamos para a implementação do código e deploy da aplicação.

---

## 📋 Checklist de Implementação

### Fase 1: Configuração Inicial ✅ CONCLUÍDA

- [x] Habilitar Google OAuth Provider no Supabase
- [x] Criar tabelas do banco de dados
- [x] Adicionar colunas para Google OAuth
- [x] Configurar políticas RLS (segurança)

---

### Fase 2: Implementação do Código ⏳ PRÓXIMA

#### 2.1 Configurar Supabase Client

**Arquivo:** `src/lib/supabase.js` (ou similar)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Variáveis de ambiente (.env):**
```env
VITE_SUPABASE_URL=https://ztfnnzclwvycpbapbbhb.supabase.co
VITE_SUPABASE_ANON_KEY=<obter_no_dashboard>
```

**Como obter a ANON KEY:**
1. Acesse: https://supabase.com/dashboard/project/ztfnnzclwvycpbapbbhb/settings/api
2. Copie a chave "anon public"

---

#### 2.2 Implementar Autenticação com Google

**Arquivo:** `src/components/Login.jsx` (ou similar)

```javascript
import { supabase } from '../lib/supabase'

async function handleGoogleLogin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Erro no login:', error)
  }
}
```

**Importante:**
- `access_type: 'offline'` - Para obter refresh token
- `prompt: 'consent'` - Para forçar tela de consentimento do Google
- `scopes` - Para solicitar acesso ao Google Calendar

---

#### 2.3 Criar Callback de Autenticação

**Arquivo:** `src/pages/AuthCallback.jsx`

```javascript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      // Supabase já processa o callback automaticamente
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) throw error

      if (session) {
        // Salvar tokens do Google no banco
        await saveGoogleTokens(session)

        // Verificar se precisa fazer onboarding
        const needsOnboarding = await checkOnboarding(session.user.id)

        if (needsOnboarding) {
          navigate('/onboarding')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Erro no callback:', error)
      navigate('/login')
    }
  }

  async function saveGoogleTokens(session) {
    const { provider_token, provider_refresh_token } = session

    if (provider_token) {
      const { error } = await supabase
        .from('tenants')
        .upsert({
          user_id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name,
          google_access_token: provider_token,
          google_refresh_token: provider_refresh_token,
          google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) console.error('Erro ao salvar tokens:', error)
    }
  }

  async function checkOnboarding(userId) {
    const { data, error } = await supabase
      .from('tenant_onboarding')
      .select('onboarding_completed')
      .eq('tenant_id', (
        await supabase
          .from('tenants')
          .select('id')
          .eq('user_id', userId)
          .single()
      ).data.id)
      .single()

    if (error || !data) return true
    return !data.onboarding_completed
  }

  return <div>Processando login...</div>
}
```

---

#### 2.4 Criar Tela de Onboarding

**Arquivo:** `src/pages/Onboarding.jsx`

```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Onboarding() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    businessName: '',
    businessPhone: '',
    businessAddress: '',
    businessHours: {},
    services: [],
  })

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      // Obter tenant_id do usuário logado
      const { data: { user } } = await supabase.auth.getUser()
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Salvar dados do onboarding
      const { error } = await supabase
        .from('tenant_onboarding')
        .upsert({
          tenant_id: tenant.id,
          business_name: formData.businessName,
          business_phone: formData.businessPhone,
          business_address: formData.businessAddress,
          business_hours: formData.businessHours,
          services: formData.services,
          onboarding_completed: true,
        }, {
          onConflict: 'tenant_id'
        })

      if (error) throw error

      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Configuração Inicial</h1>
      
      <input
        type="text"
        placeholder="Nome do negócio"
        value={formData.businessName}
        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        required
      />

      <input
        type="tel"
        placeholder="Telefone"
        value={formData.businessPhone}
        onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
      />

      <input
        type="text"
        placeholder="Endereço"
        value={formData.businessAddress}
        onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
      />

      {/* Adicionar campos para horários e serviços */}

      <button type="submit">Concluir Configuração</button>
    </form>
  )
}
```

---

#### 2.5 Implementar Integração com Google Calendar

**Arquivo:** `src/lib/googleCalendar.js`

```javascript
import { supabase } from './supabase'

export async function createCalendarEvent(appointmentData) {
  try {
    // Obter access token do banco
    const { data: { user } } = await supabase.auth.getUser()
    const { data: tenant } = await supabase
      .from('tenants')
      .select('google_access_token, google_refresh_token, google_token_expires_at')
      .eq('user_id', user.id)
      .single()

    // Verificar se o token expirou
    const tokenExpired = new Date(tenant.google_token_expires_at) < new Date()
    let accessToken = tenant.google_access_token

    if (tokenExpired && tenant.google_refresh_token) {
      // Renovar token (implementar lógica de refresh)
      accessToken = await refreshGoogleToken(tenant.google_refresh_token)
    }

    // Criar evento no Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `Agendamento: ${appointmentData.customerName}`,
        description: `Serviço: ${appointmentData.serviceName}`,
        start: {
          dateTime: appointmentData.startDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: appointmentData.endDateTime,
          timeZone: 'America/Sao_Paulo',
        },
      }),
    })

    const event = await response.json()
    return event.id
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error)
    throw error
  }
}

async function refreshGoogleToken(refreshToken) {
  // Implementar lógica de refresh do token
  // Você precisará de um endpoint backend ou Edge Function para isso
  // pois o refresh requer o client_secret que não deve estar no frontend
  
  const response = await fetch('/api/refresh-google-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  const data = await response.json()
  
  // Atualizar token no banco
  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from('tenants')
    .update({
      google_access_token: data.access_token,
      google_token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    .eq('user_id', user.id)

  return data.access_token
}
```

---

### Fase 3: Testes ⏳

#### 3.1 Testar Localmente

```bash
# Instalar dependências
npm install

# Configurar .env com as credenciais do Supabase
# Ver seção 2.1 acima

# Rodar em desenvolvimento
npm run dev
```

#### 3.2 Fluxo de Teste

1. **Login com Google**
   - Acessar `/login`
   - Clicar em "Entrar com Google"
   - Autorizar acesso ao Google Calendar
   - Verificar redirecionamento para onboarding

2. **Onboarding**
   - Preencher dados do negócio
   - Adicionar serviços
   - Configurar horários
   - Salvar e verificar redirecionamento para dashboard

3. **Criar Agendamento**
   - Criar um novo agendamento
   - Verificar se foi criado no banco (tabela `appointments`)
   - Verificar se foi criado no Google Calendar

4. **Integração WhatsApp**
   - Conectar instância do WhatsApp
   - Enviar mensagem de teste
   - Verificar recebimento

---

### Fase 4: Deploy 🚀

#### 4.1 Preparar para Deploy

**Vercel (Recomendado):**

1. Criar conta no Vercel (se não tiver)
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Fazer deploy

**Netlify:**

1. Criar conta no Netlify
2. Conectar repositório
3. Configurar build:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Adicionar variáveis de ambiente
5. Fazer deploy

#### 4.2 Atualizar Redirect URLs no Google OAuth

Após deploy, você precisa adicionar a URL de produção no Google Cloud Console:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no OAuth 2.0 Client ID criado
3. Adicione em "Authorized redirect URIs":
   - `https://seu-dominio.vercel.app/auth/callback`
   - `https://ztfnnzclwvycpbapbbhb.supabase.co/auth/v1/callback`

---

## 🔧 Funcionalidades Pendentes

### Essenciais
- [ ] Implementar refresh de token do Google
- [ ] Criar Edge Function para refresh token (backend)
- [ ] Implementar CRUD de agendamentos
- [ ] Implementar CRUD de clientes
- [ ] Implementar CRUD de serviços
- [ ] Integração com WhatsApp (Evolution API)
- [ ] Envio automático de lembretes

### Opcionais
- [ ] Dashboard com estatísticas
- [ ] Relatórios de agendamentos
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Múltiplos idiomas

---

## 📚 Recursos Úteis

### Documentação
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Evolution API](https://doc.evolution-api.com/)

### Exemplos de Código
- [Supabase + React](https://github.com/supabase/supabase/tree/master/examples/auth/react-auth)
- [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## 🆘 Troubleshooting

### Erro: "Invalid Redirect URI"
- Verifique se a URL está cadastrada no Google Cloud Console
- Verifique se a URL do Supabase está correta

### Erro: "Insufficient permissions"
- Verifique se os scopes do Google Calendar foram solicitados
- Peça ao usuário para fazer logout e login novamente

### Token expirado
- Implemente a lógica de refresh token
- Armazene o refresh_token no banco

---

## ✅ Resumo

**O que está pronto:**
- ✅ Supabase configurado
- ✅ Google OAuth habilitado
- ✅ Banco de dados estruturado
- ✅ Segurança (RLS) configurada

**O que falta fazer:**
- ⏳ Implementar código da aplicação
- ⏳ Testar funcionalidades
- ⏳ Fazer deploy

---

**Vamos começar a implementação! 🚀**
