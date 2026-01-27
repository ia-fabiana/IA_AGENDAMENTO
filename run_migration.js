// Script para executar migração no Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ztfnnzclwvycpbapbbhb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Zm5uemNsd3Z5Y3BiYXBiYmhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI2Mzk2MiwiZXhwIjoyMDg0ODM5OTYyfQ.aqjGNKB5vVOBnWcJqYvHqYQEUxDxMjGvQqOjqBYKx-A'; // Service role key

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
