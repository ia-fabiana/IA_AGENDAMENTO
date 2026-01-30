# 📋 Tarefas Pendentes - IA.AGENDAMENTOS

**Data da Análise**: 2026-01-30  
**Status do Projeto**: MVP em Desenvolvimento (UI 80% completa, Backend 40% completo)

---

## 🚨 CRÍTICO - Bloqueadores para Produção

### 1. Sistema de Pagamento (Mercado Pago)
**Arquivo**: `views/PlanAndCredits.tsx`

**Problemas**:
- ❌ Webhook `/api/mercado-pago/webhook` NÃO implementado
- ❌ Interface real do Mercado Pago Brick comentada (usando simulação)
- ❌ Verificação de pagamento é mock (timeout de 2.5s)
- ❌ Processamento de créditos no backend ausente
- ❌ Histórico de transações não implementado

**Ações Necessárias**:
```javascript
// Backend (server.js)
- [ ] Criar endpoint POST /api/mercado-pago/webhook
- [ ] Implementar validação de assinatura do webhook
- [ ] Processar eventos de pagamento aprovado
- [ ] Atualizar saldo_creditos na tabela tenants
- [ ] Criar tabela transactions para auditoria
```

```typescript
// Frontend (PlanAndCredits.tsx)
- [ ] Descomentar código real do Mercado Pago Brick
- [ ] Remover simulação de pagamento
- [ ] Adicionar variáveis de ambiente:
      - MERCADO_PAGO_PUBLIC_KEY
      - MERCADO_PAGO_ACCESS_TOKEN
```

**Impacto**: Sistema de créditos não funcional em produção

---

### 2. Integração IA - Function Calling Incompleto
**Arquivos**: `services/aiService.ts`, `services/geminiService.ts`

**Problemas**:
- ❌ Ferramentas declaradas mas não processadas:
  - `get_services` - sem handler implementado
  - `check_availability` - não consulta calendário real
  - `book_appointment` - apenas placeholder
- ❌ Contagem de tokens é aproximação simples: `(text.length) / 3.5`
- ❌ `functionCalls` retornados mas nunca executados

**Ações Necessárias**:
```typescript
// services/aiService.ts
- [ ] Implementar processamento de functionCalls
- [ ] Criar handler para get_services
- [ ] Integrar check_availability com Google Calendar
- [ ] Implementar book_appointment para criar evento real
- [ ] Adicionar loop de conversação para múltiplas chamadas
```

**Código de Exemplo**:
```typescript
// Processar functionCalls
if (functionCalls && functionCalls.length > 0) {
  for (const call of functionCalls) {
    if (call.name === 'book_appointment') {
      const result = await calendarService.createEvent({
        tenantId,
        summary: call.args.service,
        start: call.args.datetime,
        // ...
      });
      // Enviar resultado de volta para IA
    }
  }
}
```

**Impacto**: IA não consegue agendar compromissos automaticamente

---

### 3. Webhook WhatsApp Ausente
**Arquivo**: `services/evolutionService.ts`, `server.js`

**Problemas**:
- ❌ Endpoint para receber mensagens NÃO implementado
- ❌ Roteamento de mensagens para IA ausente
- ❌ Nenhuma lógica de processamento de webhook
- ❌ Falta configuração de webhook na Evolution API

**Ações Necessárias**:
```javascript
// server.js
- [ ] Criar POST /api/evolution/webhook
- [ ] Validar apikey nos headers
- [ ] Extrair número do remetente e mensagem
- [ ] Buscar tenantId baseado em instance
- [ ] Chamar aiService.processMessage()
- [ ] Enviar resposta via evolutionService.sendMessage()
```

```typescript
// services/evolutionService.ts
- [ ] Adicionar método setWebhook(instanceName, webhookUrl)
- [ ] Criar método sendMessage(to, message)
- [ ] Implementar tratamento de erros de envio
```

**Impacto**: WhatsApp não funciona para receber/responder mensagens

---

