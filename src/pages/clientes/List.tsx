import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Phone, Mail, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button, Card, Input, Table, StatusChip, Modal } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useClientes, useClienteMutations } from '@/hooks/useSupabase';
import type { Cliente } from '@/services';

export const ClientsList = () => {
  const navigate = useNavigate();
  const { isDarkMode, isDense } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  // Hooks para dados reais
  const { data: clientes, loading, refetch } = useClientes();
  const { delete: deleteMutation } = useClienteMutations();

  // Filtrar clientes
  const filteredClients = useMemo(() => {
    if (!clientes) return [];
    return clientes.filter((cliente: Cliente) =>
      cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      (cliente.documento && cliente.documento.includes(search)) ||
      (cliente.email && cliente.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [clientes, search]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    await deleteMutation.mutate(deleteModal);
    setDeleteModal(null);
    refetch();
  };

  const columns = [
    {
      key: 'nome',
      header: 'Cliente',
      render: (cliente: any) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
            'bg-gradient-to-br from-orange-400 to-orange-600'
          )}>
            {cliente.nome.charAt(0)}
          </div>
          <div>
            <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {cliente.nome}
            </div>
            <div className="text-sm text-gray-500">{cliente.documento || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contato',
      render: (cliente: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Mail className="w-3 h-3" />
            {cliente.email || '-'}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Phone className="w-3 h-3" />
            {cliente.telefone || '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'limite_credito',
      header: 'Limite Crédito',
      render: (cliente: any) => (
        <span className="font-semibold text-orange-500">
          {formatCurrency(cliente.limite_credito || 0)}
        </span>
      ),
    },
    { 
      key: 'created_at', 
      header: 'Cadastro',
      render: (cliente: any) => cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : '-'
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (cliente: any) => (
        <StatusChip
          label={cliente.ativo ? 'Ativo' : 'Inativo'}
          variant={cliente.ativo ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (cliente: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clientes/${cliente.id}`);
            }}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            )}
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal(cliente.id);
            }}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Clientes
          </h1>
          <p className="text-gray-500 mt-1">
            {loading ? '...' : `${clientes?.length || 0} clientes cadastrados`}
          </p>
        </div>
        <Button onClick={() => navigate('/clientes/novo')}>
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button variant="ghost">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredClients}
          onRowClick={(cliente) => navigate(`/clientes/${cliente.id}`)}
          dense={isDense}
        />
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onOpenChange={() => setDeleteModal(null)}
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={deleteMutation.loading}
            >
              {deleteMutation.loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      >
        <p className="text-gray-500">
          O cliente será removido permanentemente do sistema. Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
};
