import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getAdminSupabaseClient() {
  console.log('Creating admin Supabase client...');
  console.log('URL:', supabaseUrl);
  console.log('Service role key available:', !!supabaseServiceRoleKey);
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
