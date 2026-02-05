import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface Usuario {
  id: string;
  empresa_id: string;
  email: string;
  nome: string;
  telefone?: string;
  cargo_id?: string;
  cargo?: {
    id: string;
    nome: string;
  };
  ativo: boolean;
  avatar_url?: string;
  ultimo_acesso?: string;
  created_at: string;
  updated_at: string;
}

export interface Cargo {
  id: string;
  empresa_id: string;
  nome: string;
  descricao?: string;
  nivel: number; // 1 = mais alto, 100 = mais baixo
  permissoes: string[];
  created_at: string;
}

export interface Permissao {
  modulo: string;
  acoes: ('visualizar' | 'criar' | 'editar' | 'excluir' | 'aprovar')[];
}

export interface CreateUsuario {
  email: string;
  senha: string;
  nome: string;
  telefone?: string;
  cargo_id?: string;
}

export interface UpdateUsuario {
  nome?: string;
  telefone?: string;
  cargo_id?: string;
  ativo?: boolean;
  avatar_url?: string;
}

export interface LoginInput {
  email: string;
  senha: string;
}

export interface AuditLog {
  id: string;
  empresa_id: string;
  usuario_id?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  acao: string;
  modulo: string;
  entidade_tipo?: string;
  entidade_id?: string;
  dados_anteriores?: Record<string, any>;
  dados_novos?: Record<string, any>;
  ip?: string;
  user_agent?: string;
  created_at: string;
}

// ========================================
// PERMISSÕES DISPONÍVEIS
// ========================================

export const MODULOS = [
  'dashboard',
  'pdv',
  'produtos',
  'estoque',
  'clientes',
  'vendas',
  'caixa',
  'financeiro',
  'contas_pagar',
  'contas_receber',
  'conciliacao',
  'relatorios',
  'usuarios',
  'configuracoes',
  'auditoria',
] as const;

export const ACOES = [
  'visualizar',
  'criar',
  'editar',
  'excluir',
  'aprovar',
] as const;

// ========================================
// AUTH SERVICE
// ========================================

