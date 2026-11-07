import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Auto-resolve .env from server/ directory or workspace root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Checks whether valid Supabase credentials exist in the environment
 */
export const isSupabaseConfigured = () => {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  )?.trim();

  return Boolean(
    url &&
      key &&
      url.startsWith('https://') &&
      !url.includes('<your-project-id>') &&
      !url.includes('your-project-id')
  );
};

let clientInstance = null;

/**
 * Returns a singleton instance of the Supabase Client
 */
export function getSupabase() {
  if (clientInstance) return clientInstance;
  if (!isSupabaseConfigured()) return null;

  const url = process.env.SUPABASE_URL.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  ).trim();

  clientInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return clientInstance;
}

/**
 * Proxy export so existing `supabase.from(...)` queries execute seamlessly
 */
export const supabase = new Proxy(
  {},
  {
    get(target, prop) {
      const client = getSupabase();
      if (!client) {
        throw new Error(
          'Supabase client is not configured. Vui lòng kiểm tra SUPABASE_URL và SUPABASE_ANON_KEY trong file server/.env'
        );
      }
      return client[prop];
    },
  }
);
