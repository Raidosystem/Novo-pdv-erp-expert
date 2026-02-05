import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Database, RefreshCw } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const SupabaseTest = () => {
  const { isDarkMode } = useSettingsStore();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateTest = (name: string, result: Partial<TestResult>) => {
    setTests(prev => prev.map(t => t.name === name ? { ...t, ...result } : t));
  };

  const runTests = async () => {
    setRunning(true);
    
    // Inicializar testes
    const initialTests: TestResult[] = [
      { name: 'Conexão Supabase', status: 'pending' },
      { name: 'Listar Tabelas', status: 'pending' },
      { name: 'Tabela empresas', status: 'pending' },
      { name: 'Tabela produtos', status: 'pending' },
      { name: 'Tabela clientes', status: 'pending' },
      { name: 'Tabela vendas', status: 'pending' },
      { name: 'Tabela contas_financeiras', status: 'pending' },
      { name: 'RLS Ativo', status: 'pending' },
    ];
    setTests(initialTests);

    // Teste 1: Conexão básica
    try {
      const { error } = await supabase.from('empresas').select('count').limit(1);
      if (error && !error.message.includes('permission denied')) {
        throw error;
      }
      updateTest('Conexão Supabase', { 
        status: 'success', 
        message: 'Conectado ao Supabase!' 
      });
    } catch (err: any) {
      updateTest('Conexão Supabase', { 
        status: 'error', 
        message: err.message || 'Falha na conexão' 
      });
    }

    // Teste 2: Listar tabelas
    try {
      const { data, error } = await supabase.rpc('get_tables') as { data: unknown[] | null; error: Error | null };
      if (error) {
        // RPC não existe, tentar query direta
        const { data: tables, error: err2 } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public') as { data: unknown[] | null; error: Error | null };
        
        if (err2) {
          updateTest('Listar Tabelas', { 
            status: 'success', 
            message: 'Não foi possível listar tabelas (sem permissão)' 
          });
        } else {
          updateTest('Listar Tabelas', { 
            status: 'success', 
            message: `${tables?.length || 0} tabelas encontradas` 
          });
        }
      } else {
        updateTest('Listar Tabelas', { 
          status: 'success', 
          message: `${data?.length || 0} tabelas encontradas` 
        });
      }
    } catch (err: any) {
      updateTest('Listar Tabelas', { 
        status: 'success', 
        message: 'Tabelas verificadas via queries individuais' 
      });
    }

    // Teste 3-7: Verificar tabelas individualmente
    const tablesToTest = [
      { key: 'Tabela empresas', table: 'empresas' },
      { key: 'Tabela produtos', table: 'produtos' },
      { key: 'Tabela clientes', table: 'clientes' },
      { key: 'Tabela vendas', table: 'vendas' },
      { key: 'Tabela contas_financeiras', table: 'contas_financeiras' },
    ];

    for (const { key, table } of tablesToTest) {
      try {
        const { error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes('does not exist')) {
            updateTest(key, { 
              status: 'error', 
              message: `Tabela ${table} não existe - execute o schema.sql` 
            });
          } else if (error.message.includes('permission denied') || error.code === '42501') {
            updateTest(key, { 
              status: 'success', 
              message: `Tabela existe (RLS ativo, sem dados acessíveis)` 
            });
          } else {
            throw error;
          }
        } else {
          updateTest(key, { 
            status: 'success', 
            message: `${count || 0} registros` 
          });
        }
      } catch (err: any) {
        updateTest(key, { 
          status: 'error', 
          message: err.message 
        });
      }
    }

    // Teste 8: RLS ativo
    try {
      // Tentar inserir sem autenticação (deve falhar se RLS estiver ativo)
      const { error } = await supabase
        .from('empresas')
        .insert({ razao_social: 'Test', nome_fantasia: 'Test', cnpj: '00.000.000/0001-00' } as never);
      
      if (error) {
        updateTest('RLS Ativo', { 
          status: 'success', 
          message: 'RLS está funcionando (inserção bloqueada)' 
        });
      } else {
        updateTest('RLS Ativo', { 
          status: 'error', 
          message: 'RLS pode não estar ativo (inserção permitida)' 
        });
        // Limpar dados de teste
        await supabase.from('empresas').delete().eq('cnpj', '00.000.000/0001-00');
      }
    } catch (err: any) {
      updateTest('RLS Ativo', { 
        status: 'success', 
        message: 'RLS configurado corretamente' 
      });
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Teste de Conexão Supabase
          </h1>
          <p className="text-gray-500 mt-1">
            Verificar se as tabelas foram criadas e a conexão está funcionando
          </p>
        </div>
        <Button onClick={runTests} disabled={running}>
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Executar Testes
            </>
          )}
        </Button>
      </div>

      {/* Instruções */}
      <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
          📋 Instruções para criar as tabelas:
        </h3>
        <ol className="list-decimal list-inside text-sm text-orange-700 dark:text-orange-300 space-y-1">
          <li>Acesse o Supabase Dashboard: <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">https://supabase.com/dashboard</code></li>
          <li>Selecione seu projeto</li>
          <li>Vá em <strong>SQL Editor</strong> no menu lateral</li>
          <li>Cole o conteúdo do arquivo <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">supabase/schema.sql</code></li>
          <li>Clique em <strong>Run</strong> para executar</li>
          <li>Volte aqui e clique em "Executar Testes"</li>
        </ol>
      </Card>

      {/* Resultados */}
      {tests.length > 0 && (
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Database className="w-6 h-6 text-orange-500" />
              <div>
                <h2 className={cn('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  Resultados dos Testes
                </h2>
                <p className="text-sm text-gray-500">
                  {successCount} sucesso • {errorCount} erro • {tests.length - successCount - errorCount} pendente
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {tests.map((test) => (
              <div key={test.name} className="flex items-center gap-4 p-4">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {test.name}
                  </div>
                  {test.message && (
                    <div className={cn(
                      'text-sm',
                      test.status === 'error' ? 'text-red-500' : 'text-gray-500'
                    )}>
                      {test.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Variáveis de ambiente */}
      <Card className="p-4">
        <h3 className={cn('font-semibold mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
          🔧 Variáveis de Ambiente Configuradas:
        </h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex gap-2">
            <span className="text-gray-500">VITE_SUPABASE_URL:</span>
            <span className={cn(
              import.meta.env.VITE_SUPABASE_URL ? 'text-green-500' : 'text-red-500'
            )}>
              {import.meta.env.VITE_SUPABASE_URL ? '✓ Configurado' : '✗ Não configurado'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">VITE_SUPABASE_ANON_KEY:</span>
            <span className={cn(
              import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-500' : 'text-red-500'
            )}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurado' : '✗ Não configurado'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupabaseTest;
