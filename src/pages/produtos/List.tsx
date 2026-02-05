import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Package, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button, Card, Input, Table, StatusChip, Modal } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useProdutos, useProdutoMutations } from '@/hooks';
import type { Produto } from '@/services';

const categories = ['Todas', 'Bebidas', 'Padaria', 'Laticínios', 'Mercearia', 'Outros'];

export const ProductsList = () => {
  const navigate = useNavigate();
  const { isDarkMode, isDense } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  // Hook de dados reais
  const filters = useMemo(() => ({
    search: search || undefined,
    categoria_id: selectedCategory !== 'Todas' ? selectedCategory : undefined,
    ativo: true,
  }), [search, selectedCategory]);
  
  const { data: produtos, loading, total, refetch } = useProdutos(filters);
  const { delete: deleteMutation } = useProdutoMutations();

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteMutation.mutate(deleteModal);
      setDeleteModal(null);
      refetch();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const getStatus = (produto: Produto) => {
    if (!produto.ativo) return 'inactive';
    if (produto.estoque_atual <= produto.estoque_minimo) return 'low_stock';
    return 'active';
  };

  const columns = [
    {
      key: 'name',
      header: 'Produto',
      render: (product: Produto) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          )}>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {product.nome}
            </div>
            <div className="text-sm text-gray-500">{product.codigo_barras || product.codigo}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'category', 
      header: 'Categoria',
      render: (product: Produto) => product.categoria?.nome || '-',
    },
    {
      key: 'price',
      header: 'Preço',
      render: (product: Produto) => (
        <span className="font-semibold text-orange-500">{formatCurrency(product.preco_venda)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Estoque',
      render: (product: Produto) => (
        <span className={cn(
          'font-medium',
          product.estoque_atual <= product.estoque_minimo ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'
        )}>
          {product.estoque_atual} un
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Produto) => {
        const status = getStatus(product);
        return (
          <StatusChip
            label={
              status === 'active' ? 'Ativo' :
              status === 'low_stock' ? 'Estoque Baixo' : 'Inativo'
            }
            variant={
              status === 'active' ? 'success' :
              status === 'low_stock' ? 'warning' : 'neutral'
            }
          />
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (product: Produto) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/produtos/${product.id}`);
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
              setDeleteModal(product.id);
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
            Produtos
          </h1>
          <p className="text-gray-500 mt-1">
            {total} produtos cadastrados
          </p>
        </div>
        <Button onClick={() => navigate('/produtos/novo')}>
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {category}
              </button>
            ))}
          </div>
          <Button variant="ghost">
            <Filter className="w-4 h-4" />
            Mais Filtros
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
          data={produtos}
          onRowClick={(product) => navigate(`/produtos/${product.id}`)}
          dense={isDense}
        />
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onOpenChange={() => setDeleteModal(null)}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
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
          O produto será removido permanentemente do sistema.
        </p>
      </Modal>
    </div>
  );
};
