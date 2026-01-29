# API Documentation - IA.AGENDAMENTOS

Esta documentação descreve os endpoints disponíveis no backend do IA.AGENDAMENTOS.

## Base URL

- **Desenvolvimento**: `http://localhost:8080`
- **Produção**: `https://ia-agendamentos-870139342019.us-central1.run.app`

## Autenticação

A API não requer autenticação Bearer token. A segurança é gerenciada através de:
- **Row Level Security (RLS)** no Supabase para isolamento de dados por tenant
- **Tenant ID** passado como query parameter onde necessário

## Endpoints

### Health Check

#### `GET /health`

Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-29T21:00:00.000Z"
}
```

---

### Google Calendar OAuth

#### `GET /auth/google/calendar`

Inicia o fluxo de autenticação OAuth2 com o Google Calendar.

**Query Parameters:**
- `tenant` (opcional): UUID do tenant para associar a autorização

**Exemplo:**
```
GET /auth/google/calendar?tenant=550e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
Redireciona para a página de autorização do Google.

---

#### `GET /api/calendar/callback`

Callback do OAuth2 do Google Calendar. Este endpoint é chamado automaticamente pelo Google após a autorização.

**Query Parameters:**
- `code`: Código de autorização do Google
- `state`: Tenant ID passado no fluxo inicial
- `error`: Mensagem de erro (se o usuário negou acesso)

**Resposta:**
HTML com mensagem de sucesso ou erro.

---

### Evolution API Proxy

Todos os endpoints da Evolution API são proxiados através do backend para segurança.

#### `POST /evolution/*`

Proxy para qualquer endpoint da Evolution API.

**Headers:**
```
Content-Type: application/json
```

**Body:**
Varia de acordo com o endpoint da Evolution API.

**Exemplo - Enviar Mensagem:**
```bash
POST /evolution/message/sendText
Content-Type: application/json

{
  "number": "5511999999999",
  "text": "Olá, tudo bem?"
}
```

**Exemplo - Criar Instância:**
```bash
POST /evolution/instance/create
Content-Type: application/json

{
  "instanceName": "ia-agendamentos-main",
  "qrcode": true
}
```

**Resposta:**
Retorna a resposta da Evolution API.

---

## Integração com Frontend

### Supabase Client

O frontend usa o cliente Supabase diretamente para:
- Autenticação de usuários
- CRUD de dados (tenants, agentes, serviços, etc.)
- Real-time subscriptions

**Exemplo - Buscar Tenant:**
```typescript
import { supabase } from './services/supabase';

const { data, error } = await supabase
  .from('tenants')
  .select('*')
  .eq('id', tenantId)
  .single();
```

**Exemplo - Salvar Serviço:**
```typescript
const { error } = await supabase
  .from('services')
  .insert({
    id: 'service_1',
    tenant_id: tenantId,
    nome: 'Corte Feminino',
    preco: 120.00,
    duracao_minutos: 60
  });
```

---

## Estrutura de Dados

### Tenant

```typescript
{
  id: string;                      // UUID
  nome_negocio: string;           // Nome do salão/empresa
  plano: 'Bronze' | 'Prata' | 'Ouro' | 'Grátis';
  saldo_creditos: number;
  endereco?: string;
  link_maps?: string;
  horario_funcionamento?: string;
  politica_cancelamento?: string;
  tempo_minimo_antecedencia?: number;
  promocao_ativa?: boolean;
  promocao_descricao?: string;
  promocao_imagem?: string;
  promocao_cta?: string;
  created_at: string;             // ISO timestamp
  updated_at?: string;            // ISO timestamp
}
```

### Service

```typescript
{
  id: string;                     // ID único
  tenant_id: string;              // UUID do tenant
  nome: string;                   // Nome do serviço
  preco: number;                  // Preço em reais
  duracao_minutos: number;        // Duração em minutos
  created_at: string;             // ISO timestamp
}
```

### Agent

```typescript
{
  id: string;                     // UUID
  tenant_id: string;              // UUID do tenant
  nome_agente: string;            // Nome do assistente
  provider: 'openai' | 'gemini';
  model: string;                  // ex: 'gemini-3-flash-preview'
  system_prompt?: string;         // Instruções para a IA
  temperature?: number;           // 0.0 a 1.0
  max_tokens?: number;
  openai_key?: string;
  bot_active: boolean;            // Se o bot está ativo
  created_at: string;             // ISO timestamp
}
```

### Google Calendar Token

```typescript
{
  id: string;                     // UUID
  tenant_id: string;              // UUID do tenant
  access_token: string;           // Token de acesso
  refresh_token?: string;         // Token de refresh
  expiry_date?: number;           // Timestamp de expiração
  google_email: string;           // Email da conta Google
  created_at: string;             // ISO timestamp
  updated_at: string;             // ISO timestamp
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## Tratamento de Erros

Todas as rotas retornam erros no formato:

```json
{
  "error": "Mensagem de erro descritiva",
  "code": "ERROR_CODE"
}
```

**Exemplo:**
```json
{
  "error": "Tenant ID não foi informado",
  "code": "MISSING_TENANT_ID"
}
```

---

## Rate Limiting

Atualmente não há rate limiting implementado. Considere adicionar em produção:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por janela
});

app.use('/api/', limiter);
```

---

## CORS

CORS está habilitado para todos os domínios em desenvolvimento. Em produção, configure origins específicas:

```javascript
app.use(cors({
  origin: [
    'https://ia-agendamentos-870139342019.us-central1.run.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

---

## Exemplos de Uso

### Conectar Google Calendar com Tenant

```typescript
// No frontend
const connectCalendar = async (tenantId: string) => {
  // Redireciona para o fluxo OAuth
  window.location.href = `/auth/google/calendar?tenant=${tenantId}`;
};
```

### Salvar Dados de Treinamento

```typescript
import { trainingService } from './services/trainingService';

const saveTraining = async () => {
  await trainingService.saveTrainingData(
    tenantId,
    businessConfig,
    services
  );
};
```

### Listar Agendamentos de um Tenant

```typescript
const { data: appointments } = await supabase
  .from('appointments')
  .select('*')
  .eq('tenantId', tenantId)
  .order('date', { ascending: true });
```

---

## Webhooks (Futuro)

Planejado para futuras versões:
- Webhook de novo agendamento
- Webhook de mensagem recebida no WhatsApp
- Webhook de atualização de status de agendamento

---

## Suporte

Para questões sobre a API:
- Consulte a [documentação principal](./README.md)
- Revise o código em `/server.js` e `/services/`
- Abra uma [issue](https://github.com/ia-fabiana/IA_AGENDAMENTO/issues)
