import { createClient, SupabaseClient } from '@supabase/supabase-js';

const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return String(val).replace(/^["']|["']$/g, '').trim();
};

const resolveEnv = (...names: string[]): string => {
  for (const name of names) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        const val = cleanEnv((import.meta as any).env[name]);
        if (val) return val;
      }
    } catch {}

    try {
      if (typeof process !== 'undefined' && process.env) {
        const val = cleanEnv(process.env[name]);
        if (val) return val;
      }
    } catch {}
  }
  return '';
};

export const getSupabaseUrl = (): string => {
  return (
    resolveEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL') ||
    'https://lgbsktcikyyqcjrmyon.supabase.co'
  );
};

export const getSupabaseAnonKey = (): string => {
  return (
    resolveEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY') ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYnNrdGNpa3lxcXljanJteW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODA3MzMsImV4cCI6MjEwNTU1NjczM30.OKx1LjGE3wpxuaSrBZ6jBDUaTSYF7RD49SwFIq5SQ0U'
  );
};

export const isSupabaseConfigured = (): boolean => true;

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!clientInstance) {
    clientInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};