### 4. Admin Dashboard com Dados Hardcoded
**Arquivo**: `views/AdminDashboard.tsx`

**Problemas**:
- ❌ Todos os dados são mock:
  ```typescript
  totalTenants: 128,  // Hardcoded
  totalRevenue: 32450.00,  // Hardcoded
  activeInstances: 98,  // Hardcoded
  tenants: [ /* array mock */ ]
  ```
- ❌ Nenhuma chamada ao banco de dados
- ❌ Filtros e busca não funcionam

**Ações Necessárias**:
```typescript
// AdminDashboard.tsx
- [ ] Criar endpoint GET /api/admin/metrics
- [ ] Buscar tenants reais: SELECT * FROM tenants
- [ ] Calcular métricas reais:
      - COUNT(*) FROM tenants
      - SUM(valor) FROM transactions
      - Agendamentos por status
- [ ] Implementar filtros funcionais
- [ ] Adicionar paginação
```

**Impacto**: Dashboard administrativo inútil para gerenciar negócio

---

## 🔴 ALTA PRIORIDADE - Para Completar MVP

### 5. Controle de Acesso (RBAC) Ausente
**Arquivo**: `services/authService.ts` (Linha 22)

**Problema**:
```typescript
// Comentário no código: "Por enquanto, todos são admin"
return { isAuthenticated: true, isAdmin: true };
```

**Ações Necessárias**:
```typescript
- [ ] Criar tabela users com roles (admin, tenant_owner, viewer)
- [ ] Implementar verificação real de permissões
- [ ] Proteger rotas admin com middleware
- [ ] Adicionar autenticação via Supabase Auth
- [ ] Implementar Row Level Security (RLS) no banco
```

---

### 6. Google Calendar - Criação de Eventos
**Arquivos**: `services/calendarService.ts`, `services/calendarService.js`

**Problemas**:
- ⚠️ Dois arquivos diferentes (.ts e .js) - código duplicado
- ❌ Método `createEvent()` não implementado
- ❌ `checkAvailability()` retorna mock
- ❌ Renovação de token não testada

**Ações Necessárias**:
```typescript
// services/calendarService.ts
- [ ] Remover calendarService.js (usar apenas .ts)
- [ ] Implementar createEvent():
      - Buscar tokens do tenant
      - Criar evento no Google Calendar
      - Retornar confirmação
- [ ] Implementar checkAvailability():
      - Buscar eventos do dia
      - Comparar horários ocupados
      - Retornar slots disponíveis
- [ ] Testar renovação automática de tokens
```

---

### 7. Tratamento de Erros e Logging
**Múltiplos arquivos**

**Problemas**:
- ❌ Sem biblioteca de logging estruturado
- ❌ 100+ `console.log()` espalhados no código
- ❌ Catch blocks vazios em alguns serviços
- ❌ Sem rastreamento de erros (Sentry, etc.)

**Ações Necessárias**:
```bash
- [ ] Instalar winston ou pino para logging estruturado
- [ ] Criar logger.ts com níveis (debug, info, warn, error)
- [ ] Substituir console.log por logger.info()
- [ ] Adicionar error tracking (Sentry/LogRocket)
- [ ] Criar middleware de erro global no Express
```

---

### 8. Segurança - Encriptação de Tokens
**Arquivo**: `migrations/create_google_calendar_tokens.sql`

**Problema**:
- ❌ Tokens OAuth armazenados em texto plano
- ❌ `refresh_token` sem criptografia
- ❌ Risco de exposição em caso de breach

**Ações Necessárias**:
```typescript
- [ ] Instalar crypto ou lib de encriptação
- [ ] Criar serviço de criptografia:
      - encrypt(data, key)
      - decrypt(data, key)
- [ ] Armazenar encryption key em Secret Manager
- [ ] Migrar tokens existentes para formato criptografado
- [ ] Atualizar calendarService para descriptografar
```

---

## 🟡 MÉDIA PRIORIDADE - Estabilidade e Qualidade

