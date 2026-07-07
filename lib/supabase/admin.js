import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    return null;
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function requireServiceRoleClient() {
  const client = createServiceRoleClient();

  if (!client) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in server environment');
  }

  return client;
}
