-- Migração: Adicionar campos do Painel de Treino
-- Data: 2026-01-27
-- Descrição: Adiciona colunas para BusinessConfig e cria tabela services

-- 1. Adicionar colunas faltantes na tabela tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS link_maps TEXT,
ADD COLUMN IF NOT EXISTS horario_funcionamento TEXT DEFAULT 'Seg a Sex, 09h às 18h',
ADD COLUMN IF NOT EXISTS politica_cancelamento TEXT DEFAULT 'Cancelamento com 24h de antecedência',
ADD COLUMN IF NOT EXISTS tempo_minimo_antecedencia INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS promocao_ativa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promocao_descricao TEXT,
ADD COLUMN IF NOT EXISTS promocao_imagem TEXT,
ADD COLUMN IF NOT EXISTS promocao_cta TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- 4. Atualizar tenant de teste com dados iniciais
UPDATE tenants 
SET 
  endereco = 'Av. Paulista, 1000 - São Paulo',
  link_maps = 'https://goo.gl/maps/shine',
  horario_funcionamento = 'Seg a Sáb, 08h-20h',
  politica_cancelamento = 'Cancelamento com 24h de antecedência',
  tempo_minimo_antecedencia = 60,
  promocao_ativa = false,
  promocao_descricao = '',
  promocao_cta = ''
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Inserir serviços de exemplo para o tenant de teste
INSERT INTO services (id, tenant_id, nome, preco, duracao_minutos)
VALUES 
  ('service_1', '550e8400-e29b-41d4-a716-446655440000', 'Corte Feminino', 120.00, 60),
  ('service_2', '550e8400-e29b-41d4-a716-446655440000', 'Escova Modelada', 80.00, 45)
ON CONFLICT (id) DO NOTHING;

-- Comentário: Migração completa! Agora o Painel de Treino pode salvar dados.