### 9. Cobertura de Testes (0%)
**Status**: Nenhum teste automatizado

**Ações Necessárias**:
```bash
# Instalar dependências
- [ ] npm install --save-dev vitest @testing-library/react
- [ ] npm install --save-dev @testing-library/jest-dom
- [ ] npm install --save-dev @vitest/ui

# Criar testes unitários
- [ ] services/aiService.test.ts
- [ ] services/calendarService.test.ts
- [ ] services/evolutionService.test.ts
- [ ] services/trainingService.test.ts

# Criar testes de integração
- [ ] server.integration.test.js (endpoints)
- [ ] auth.integration.test.js (fluxo OAuth)

# Criar testes E2E
- [ ] flows/appointment.e2e.test.ts
- [ ] flows/payment.e2e.test.ts
```

**Cobertura Alvo**: Mínimo 60% para produção

---

### 10. Documentação da API
**Arquivo**: `API.md` (existe mas incompleto)

**Ações Necessárias**:
```markdown
- [ ] Documentar todos os endpoints:
      - GET /api/tenants/:id
      - POST /api/training/save
      - GET /auth/google/calendar
      - POST /api/mercado-pago/webhook
      - POST /api/evolution/webhook
- [ ] Adicionar exemplos de request/response
- [ ] Documentar códigos de erro
- [ ] Adicionar collection do Postman/Insomnia
- [ ] Gerar documentação com Swagger/OpenAPI
```

---

### 11. Limpeza de Código
**Problemas Identificados**:

```typescript
// Arquivos duplicados
- [ ] Remover: Connections_SIMPLIFICADO.tsx (usar Connections.tsx)
- [ ] Remover: calendarService.js (usar calendarService.ts)
- [ ] Remover: server_corrigido (1).js

// Código comentado
- [ ] Limpar código comentado em PlanAndCredits.tsx
- [ ] Remover comentários TODO resolvidos
- [ ] Remover console.log de debug

// Configuração
- [ ] Consolidar cloudbuild.yaml (remover cloudbuild_corrigido.yaml)
- [ ] Verificar se arquivos .zip e .tar.gz devem estar no repo
```

---

### 12. Validação de Entrada
**Múltiplos componentes**

**Problemas**:
- ❌ Formulários sem validação client-side
- ❌ Endpoints sem validação de body
- ❌ Sanitização de inputs ausente

**Ações Necessárias**:
```typescript
- [ ] Instalar: npm install joi express-validator
- [ ] Criar schemas de validação para:
      - Training data
      - Appointment data
      - Tenant creation
- [ ] Adicionar validação em todos os POST endpoints
- [ ] Sanitizar inputs antes de inserir no banco
```

---

## 🟢 BAIXA PRIORIDADE - Melhorias Futuras

### 13. Rate Limiting
```typescript
- [ ] Instalar express-rate-limit
- [ ] Proteger endpoints públicos:
      - /api/evolution/webhook (100 req/min)
      - /api/chat/simulate (50 req/min)
- [ ] Implementar rate limit por tenant
```

---

### 14. Monitoramento e Observabilidade
```typescript
- [ ] Adicionar métricas Prometheus
- [ ] Configurar dashboards Grafana
- [ ] Implementar health checks avançados
- [ ] Adicionar APM (Application Performance Monitoring)
```

---

### 15. Features Avançadas
```typescript
- [ ] Notificações em tempo real (WebSockets)
- [ ] Multi-idioma (i18n)
- [ ] Temas customizáveis por tenant
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Analytics avançado de conversas
```

---

### 16. Otimizações
```typescript
- [ ] Implementar cache Redis para:
      - Tokens do Google Calendar
      - Dados de treinamento
      - Métricas do dashboard
- [ ] Otimizar queries do banco:
      - Adicionar índices
      - Implementar paginação server-side
- [ ] Lazy loading de componentes React
- [ ] Code splitting no Vite
```

---

