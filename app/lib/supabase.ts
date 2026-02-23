import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xtrdlxzpdmszjhfrwhxz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GLweB8OUTU6L8IScnGpKng_Bf3ZuWvv';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client with service role (for server-side operations)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase;
