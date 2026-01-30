
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gcuxxifospguidduapoo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vvy6JJ8O-Jrm1H6zSutDDw_uj-vY30A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
