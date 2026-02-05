import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthUser extends User {
  empresa_id?: string;
  nome?: string;
  perfil?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        if (session?.user) {
          // Buscar dados adicionais do usuário
          const userData = await fetchUserData(session.user.id);
          setUser({ ...session.user, ...userData });
        }
      } catch (error) {
        console.error('Erro ao buscar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          setUser({ ...session.user, ...userData });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Buscar dados adicionais do usuário na tabela usuarios
  const fetchUserData = async (userId: string): Promise<Partial<AuthUser>> => {
    try {
      // Timeout de 3 segundos para não travar se a tabela não existir
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      // Query simples sem JOIN - buscar só dados do usuário
      const queryPromise = supabase
        .from('usuarios')
        .select('empresa_id, nome, perfil_id')
        .eq('id', userId)
        .single();
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (!result || 'error' in result && result.error) {
        // Se não existir na tabela usuarios ou timeout, retornar dados básicos
        return { perfil: 'Administrador' }; // Todos são admin por padrão
      }
      
      const userData = (result as any).data;
      
      if (!userData) {
        return { perfil: 'Administrador' };
      }
      
      // Buscar nome do perfil separadamente se tiver perfil_id
      let perfilNome = 'Administrador';
      if (userData.perfil_id) {
        const { data: perfilData } = await supabase
          .from('perfis')
          .select('nome')
          .eq('id', userData.perfil_id)
          .single();
        perfilNome = (perfilData as { nome?: string } | null)?.nome || 'Administrador';
      }
      
      return {
        empresa_id: userData.empresa_id || undefined,
        nome: userData.nome,
        perfil: perfilNome,
      };
    } catch {
      // Em caso de erro, retornar perfil admin
      return { perfil: 'Administrador' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome },
        },
      });
      
      if (error) return { error };
      
      // Se o signup foi bem sucedido, criar registro na tabela usuarios
      if (data.user) {
        // Buscar empresa demo para associar
        const { data: empresaData } = await supabase
          .from('empresas')
          .select('id')
          .eq('cnpj', '00.000.000/0001-00')
          .single();
        
        if (empresaData) {
          const empresa = empresaData as { id: string };
          await supabase.from('usuarios').insert({
            id: data.user.id,
            empresa_id: empresa.id,
            email,
            nome,
            ativo: true,
            perfil_id: null as unknown as string, // Será atribuído depois
          } as never);
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
