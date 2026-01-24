
-- Habilitar a extensão para UUIDs se necessário
create extension if not exists "pgcrypto";

-- Tabela de Tenants (Clientes/Salões)
create table tenants (
  id uuid default gen_random_uuid() primary key,
  nome_negocio text not null,
  plano text default 'Bronze' check (plano in ('Bronze', 'Prata', 'Ouro', 'Grátis')),
  saldo_creditos integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Agentes (Configuração de IA por Tenant)
create table agentes (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade not null,
  nome_agente text not null default 'Assistente',
  provider text not null check (provider in ('openai', 'gemini')) default 'gemini',
  model text not null default 'gemini-3-flash-preview',
  system_prompt text,
  temperature float default 0.7,
  max_tokens integer default 2048,
  openai_key text,
  bot_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(tenant_id) -- Cada tenant tem uma configuração principal
);

-- Tabela de Mensagens/Logs de Consumo
create table mensagens (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade not null,
  tokens_usados integer default 0,
  mensagem_in text,
  mensagem_out text,
  data timestamp with time zone default timezone('utc'::text, now())
);

-- Inserir um Tenant de teste (ID fixo para compatibilidade com o frontend atual)
insert into tenants (id, nome_negocio, plano, saldo_creditos)
values ('550e8400-e29b-41d4-a716-446655440000', 'Estúdio Shine', 'Prata', 150)
on conflict (id) do nothing;

-- Inserir configuração inicial do Agente para o Tenant de teste
insert into agentes (tenant_id, nome_agente, provider, model, system_prompt)
values ('550e8400-e29b-41d4-a716-446655440000', 'Sofia', 'gemini', 'gemini-3-flash-preview', 'Você é um assistente profissional da Estúdio Shine...')
on conflict (tenant_id) do nothing;