export const authService = {
  // Login
  async login(input: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.senha,
    });

    if (error) throw error;

    // Atualizar último acesso
    if (data.user) {
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() } as never)
        .eq('id', data.user.id);

      // Registrar no audit log
      await auditService.registrar({
        acao: 'login',
        modulo: 'auth',
      });
    }

    return data;
  },

  // Logout
  async logout() {
    await auditService.registrar({
      acao: 'logout',
      modulo: 'auth',
    });

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Usuário atual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        cargo:cargos(id, nome, permissoes)
      `)
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Usuario & { cargo?: Cargo };
  },

  // Verificar sessão
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Recuperar senha
  async recuperarSenha(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return true;
  },

  // Alterar senha
  async alterarSenha(novaSenha: string) {
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });
    if (error) throw error;
    return true;
  },

  // Listener de auth state
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event: string, session: any) => {
      callback(session?.user || null);
    });
  },
};

// ========================================
// USUÁRIOS SERVICE
// ========================================

export const usuariosService = {
  // Listar usuários
  async getUsuarios(incluirInativos = false) {
    let query = supabase
      .from('usuarios')
      .select(`
        *,
        cargo:cargos(id, nome)
      `)
      .order('nome');

    if (!incluirInativos) {
      query = query.eq('ativo', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Usuario[];
  },

  // Buscar usuário por ID
  async getUsuarioById(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        cargo:cargos(id, nome, permissoes)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Usuario & { cargo?: Cargo };
  },

  // Criar usuário
  async createUsuario(input: CreateUsuario) {
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.senha,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Criar registro na tabela usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: input.email,
        nome: input.nome,
        telefone: input.telefone,
        cargo_id: input.cargo_id,
        ativo: true,
      } as never)
      .select()
      .single() as { data: { id: string } | null; error: Error | null };

    if (error) throw error;
    if (!data) throw new Error('Erro ao criar usuário');

    await auditService.registrar({
      acao: 'criar',
      modulo: 'usuarios',
      entidade_tipo: 'usuario',
      entidade_id: data.id,
      dados_novos: { email: input.email, nome: input.nome },
    });

    return data as Usuario;
  },

  // Atualizar usuário
  async updateUsuario(id: string, input: UpdateUsuario) {
    // Buscar dados atuais
    const { data: atualData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single() as { data: Record<string, any> | null };
    const atual = atualData || {};

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await auditService.registrar({
      acao: 'editar',
      modulo: 'usuarios',
      entidade_tipo: 'usuario',
      entidade_id: id,
      dados_anteriores: atual,
      dados_novos: input,
    });

    return data as Usuario;
  },

  // Desativar usuário
  async desativarUsuario(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ ativo: false } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await auditService.registrar({
      acao: 'desativar',
      modulo: 'usuarios',
      entidade_tipo: 'usuario',
      entidade_id: id,
    });

    return data as Usuario;
  },

  // Reativar usuário
  async reativarUsuario(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ ativo: true } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await auditService.registrar({
      acao: 'reativar',
      modulo: 'usuarios',
      entidade_tipo: 'usuario',
      entidade_id: id,
    });

    return data as Usuario;
  },
};

// ========================================
// CARGOS SERVICE
// ========================================

export const cargosService = {
  // Listar cargos
  async getCargos() {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('nivel');

    if (error) throw error;
    return data as Cargo[];
  },

  // Buscar cargo por ID
  async getCargoById(id: string) {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Cargo;
  },

  // Criar cargo
  async createCargo(input: {
    nome: string;
    descricao?: string;
    nivel?: number;
    permissoes: string[];
  }) {
    const { data, error } = await supabase
      .from('cargos')
      .insert({
        nome: input.nome,
        descricao: input.descricao,
        nivel: input.nivel || 50,
        permissoes: input.permissoes,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as Cargo;
  },

  // Atualizar cargo
  async updateCargo(id: string, input: Partial<Cargo>) {
    const { data, error } = await supabase
      .from('cargos')
      .update(input as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cargo;
  },

  // Deletar cargo
  async deleteCargo(id: string) {
    const { error } = await supabase
      .from('cargos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Verificar permissão
  async verificarPermissao(
    usuarioId: string, 
    modulo: string, 
    acao: string
  ): Promise<boolean> {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        cargo:cargos(permissoes)
      `)
      .eq('id', usuarioId)
      .single() as { data: { cargo: { permissoes: string[] } | null } | null; error: Error | null };

    if (error || !usuario?.cargo) return false;

    const permissaoNecessaria = `${modulo}:${acao}`;
    const permissaoModulo = `${modulo}:*`;
    const permissaoTotal = '*:*';

    const permissoes = usuario.cargo.permissoes || [];
    
    return permissoes.some((p: string) => 
      p === permissaoNecessaria || 
      p === permissaoModulo || 
      p === permissaoTotal
    );
  },
};

// ========================================
// AUDIT SERVICE
// ========================================

export const auditService = {
  // Registrar ação
  async registrar(input: {
    acao: string;
    modulo: string;
    entidade_tipo?: string;
    entidade_id?: string;
    dados_anteriores?: Record<string, any>;
    dados_novos?: Record<string, any>;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('audit_logs')
        .insert({
          usuario_id: user?.id,
          acao: input.acao,
          modulo: input.modulo,
          entidade_tipo: input.entidade_tipo,
          entidade_id: input.entidade_id,
          dados_anteriores: input.dados_anteriores,
          dados_novos: input.dados_novos,
        } as never);
    } catch (error) {
      // Não lançar erro para não interromper a operação principal
      console.error('Erro ao registrar audit log:', error);
    }
  },

  // Listar logs
  async getLogs(filters?: {
    usuario_id?: string;
    modulo?: string;
    acao?: string;
    data_inicio?: string;
    data_fim?: string;
    limite?: number;
  }) {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        usuario:usuarios(id, nome, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.usuario_id) {
      query = query.eq('usuario_id', filters.usuario_id);
    }

    if (filters?.modulo) {
      query = query.eq('modulo', filters.modulo);
    }

    if (filters?.acao) {
      query = query.eq('acao', filters.acao);
    }

    if (filters?.data_inicio) {
      query = query.gte('created_at', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('created_at', filters.data_fim);
    }

    query = query.limit(filters?.limite || 100);

    const { data, error } = await query;
    if (error) throw error;
    return data as AuditLog[];
  },

  // Logs de uma entidade específica
  async getLogsEntidade(entidadeTipo: string, entidadeId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        usuario:usuarios(id, nome, email)
      `)
      .eq('entidade_tipo', entidadeTipo)
      .eq('entidade_id', entidadeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AuditLog[];
  },

  // Módulos disponíveis
  getModulosDisponiveis() {
    return MODULOS;
  },

  // Ações disponíveis
  getAcoesDisponiveis() {
    return ACOES;
  },
};
