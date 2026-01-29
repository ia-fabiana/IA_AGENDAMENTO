# Guia de Configuração - IA.AGENDAMENTOS

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento e produção do IA.AGENDAMENTOS.

## Pré-requisitos

- Node.js 18 ou superior
- Uma conta Supabase
- Uma instância do Evolution API
- Credenciais do Google Cloud (para Calendar API)

## 1. Configuração Local

### 1.1. Clone o Repositório

```bash
git clone https://github.com/ia-fabiana/IA_AGENDAMENTO.git
cd IA_AGENDAMENTO
```

### 1.2. Instale as Dependências

```bash
npm install
```

### 1.3. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as seguintes variáveis:

#### Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings > API**
3. Copie as credenciais:
   - `SUPABASE_URL`: URL do projeto
   - `SUPABASE_ANON_KEY`: Chave pública anon/public
   - `SUPABASE_SERVICE_KEY`: Chave service_role (⚠️ mantenha em segredo!)

#### Evolution API

Configure sua instância do Evolution API:
- `EVOLUTION_URL`: URL da sua instância Evolution
- `EVOLUTION_KEY`: Chave API da Evolution

#### Google Calendar

Siga o guia [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) para obter:
- `GOOGLE_CLIENT_ID`: Client ID do OAuth2
- `GOOGLE_CLIENT_SECRET`: Client Secret do OAuth2
- `GOOGLE_REDIRECT_URI`: Para desenvolvimento local use `http://localhost:8080/api/calendar/callback`

### 1.4. Execute as Migrações do Banco de Dados

#### Migração Inicial

Execute os scripts SQL no painel do Supabase (SQL Editor):

1. `setup_database.sql` - Cria as tabelas principais
2. `migrations/create_google_calendar_tokens.sql` - Tabela de tokens do Google
3. `migration_add_training_fields.sql` - Campos de treinamento

Ou execute via script:

```bash
# Configure a variável de ambiente primeiro
export SUPABASE_SERVICE_KEY=sua_chave_service_role

# Execute a migração
node run_migration.js
```

### 1.5. Inicie a Aplicação

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend (desenvolvimento):**
```bash
npm run dev
```

A aplicação estará disponível em:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## 2. Configuração de Produção (Google Cloud Run)

### 2.1. Pré-requisitos

- Google Cloud CLI instalado e configurado
- Projeto do Google Cloud criado
- Cloud Build API habilitada
- Artifact Registry ou Container Registry habilitado

### 2.2. Configure o Cloud Build Trigger

1. Acesse o [Cloud Build](https://console.cloud.google.com/cloud-build) no Google Cloud Console
2. Vá em **Triggers** > **Create Trigger**
3. Configure:
   - **Nome**: `ia-agendamentos-deploy`
   - **Repositório**: Conecte seu repositório GitHub
   - **Branch**: `main` (ou branch desejada)
   - **Arquivo de configuração**: `cloudbuild.yaml`

### 2.3. Configure as Variáveis de Substituição

No trigger criado, adicione as seguintes **Substitution Variables**:

| Variável | Valor |
|----------|-------|
| `_SUPABASE_ANON_KEY` | Sua chave anon do Supabase |
| `_SUPABASE_SERVICE_KEY` | Sua chave service_role do Supabase |
| `_EVOLUTION_KEY` | Sua chave da Evolution API |
| `_GOOGLE_CLIENT_ID` | Client ID do Google OAuth |
| `_GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth |

⚠️ **Segurança**: Para maior segurança, utilize o [Secret Manager](https://cloud.google.com/secret-manager) do Google Cloud ao invés de variáveis de substituição.

### 2.4. Configure o Redirect URI

Após o primeiro deploy, atualize o `GOOGLE_REDIRECT_URI`:

1. Obtenha a URL do Cloud Run (ex: `https://ia-agendamentos-xxx.run.app`)
2. Atualize no trigger: `_GOOGLE_REDIRECT_URI=https://sua-url.run.app/api/calendar/callback`
3. Atualize também no Google Cloud Console (Credentials)

### 2.5. Deploy Manual (Opcional)

Se preferir fazer deploy manual:

```bash
# Build da aplicação
npm run build

# Build da imagem Docker
docker build -t gcr.io/SEU_PROJETO/ia-agendamentos:latest .

# Push para o Container Registry
docker push gcr.io/SEU_PROJETO/ia-agendamentos:latest

# Deploy no Cloud Run
gcloud run deploy ia-agendamentos \
  --image gcr.io/SEU_PROJETO/ia-agendamentos:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars EVOLUTION_URL=$EVOLUTION_URL,EVOLUTION_KEY=$EVOLUTION_KEY
```

## 3. Multi-Tenant

### 3.1. Fluxo de Tenant

A aplicação suporta múltiplos tenants (clientes):

1. **Admin**: Acessa sem parâmetro tenant
2. **Usuário Tenant**: Acessa com `?tenant=uuid` na URL

### 3.2. OAuth Flow com Tenant

Ao iniciar o fluxo OAuth do Google Calendar, o tenantId é passado via state parameter:

```
GET /auth/google/calendar?tenant=550e8400-e29b-41d4-a716-446655440000
```

O callback recebe o tenantId de volta e associa os tokens corretamente.

## 4. Estrutura de Dados

### 4.1. Tenant de Teste

O sistema vem com um tenant de teste pré-configurado:
- **ID**: `550e8400-e29b-41d4-a716-446655440000`
- **Nome**: Estúdio Shine
- **Plano**: Prata

### 4.2. Criando Novos Tenants

Use o painel Admin (rota `/admin`) ou insira diretamente no Supabase:

```sql
INSERT INTO tenants (nome_negocio, plano, saldo_creditos)
VALUES ('Meu Salão', 'Bronze', 100);
```

## 5. Troubleshooting

### Erro: "SUPABASE_SERVICE_KEY não configurada"

- Configure a variável de ambiente `SUPABASE_SERVICE_KEY` antes de executar scripts de migração

### Erro: "Tenant ID não foi informado" no OAuth

- Certifique-se de passar o parâmetro `tenant` na URL: `/auth/google/calendar?tenant=<uuid>`

### Build falha no Cloud Build

- Verifique se todas as variáveis de substituição estão configuradas
- Verifique os logs do Cloud Build para erros específicos

### Erro 401 ao acessar a API

- Verifique se as chaves do Supabase estão corretas
- Verifique se as políticas RLS estão configuradas corretamente

## 6. Desenvolvimento

### Estrutura de Pastas

```
/services/          # Backend services (TypeScript)
/views/             # React view components
/components/        # Reusable React components
/migrations/        # SQL database migrations
server.js           # Express backend server
App.tsx            # Main React application
```

### Padrões de Código

- Use TypeScript para todos os novos arquivos
- Siga as convenções em `.github/copilot-instructions.md`
- Execute `npm run build` antes de fazer commit

### Testes

Atualmente não há testes automatizados. Para adicionar:

```bash
npm install --save-dev vitest @testing-library/react
```

## 7. Suporte

Para questões ou problemas:
1. Verifique a documentação em `/docs`
2. Revise os logs da aplicação
3. Abra uma issue no repositório GitHub
