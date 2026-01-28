-- Migration: Create google_calendar_tokens table
-- Description: Armazena tokens OAuth do Google Calendar por tenant de forma persistente e segura
-- Created: 2026-01-27

-- Criar tabela para armazenar tokens OAuth do Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  -- Identificador único do registro
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ID do tenant (cliente) - relaciona com auth.users
  tenant_id UUID NOT NULL UNIQUE,
  
  -- Email da conta Google conectada
  google_email VARCHAR(255),
  
  -- Access Token (token de acesso temporário)
  access_token TEXT NOT NULL,
  
  -- Refresh Token (token para renovar o access_token)
  refresh_token TEXT NOT NULL,
  
  -- Tipo do token (geralmente "Bearer")
  token_type VARCHAR(50) DEFAULT 'Bearer',
  
  -- Data de expiração do access_token (timestamp Unix em ms)
  expiry_date BIGINT,
  
  -- Escopos autorizados (JSON array)
  scopes JSONB,
  
  -- Status da conexão
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps de auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  
  -- Metadados adicionais (opcional)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Foreign key para auth.users
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_google_tokens_tenant ON google_calendar_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_google_tokens_email ON google_calendar_tokens(google_email);
CREATE INDEX IF NOT EXISTS idx_google_tokens_active ON google_calendar_tokens(is_active) WHERE is_active = true;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_google_tokens_updated_at
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_tokens_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios tokens
CREATE POLICY "Users can view own tokens"
  ON google_calendar_tokens
  FOR SELECT
  USING (auth.uid() = tenant_id);

-- Policy: Usuários podem inserir seus próprios tokens
CREATE POLICY "Users can insert own tokens"
  ON google_calendar_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- Policy: Usuários podem atualizar seus próprios tokens
CREATE POLICY "Users can update own tokens"
  ON google_calendar_tokens
  FOR UPDATE
  USING (auth.uid() = tenant_id);

-- Policy: Usuários podem deletar seus próprios tokens
CREATE POLICY "Users can delete own tokens"
  ON google_calendar_tokens
  FOR DELETE
  USING (auth.uid() = tenant_id);

-- Comentários na tabela
COMMENT ON TABLE google_calendar_tokens IS 'Armazena tokens OAuth do Google Calendar por tenant';
COMMENT ON COLUMN google_calendar_tokens.tenant_id IS 'ID do tenant/cliente (FK para auth.users)';
COMMENT ON COLUMN google_calendar_tokens.access_token IS 'Token de acesso temporário do Google OAuth (expira em ~1h)';
COMMENT ON COLUMN google_calendar_tokens.refresh_token IS 'Token para renovar o access_token quando expirar';
COMMENT ON COLUMN google_calendar_tokens.expiry_date IS 'Timestamp Unix (ms) de expiração do access_token';
COMMENT ON COLUMN google_calendar_tokens.is_active IS 'Se a conexão com Google Calendar está ativa';
