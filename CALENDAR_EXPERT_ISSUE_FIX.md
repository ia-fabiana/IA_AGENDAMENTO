# Status: Calendar Expert - Diagnostic Report

## ❌ Problema Identificado

O componente "Especialista Calendar" fica preso na etapa 1 (Verificar Credenciais) porque:

1. **Backend não está deployado em produção**
   - Frontend tenta conectar a `http://localhost:3001`
   - Em produção, esse URL não existe (localhost = máquina local)
   - Resulta em erro de conexão CORS

2. **Cloud Build trigger não foi criado para o backend**
   - Arquivo `cloudbuild.backend.yaml` foi commitado
   - Mas nenhum trigger foi ativado no GCP Console
   - Sem trigger, o backend não é deployado automaticamente

## ✅ Solução

### Passo 1: Criar Cloud Build Trigger para Backend

1. Acesse: https://console.cloud.google.com/cloud-build/triggers?project=ia-agendamentos

2. Clique em **"Create Trigger"**

3. Configure com:
   - **Name**: `backend-deployment`
   - **Repository**: `ia-fabiana/IA_AGENDAMENTO`
   - **Branch**: `^main$`
   - **Build configuration**: Cloud Build configuration file
   - **Configuration file location**: `cloudbuild.backend.yaml`

4. **Substitution Variables** (clique em "Show more"):
   ```
   _BACKEND_URL=https://ia-agendamentos-backend-[SERVICE_ID].us-central1.run.app
   _GOOGLE_CLIENT_ID=870139342019-plu7r26psre0ug1at5t5is514t7j24rl.apps.googleusercontent.com
   _GOOGLE_CLIENT_SECRET=[sua secret key]
   _GOOGLE_REDIRECT_URI=https://ia-agendamentos-backend-[SERVICE_ID].us-central1.run.app/oauth2callback
   _ENCRYPTION_KEY=[sua chave]
   _SUPABASE_URL=https://ztfnnzclwvycpbapbbhb.supabase.co
   _SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Zm5uemNsd3Z5Y3BiYXBiYmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjM5NjIsImV4cCI6MjA4NDgzOTk2Mn0.j2J1E6xOQw_qKV4vY-FP0U_-ImmBqAWbzWGZ5hhcR1g
   _EVOLUTION_API_URL=[opcional]
   _EVOLUTION_API_KEY=[opcional]
   ```

5. Clique em **"Create"**

### Passo 2: Aguardar Deploy do Backend

- Cloud Build começará a fazer o build automaticamente
- Levará **5-10 minutos**
- Você verá na Cloud Run um novo serviço chamado `ia-agendamentos-backend`
- Anote a URL fornecida (algo como `https://ia-agendamentos-backend-abc123.us-central1.run.app`)

### Passo 3: Atualizar Frontend com URL do Backend

Depois que o backend estiver online:

1. Acesse: https://console.cloud.google.com/cloud-build/triggers?project=ia-agendamentos

2. Edite o trigger `ia-agendamentos` (frontend)

3. Adicione Substitution Variable:
   ```
   _BACKEND_URL=https://ia-agendamentos-backend-[ID].us-central1.run.app
   ```
   (use a URL real obtida no Passo 2)

4. Salve e force um novo build:
   - Vá para Cloud Build > History
   - Clique no trigger frontend
   - Clique em **"Run"** para forçar rebuild

5. Aguarde ~5 minutos para conclusão

## 📊 Alterações Realizadas

✅ **cloudbuild.yaml** atualizado:
- Agora passa `VITE_SERVER_URL=${_BACKEND_URL}` durante o build
- Frontend será compilado com a URL correta do backend

✅ **GoogleCalendarExpert.tsx** melhorado:
- Detecta quando está em produção com URL localhost
- Mostra mensagem clara: "Servidor backend não está disponível"
- Melhor tratamento de timeouts
- Melhor feedback de erros

## 🔍 O que Acontecerá Após Deploy

1. ✅ Passo 1 "Verificar Credenciais" - ✅ COMPLETARÁ com sucesso
2. ✅ Passo 2 "Autorizar Acesso" - Abrirá popup do Google
3. ✅ Passo 3 "Salvar Credenciais" - Salvará token criptografado no Supabase
4. ✅ Passo 4 "Ativar Sincronização" - Habilitará sync automático

## 📝 Resumo

- **Problema**: Backend não deployado → Frontend não consegue conectar
- **Causa**: Cloud Build trigger não criado para `cloudbuild.backend.yaml`
- **Solução**: Criar trigger manualmente no GCP Console
- **Tempo estimado**: 15-20 minutos (criar trigger + deploy)
- **Resultado**: Calendar Expert funcionará completamente

## 🆘 Se Ainda Não Funcionar

1. Verifique se todos os 6 Substitution Variables foram preenchidos
2. Confirme que `cloudbuild.backend.yaml` está no repositório (está ✓)
3. Verifique Cloud Build logs se houver erro no build
4. Verifique Cloud Run console se serviço foi criado
5. Teste health check do backend: `GET /health`
