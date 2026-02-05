import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'fastpos-erp@1.0.0',
    },
  },
});

// Helper para definir empresa_id no JWT
export const setEmpresaId = async (empresaId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Atualizar claims do JWT com empresa_id
    await supabase.auth.updateUser({
      data: { empresa_id: empresaId },
    });
  }
};

// Helper para buscar empresa atual
export const getEmpresaAtual = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.empresa_id;
};
