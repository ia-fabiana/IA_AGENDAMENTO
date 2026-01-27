# 📅 Tutorial: Configurar Google Calendar OAuth2

Este tutorial vai te guiar passo a passo para configurar a integração do Google Calendar no sistema IA.AGENDAMENTOS.

**Tempo estimado:** 5-10 minutos ⏱️

---

## 🎯 Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Se você ainda não tem um projeto, clique em **"Criar Projeto"**
   - Nome do projeto: `IA-AGENDAMENTOS` (ou o nome que preferir)
   - Clique em **"Criar"**

---

## 🔌 Passo 2: Ativar Google Calendar API

1. No menu lateral, vá em: **APIs e serviços** → **Biblioteca**
2. Na barra de pesquisa, digite: `Google Calendar API`
3. Clique no resultado **"Google Calendar API"**
4. Clique no botão azul **"ATIVAR"**
5. Aguarde alguns segundos até ativar

---

## 🔑 Passo 3: Criar Credenciais OAuth 2.0

1. No menu lateral, vá em: **APIs e serviços** → **Credenciais**
2. Clique no botão **"+ CRIAR CREDENCIAIS"** no topo
3. Selecione **"ID do cliente OAuth"**

### 3.1 Configurar Tela de Consentimento (se necessário)

Se aparecer uma mensagem pedindo para configurar a tela de consentimento:

1. Clique em **"CONFIGURAR TELA DE CONSENTIMENTO"**
2. Escolha **"Externo"** (para permitir qualquer usuário Google)
3. Clique em **"CRIAR"**
4. Preencha:
   - **Nome do app:** IA.AGENDAMENTOS
   - **E-mail de suporte do usuário:** seu email
   - **E-mail do desenvolvedor:** seu email
5. Clique em **"SALVAR E CONTINUAR"**
6. Em **"Escopos"**, clique em **"ADICIONAR OU REMOVER ESCOPOS"**
7. Procure e marque:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
8. Clique em **"ATUALIZAR"** e depois **"SALVAR E CONTINUAR"**
9. Em **"Usuários de teste"**, clique em **"+ ADD USERS"**
10. Adicione seu email e clique em **"SALVAR E CONTINUAR"**
11. Clique em **"VOLTAR PARA O PAINEL"**

### 3.2 Criar ID do Cliente OAuth

1. Volte para: **APIs e serviços** → **Credenciais**
2. Clique em **"+ CRIAR CREDENCIAIS"** → **"ID do cliente OAuth"**
3. Em **"Tipo de aplicativo"**, escolha: **"Aplicativo da Web"**
4. Preencha:
   - **Nome:** IA-AGENDAMENTOS Calendar
   
5. Em **"Origens JavaScript autorizadas"**, clique em **"+ ADICIONAR URI"**
   - Cole: `https://ia-agendamentos-870139342019.us-central1.run.app`
   
6. Em **"URIs de redirecionamento autorizados"**, clique em **"+ ADICIONAR URI"**
   - Cole: `https://ia-agendamentos-870139342019.us-central1.run.app/auth/google/callback`

7. Clique em **"CRIAR"**

---

## 📋 Passo 4: Copiar as Credenciais

Após criar, aparecerá um popup com suas credenciais:

1. **Copie o "ID do cliente"** (começa com algo como `123456789-abc...apps.googleusercontent.com`)
2. **Copie o "Código secreto do cliente"** (algo como `GOCSPX-abc123...`)

⚠️ **IMPORTANTE:** Guarde essas credenciais em local seguro!

---

## ⚙️ Passo 5: Configurar no Sistema

Agora você precisa adicionar essas credenciais no sistema. Existem 2 formas:

### Opção A: Via Variáveis de Ambiente (Recomendado)

1. Acesse o **Google Cloud Console**
2. Vá em: **Cloud Run** → **ia-agendamentos**
3. Clique em **"EDITAR E IMPLANTAR NOVA REVISÃO"**
4. Role até **"Variáveis de ambiente"**
5. Clique em **"+ ADICIONAR VARIÁVEL"** e adicione:

```
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=https://ia-agendamentos-870139342019.us-central1.run.app/auth/google/callback
```

6. Clique em **"IMPLANTAR"**
7. Aguarde o deploy completar

### Opção B: Via Arquivo .env (Desenvolvimento Local)

Se estiver rodando localmente:

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
```

3. Reinicie o servidor

---

## ✅ Passo 6: Testar a Integração

1. Acesse o sistema: https://ia-agendamentos-870139342019.us-central1.run.app
2. Faça login
3. Vá em **CONEXÕES**
4. Clique em **"CONECTAR GOOGLE CALENDAR"**
5. Autorize o acesso na tela do Google
6. Pronto! ✨

---

## 🐛 Problemas Comuns

### Erro: "redirect_uri_mismatch"
- **Causa:** A URI de redirecionamento não está configurada corretamente
- **Solução:** Verifique se adicionou exatamente: `https://ia-agendamentos-870139342019.us-central1.run.app/auth/google/callback`

### Erro: "access_denied"
- **Causa:** Usuário não está na lista de teste
- **Solução:** Adicione o email do usuário em **"Usuários de teste"** na tela de consentimento

### Erro: "invalid_client"
- **Causa:** Client ID ou Secret incorretos
- **Solução:** Verifique se copiou as credenciais corretamente

---

## 📚 Recursos Adicionais

- [Documentação Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 do Google](https://developers.google.com/identity/protocols/oauth2)

---

## 🎉 Pronto!

Agora seus clientes podem conectar suas próprias agendas Google e os agendamentos serão sincronizados automaticamente! 🚀

**Dúvidas?** Entre em contato com o suporte.
