# API Documentation

## IA_AGENDAMENTO - Gestão Inteligente de Agendamentos

Esta é a documentação completa da API REST do sistema IA_AGENDAMENTO, uma aplicação de gestão inteligente de agendamentos com integração ao Google Calendar e controle de acesso baseado em funções (RBAC).

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Appointments](#appointments)
   - [Calendar](#calendar)
   - [Authentication](#authentication)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Status](#códigos-de-status)
6. [Exemplos de Uso](#exemplos-de-uso)

## Visão Geral

**Base URL:** `http://localhost:3001` (desenvolvimento)

**Formato de Resposta:** JSON

**Versão da API:** 1.0.0

### Características Principais

- Sistema de agendamentos com integração Google Calendar
- Controle de acesso baseado em funções (RBAC)
- Multi-tenant (isolamento por tenant)
- Logs de auditoria
- Rate limiting em endpoints sensíveis

## Autenticação e Autorização

### Sistema RBAC

O sistema utiliza Role-Based Access Control (RBAC) com as seguintes funções:

| Função | Descrição | Permissões Principais |
|--------|-----------|----------------------|
| `admin` | Administrador do sistema | Todas as permissões |
| `owner` | Proprietário do tenant | Acesso completo ao tenant |
| `manager` | Gerente | Gerenciar agendamentos e serviços |
| `staff` | Equipe | Visualizar e criar agendamentos |
| `readonly` | Somente leitura | Visualizar dados |

### Headers Obrigatórios

Para endpoints que requerem autenticação, os seguintes parâmetros devem ser enviados:

```json
{
  "userId": "uuid-do-usuario",
  "tenantId": "uuid-do-tenant"
}
```

## Endpoints

### Health Check

#### GET /health

Verifica o status do servidor.

**Autenticação:** Não requerida

**Resposta de Sucesso (200):**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-30T17:00:00.000Z",
  "uptime": 1234.56
}
```

**Exemplo cURL:**

```bash
curl http://localhost:3001/health
```

---

### Appointments

#### POST /api/appointments

Cria um novo agendamento e opcionalmente sincroniza com Google Calendar.

**Autenticação:** Requerida

**Permissão necessária:** `appointments.create`

**Request Body:**

```json
{
  "userId": "uuid-usuario",
  "tenantId": "uuid-tenant",
  "appointment": {
    "id": "uuid-agendamento",
    "customerName": "João Silva",
    "phoneNumber": "11999999999",
    "serviceId": "uuid-servico",
    "serviceName": "Corte de Cabelo",
    "date": "2026-02-15T14:30:00.000Z",
    "status": "confirmed",
    "value": 50.00
  }
}
```

**Resposta de Sucesso (200):**

```json
{
  "appointment": {
    "id": "uuid-agendamento",
    "tenant_id": "uuid-tenant",
    "cliente_nome": "João Silva",
    "cliente_fone": "11999999999",
    "servico_id": "uuid-servico",
    "servico_nome": "Corte de Cabelo",
    "data_hora": "2026-02-15T14:30:00.000Z",
    "status": "confirmed",
    "valor": 50.00,
    "google_calendar_event_id": "abc123xyz",
    "google_calendar_synced": true,
    "google_calendar_sync_error": null,
    "created_at": "2026-01-30T17:00:00.000Z"
  },
  "googleCalendarSynced": true
}
```

**Códigos de Erro:**

- `401` - Autenticação requerida
- `403` - Sem permissão
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "tenantId": "tenant-456",
    "appointment": {
      "id": "appt-789",
      "customerName": "João Silva",
      "phoneNumber": "11999999999",
      "serviceId": "svc-101",
      "serviceName": "Corte de Cabelo",
      "date": "2026-02-15T14:30:00.000Z",
      "status": "confirmed",
      "value": 50.00
    }
  }'
```

---

#### GET /api/appointments/:tenantId

Recupera todos os agendamentos de um tenant.

**Autenticação:** Requerida

**Permissão necessária:** `appointments.read`

**Query Parameters:**

- `userId` (string, obrigatório) - ID do usuário autenticado

**Resposta de Sucesso (200):**

```json
{
  "appointments": [
    {
      "id": "uuid-agendamento",
      "tenant_id": "uuid-tenant",
      "cliente_nome": "João Silva",
      "cliente_fone": "11999999999",
      "servico_nome": "Corte de Cabelo",
      "data_hora": "2026-02-15T14:30:00.000Z",
      "status": "confirmed",
      "valor": 50.00,
      "google_calendar_synced": true,
      "created_at": "2026-01-30T17:00:00.000Z"
    }
  ]
}
```

**Códigos de Erro:**

- `401` - Autenticação requerida
- `403` - Sem permissão
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl "http://localhost:3001/api/appointments/tenant-456?userId=user-123"
```

---

#### DELETE /api/appointments/:id

Deleta um agendamento e remove do Google Calendar se sincronizado.

**Autenticação:** Requerida

**Permissão necessária:** `appointments.delete`

**Query Parameters:**

- `userId` (string, obrigatório) - ID do usuário autenticado
- `tenantId` (string, obrigatório) - ID do tenant

**Resposta de Sucesso (200):**

```json
{
  "success": true
}
```

**Resposta de Sucesso Parcial (207):**

```json
{
  "success": true,
  "warning": "Appointment deleted but Google Calendar sync failed",
  "error": "Failed to delete calendar event"
}
```

**Códigos de Erro:**

- `401` - Autenticação requerida
- `403` - Sem permissão
- `404` - Agendamento não encontrado
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl -X DELETE "http://localhost:3001/api/appointments/appt-789?userId=user-123&tenantId=tenant-456"
```

---

### Calendar

#### GET /api/calendar/auth-url

Gera URL de autorização OAuth do Google Calendar.

**Autenticação:** Não requerida

**Resposta de Sucesso (200):**

```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

**Exemplo cURL:**

```bash
curl http://localhost:3001/api/calendar/auth-url
```

---

#### POST /api/calendar/oauth-callback

Processa o callback OAuth e salva tokens criptografados.

**Autenticação:** Não requerida

**Rate Limit:** 10 requisições por 15 minutos por IP

**Request Body:**

```json
{
  "code": "codigo-de-autorizacao-do-google",
  "tenantId": "uuid-tenant"
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Google Calendar connected successfully"
}
```

**Códigos de Erro:**

- `400` - Código ou tenantId ausente/inválido
- `404` - Tenant não encontrado
- `429` - Muitas requisições (rate limit)
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/calendar/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AfJohXmKc...",
    "tenantId": "tenant-456"
  }'
```

---

#### POST /api/calendar/check-availability

Verifica disponibilidade no Google Calendar.

**Autenticação:** Não requerida (usa token do tenant)

**Request Body:**

```json
{
  "tenantId": "uuid-tenant",
  "startTime": "2026-02-15T14:30:00.000Z",
  "endTime": "2026-02-15T15:30:00.000Z"
}
```

**Resposta de Sucesso (200):**

```json
{
  "isAvailable": true
}
```

**Códigos de Erro:**

- `400` - Google Calendar não conectado
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/calendar/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-456",
    "startTime": "2026-02-15T14:30:00.000Z",
    "endTime": "2026-02-15T15:30:00.000Z"
  }'
```

---

#### POST /api/calendar/disconnect

Desconecta o Google Calendar do tenant.

**Autenticação:** Não requerida

**Request Body:**

```json
{
  "tenantId": "uuid-tenant"
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Google Calendar disconnected"
}
```

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/calendar/disconnect \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "tenant-456"}'
```

---

### Authentication

#### GET /api/auth/user/:userId

Recupera informações do usuário com permissões.

**Autenticação:** Não requerida (endpoint público para verificação)

**Resposta de Sucesso (200):**

```json
{
  "user": {
    "id": "uuid-usuario",
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "tenantId": "uuid-tenant",
    "roleId": "uuid-role",
    "roleName": "manager",
    "isActive": true,
    "permissions": [
      "appointments.create",
      "appointments.read",
      "appointments.update",
      "appointments.delete"
    ]
  }
}
```

**Códigos de Erro:**

- `404` - Usuário não encontrado
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl http://localhost:3001/api/auth/user/user-123
```

---

#### POST /api/auth/check-permission

Verifica se um usuário tem uma permissão específica.

**Autenticação:** Não requerida

**Request Body:**

```json
{
  "userId": "uuid-usuario",
  "permission": {
    "resource": "appointments",
    "action": "create"
  }
}
```

**Resposta de Sucesso (200):**

```json
{
  "hasPermission": true
}
```

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/auth/check-permission \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "permission": {
      "resource": "appointments",
      "action": "create"
    }
  }'
```

---

#### GET /api/auth/roles

Lista todas as funções disponíveis no sistema.

**Autenticação:** Não requerida

**Resposta de Sucesso (200):**

```json
{
  "roles": [
    {
      "id": "uuid-role-1",
      "name": "admin",
      "description": "Administrador do sistema"
    },
    {
      "id": "uuid-role-2",
      "name": "manager",
      "description": "Gerente"
    },
    {
      "id": "uuid-role-3",
      "name": "staff",
      "description": "Equipe"
    }
  ]
}
```

**Exemplo cURL:**

```bash
curl http://localhost:3001/api/auth/roles
```

---

#### POST /api/auth/users

Cria um novo usuário no sistema.

**Autenticação:** Requerida

**Permissão necessária:** `users.create`

**Request Body:**

```json
{
  "email": "novousuario@example.com",
  "name": "Novo Usuário",
  "tenantId": "uuid-tenant",
  "roleId": "uuid-role",
  "createdByUserId": "uuid-usuario-criador"
}
```

**Resposta de Sucesso (201):**

```json
{
  "user": {
    "id": "uuid-novo-usuario",
    "email": "novousuario@example.com",
    "name": "Novo Usuário",
    "tenantId": "uuid-tenant",
    "roleId": "uuid-role",
    "roleName": "staff",
    "isActive": true,
    "permissions": ["appointments.read"]
  }
}
```

**Códigos de Erro:**

- `403` - Sem permissão ou falha na criação
- `500` - Erro no servidor

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novousuario@example.com",
    "name": "Novo Usuário",
    "tenantId": "tenant-456",
    "roleId": "role-789",
    "createdByUserId": "user-123"
  }'
```

---

#### POST /api/auth/login

Registra um evento de login para auditoria.

**Autenticação:** Não requerida

**Request Body:**

```json
{
  "userId": "uuid-usuario",
  "tenantId": "uuid-tenant",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true
}
```

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "tenantId": "tenant-456",
    "ipAddress": "192.168.1.1",
    "userAgent": "curl/7.68.0"
  }'
```

---

## Modelos de Dados

### Appointment (Agendamento)

```typescript
{
  id: string;                      // UUID do agendamento
  tenant_id: string;               // UUID do tenant
  cliente_nome: string;            // Nome do cliente
  cliente_fone: string;            // Telefone do cliente
  servico_id: string;              // UUID do serviço
  servico_nome: string;            // Nome do serviço
  data_hora: string;               // Data/hora ISO 8601
  status: string;                  // confirmed, pending, cancelled
  valor: number;                   // Valor do serviço
  google_calendar_event_id: string | null;  // ID do evento no Google Calendar
  google_calendar_synced: boolean; // Se está sincronizado
  google_calendar_sync_error: string | null; // Erro de sincronização
  created_at: string;              // Data de criação
  updated_at: string;              // Data de atualização
}
```

### User (Usuário)

```typescript
{
  id: string;           // UUID do usuário
  email: string;        // Email do usuário
  name: string;         // Nome do usuário
  tenantId: string;     // UUID do tenant
  roleId: string;       // UUID da função
  roleName: string;     // Nome da função (admin, manager, etc.)
  isActive: boolean;    // Se o usuário está ativo
  permissions: string[]; // Lista de permissões
}
```

### Role (Função)

```typescript
{
  id: string;          // UUID da função
  name: string;        // Nome da função
  description: string; // Descrição da função
}
```

### Permission (Permissão)

```typescript
{
  id: string;          // UUID da permissão
  name: string;        // Nome da permissão (ex: appointments.create)
  resource: string;    // Recurso (ex: appointments)
  action: string;      // Ação (create, read, update, delete)
  description: string; // Descrição da permissão
}
```

---

## Códigos de Status

| Código | Descrição | Uso |
|--------|-----------|-----|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 207 | Multi-Status | Sucesso parcial (ex: agendamento deletado mas falha no Google Calendar) |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Autenticação requerida |
| 403 | Forbidden | Sem permissão para acessar o recurso |
| 404 | Not Found | Recurso não encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro no servidor |

---

## Exemplos de Uso

### Fluxo Completo: Criar Agendamento com Google Calendar

#### 1. Conectar Google Calendar

```bash
# Obter URL de autorização
curl http://localhost:3001/api/calendar/auth-url

# Usuário autoriza no navegador e retorna com código

# Salvar tokens
curl -X POST http://localhost:3001/api/calendar/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AfJohXmKc...",
    "tenantId": "tenant-456"
  }'
```

#### 2. Verificar Disponibilidade

```bash
curl -X POST http://localhost:3001/api/calendar/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-456",
    "startTime": "2026-02-15T14:30:00.000Z",
    "endTime": "2026-02-15T15:30:00.000Z"
  }'
```

#### 3. Criar Agendamento

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "tenantId": "tenant-456",
    "appointment": {
      "id": "appt-789",
      "customerName": "João Silva",
      "phoneNumber": "11999999999",
      "serviceId": "svc-101",
      "serviceName": "Corte de Cabelo",
      "date": "2026-02-15T14:30:00.000Z",
      "status": "confirmed",
      "value": 50.00
    }
  }'
