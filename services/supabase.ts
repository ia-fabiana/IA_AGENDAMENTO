
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ztfnnzclwvycpbapbbhb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Zm5uemNsd3Z5Y3BiYXBiYmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjM5NjIsImV4cCI6MjA4NDgzOTk2Mn0.j2J1E6xOQw_qKV4vY-FP0U_-ImmBqAWbzWGZ5hhcR1g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
