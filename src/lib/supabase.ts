import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Fallback values for Lovable Cloud (these are public/publishable keys)
const FALLBACK_SUPABASE_URL = 'https://vurwqyqfmgzljnmmzluy.supabase.co';
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cndxeXFmbWd6bGpubW16bHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDk3NzksImV4cCI6MjA4MTgyNTc3OX0.sVHiNuH9F8QIZaA-OptMJAlTp18Yv9Enatrdh8bo_ew';

// Lazy-initialized Supabase client
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (_supabase) {
    return _supabase;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_KEY;

  _supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _supabase;
}

// For backward compatibility - exports a getter that lazily initializes
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient<Database>];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