```

#### 4. Listar Agendamentos

```bash
curl "http://localhost:3001/api/appointments/tenant-456?userId=user-123"
```

### Fluxo de Gerenciamento de Usuários

#### 1. Obter Informações do Usuário

```bash
curl http://localhost:3001/api/auth/user/user-123
```

#### 2. Verificar Permissão

```bash
curl -X POST http://localhost:3001/api/auth/check-permission \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "permission": {
      "resource": "users",
      "action": "create"
    }
  }'
```

#### 3. Criar Novo Usuário

```bash
curl -X POST http://localhost:3001/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novousuario@example.com",
    "name": "Novo Usuário",
    "tenantId": "tenant-456",
    "roleId": "role-staff",
    "createdByUserId": "user-123"
  }'
```

---

## Notas de Segurança

1. **Tokens OAuth**: Todos os tokens OAuth são criptografados com AES-256-GCM antes de serem armazenados
2. **HTTPS**: Em produção, sempre use HTTPS para proteger dados em trânsito
3. **Rate Limiting**: Endpoints OAuth têm rate limiting de 10 requisições por 15 minutos
4. **Isolamento Multi-tenant**: Todos os dados são isolados por tenant
5. **Logs de Auditoria**: Todas as ações críticas são registradas em logs de auditoria

---

## Suporte e Contato

Para questões ou problemas com a API:
- Consulte os logs do servidor
- Verifique os códigos de status HTTP
- Revise esta documentação
- Consulte os comentários no código fonte

---

**Última atualização:** 30 de Janeiro de 2026  
**Versão:** 1.0.0
