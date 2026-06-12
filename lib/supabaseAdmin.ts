import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Configura NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  });
}