## 📊 Resumo Executivo

### Status Atual
| Categoria | Completo | Parcial | Não Iniciado |
|-----------|----------|---------|--------------|
| **UI/Frontend** | 80% | 15% | 5% |
| **Backend/API** | 30% | 40% | 30% |
| **Integrações** | 20% | 60% | 20% |
| **Testes** | 0% | 0% | 100% |
| **Documentação** | 40% | 30% | 30% |
| **Segurança** | 30% | 40% | 30% |
| **TOTAL** | **33%** | **31%** | **36%** |

---

### Estimativa de Esforço (Person-Days)

| Prioridade | Tarefas | Estimativa |
|------------|---------|------------|
| 🚨 **CRÍTICO** | 4 tarefas | 12-15 dias |
| 🔴 **ALTA** | 4 tarefas | 8-10 dias |
| 🟡 **MÉDIA** | 4 tarefas | 6-8 dias |
| 🟢 **BAIXA** | 4 tarefas | 4-6 dias |
| **TOTAL** | **16 tarefas** | **30-39 dias** |

---

### Roadmap Sugerido

#### Sprint 1 (2 semanas) - MVP Funcional
- ✅ Implementar webhook Mercado Pago
- ✅ Completar AI function calling
- ✅ Implementar webhook WhatsApp
- ✅ Dashboard com dados reais

**Entrega**: Sistema funcional para 1 cliente piloto

---

#### Sprint 2 (2 semanas) - Segurança e Estabilidade
- ✅ RBAC e autenticação
- ✅ Google Calendar completo
- ✅ Logging estruturado
- ✅ Encriptação de tokens

**Entrega**: Sistema pronto para beta testing

---

#### Sprint 3 (2 semanas) - Qualidade e Documentação
- ✅ Testes automatizados (60% cobertura)
- ✅ Documentação API completa
- ✅ Limpeza de código
- ✅ Validação de inputs

**Entrega**: Sistema production-ready

---

#### Sprint 4 (2 semanas) - Polimento
- ✅ Rate limiting
- ✅ Monitoramento
- ✅ Otimizações
- ✅ Features avançadas

**Entrega**: Sistema robusto e escalável

---

## 🎯 Próximos Passos Imediatos

### Esta Semana
1. ⚡ **Implementar webhook Mercado Pago** (2 dias)
2. ⚡ **Completar function calling da IA** (2 dias)
3. ⚡ **Implementar webhook WhatsApp** (1 dia)

### Próxima Semana
4. ⚡ **Dashboard com dados reais** (2 dias)
5. ⚡ **Implementar RBAC básico** (2 dias)
6. ⚡ **Google Calendar createEvent** (1 dia)

---

## 📝 Notas Importantes

### Decisões Pendentes
- [ ] Escolher biblioteca de logging (winston vs pino)
- [ ] Escolher solução de cache (Redis vs Memcached)
- [ ] Definir estratégia de backup do banco
- [ ] Escolher ferramenta de APM (Sentry vs New Relic)

### Dependências Externas
- ⚠️ **Credenciais Mercado Pago** - necessário para testes de pagamento
- ⚠️ **Instância Evolution API** - deve estar configurada e acessível
- ⚠️ **Google Cloud Project** - OAuth e Calendar API habilitados

### Riscos Identificados
- 🔴 **Alto**: Sistema de pagamento não testado em produção
- 🔴 **Alto**: Webhooks não implementados (bloqueio funcional)
- 🟡 **Médio**: Segurança de tokens precisa melhorar
- 🟡 **Médio**: Falta de testes pode causar regressões

---

## 📞 Contato e Suporte

Para priorizar tarefas ou discutir implementação:
1. Abra issue no GitHub com label `task-discussion`
2. Revise este documento com a equipe
3. Atualize prioridades conforme necessidades do negócio

---

**Última atualização**: 2026-01-30  
**Próxima revisão**: Após conclusão de cada sprint  
**Mantido por**: GitHub Copilot Agent
