# 🚀 Guia Rápido de Instalação - IA Agendamentos

**Projeto configurado e pronto para uso!**

---

## 📦 O que você recebeu:

✅ Projeto completo com Google OAuth implementado
✅ Supabase configurado com credenciais corretas
✅ Banco de dados estruturado e seguro
✅ Integração com Google Calendar pronta
✅ Todas as dependências listadas

---

## 🎯 Instalação em 5 Passos:

### 1️⃣ Extrair o ZIP

Extraia o arquivo `ia-agendamentos-configurado.zip` em uma pasta de sua escolha.

---

### 2️⃣ Abrir Terminal

Abra o terminal (ou prompt de comando) na pasta do projeto:

**Windows:**
```cmd
cd caminho\para\ia-agendamentos
```

**Mac/Linux:**
```bash
cd caminho/para/ia-agendamentos
```

---

### 3️⃣ Instalar Dependências

Execute o comando:

```bash
npm install
```

**Aguarde a instalação** (pode levar 1-2 minutos)

---

### 4️⃣ Iniciar Servidor

Execute o comando:

```bash
npm run dev
```

**Você verá algo como:**
```
VITE v6.4.1  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### 5️⃣ Acessar no Navegador

Abra o navegador e acesse:

```
http://localhost:5173
```

---

## ✅ Testando o Sistema:

### 1. Tela de Login

Você verá a tela de login com o botão **"Entrar com Google"**

### 2. Login com Google

1. Clique em "Entrar com Google"
2. Escolha sua conta Google
3. **Autorize o acesso ao Google Calendar**
4. Aguarde o redirecionamento

### 3. Dashboard

Após o login, você será redirecionado para o dashboard do sistema!

---

## 🔧 Configurações Importantes:

### Credenciais do Supabase

**Arquivo:** `.env.local`

```env
VITE_SUPABASE_URL=https://ztfnnzclwvycpbapbbhb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Já configurado!** Não precisa alterar.

---

### Google OAuth

**Redirect URIs configurados:**
- ✅ `http://localhost:5173/auth/callback` (desenvolvimento)
- ✅ `https://ztfnnzclwvycpbapbbhb.supabase.co/auth/v1/callback` (Supabase)

**Scopes solicitados:**
- ✅ Google Calendar
- ✅ Google Calendar Events

---

## 📁 Estrutura do Projeto:

```
ia-agendamentos/
├── .env.local              # ✅ Credenciais configuradas
├── package.json            # ✅ Dependências atualizadas
├── App.tsx                 # ✅ Autenticação implementada
├── services/
│   └── supabase.ts        # ✅ Cliente configurado
├── views/
│   ├── Login.tsx          # ✅ NOVO - Tela de login
│   ├── AuthCallback.tsx   # ✅ NOVO - Callback OAuth
│   ├── Dashboard.tsx
│   ├── Agents.tsx
│   ├── Training.tsx
│   ├── Appointments.tsx
│   └── ...
└── CONFIGURACAO_COMPLETA.md # 📖 Documentação detalhada
```

---

## 🐛 Problemas Comuns:

### Erro: "npm: command not found"

**Solução:** Instale o Node.js
- Baixe em: https://nodejs.org/
- Versão recomendada: LTS (Long Term Support)

---

### Erro: "Port 5173 already in use"

**Solução:** Outra aplicação está usando a porta 5173

**Opção 1:** Feche a outra aplicação

**Opção 2:** Use outra porta:
```bash
npm run dev -- --port 3000
```

---

### Erro: "Invalid Redirect URI"

**Solução:** Verifique se `http://localhost:5173/auth/callback` está cadastrado no Google Cloud Console

**Passos:**
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no OAuth 2.0 Client ID
3. Verifique "Authorized redirect URIs"

---

### Login não funciona

**Checklist:**
- [ ] Servidor está rodando (`npm run dev`)
- [ ] Acessando `http://localhost:5173` (não `localhost:5173`)
- [ ] Redirect URI está cadastrado no Google
- [ ] Credenciais do Supabase estão corretas

---

## 📚 Documentação Completa:

Consulte o arquivo **`CONFIGURACAO_COMPLETA.md`** para:
- Detalhes técnicos da implementação
- Estrutura do banco de dados
- Próximos passos e melhorias
- Troubleshooting avançado

---

## 🚀 Próximos Passos:

### Após testar localmente:

1. **Implementar Onboarding** - Primeira configuração do negócio
2. **Integrar Google Calendar** - Criar eventos automaticamente
3. **Conectar WhatsApp** - Evolution API
4. **Deploy** - Publicar na internet (Vercel, Netlify, etc.)

---

## 🆘 Precisa de Ajuda?

Se encontrar algum problema:

1. **Verifique o console do navegador** (F12 → Console)
2. **Verifique o terminal** (onde rodou `npm run dev`)
3. **Consulte a documentação completa** (`CONFIGURACAO_COMPLETA.md`)

---

## ✅ Checklist Final:

- [ ] Node.js instalado
- [ ] Projeto extraído
- [ ] `npm install` executado
- [ ] `npm run dev` executado
- [ ] Navegador aberto em `http://localhost:5173`
- [ ] Login com Google testado
- [ ] Dashboard acessível

---

**Bom desenvolvimento! 🎉**
