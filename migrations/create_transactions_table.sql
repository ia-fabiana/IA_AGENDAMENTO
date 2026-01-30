-- Criar tabela de transações para histórico de pagamentos
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  external_id VARCHAR(255), -- ID do pagamento no Mercado Pago
  type VARCHAR(50) NOT NULL, -- 'credit_purchase', 'subscription', etc.
  amount DECIMAL(10, 2) NOT NULL,
  credits_added INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'rejected', 'refunded'
  payment_method VARCHAR(50), -- 'pix', 'credit_card', etc.
  metadata JSONB, -- Dados adicionais do pagamento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Comentários para documentação
COMMENT ON TABLE transactions IS 'Histórico de transações de pagamento dos tenants';
COMMENT ON COLUMN transactions.external_id IS 'ID do pagamento no gateway (Mercado Pago, etc.)';
COMMENT ON COLUMN transactions.metadata IS 'Dados JSON adicionais do pagamento (resposta completa do webhook)';
