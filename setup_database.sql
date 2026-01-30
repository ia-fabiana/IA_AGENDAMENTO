
-- Habilitar a extensão para UUIDs
create extension if not exists "pgcrypto";

-- Tabela de Tenants
create table if not exists tenants (
  id uuid default gen_random_uuid() primary key,
  nome_negocio text not null,
  whatsapp_oficial text,
  endereco text,
  link_maps text,
  horario_funcionamento text,
  politica_cancelamento text,
  antecedencia_minima integer default 2,
  config_promocao jsonb default '{"enabled": false, "description": "", "callToAction": ""}'::jsonb,
  plano text default 'Prata',
  saldo_creditos integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Serviços
create table if not exists servicos (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade not null,
  name text not null,
  price numeric(10,2) not null,
  duration integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Agendamentos
create table if not exists agendamentos (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade not null,
  cliente_nome text not null,
  cliente_fone text not null,
  servico_id uuid references servicos(id),
  servico_nome text,
  data_hora timestamp with time zone not null,
  status text default 'confirmed',
  valor numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Dados de Exemplo para o Tenant fixo (Estúdio Shine)
insert into tenants (id, nome_negocio, plano, saldo_creditos)
values ('550e8400-e29b-41d4-a716-446655440000', 'Estúdio Shine', 'Prata', 240)
on conflict (id) do nothing;

insert into servicos (tenant_id, name, price, duration)
values ('550e8400-e29b-41d4-a716-446655440000', 'Corte Feminino', 120.00, 60),
       ('550e8400-e29b-41d4-a716-446655440000', 'Escova Modelada', 80.00, 45)
on conflict do nothing;
