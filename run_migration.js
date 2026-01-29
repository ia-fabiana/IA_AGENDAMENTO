// Script para executar migração no Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('❌ Erro: SUPABASE_URL não configurada');
  console.error('Por favor, configure a variável de ambiente SUPABASE_URL antes de executar este script.');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_KEY não configurada');
  console.error('Por favor, configure a variável de ambiente SUPABASE_SERVICE_KEY antes de executar este script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Iniciando migração...\n');

  try {
    // 1. Adicionar colunas na tabela tenants (via ALTER TABLE não funciona via RPC, então vamos usar o SQL direto)
    console.log('📝 Executando SQL via RPC...');
    
    const migrationSQL = fs.readFileSync('migration_add_training_fields.sql', 'utf8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      throw error;
    }

    console.log('✅ Migração executada com sucesso!');
    console.log('📊 Resultado:', data);

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

runMigration();
