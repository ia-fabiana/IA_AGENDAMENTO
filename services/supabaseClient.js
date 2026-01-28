import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados. Funcionalidades do Supabase estarão limitadas.');
}

// Criar cliente Supabase com service_role key para bypass RLS
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente Supabase para operações com RLS (usando anon key)
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});
