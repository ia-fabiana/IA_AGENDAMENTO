
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are properly configured (not placeholder values)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project');
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your-');

if (!isValidUrl || !isValidKey) {
  console.error('⚠️  Supabase credentials not configured!');
  console.error('Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('See .env.example for reference');
}

// Use dummy values to prevent createClient from throwing an error
// This allows the app to show a proper error page instead of crashing
const safeUrl = isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isValidKey ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

export const supabase = createClient(safeUrl, safeKey);
