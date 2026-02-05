import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Percent,
  ShoppingBag,
} from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

// Mock products
const mockProducts = [
  { id: '1', name: 'Coca-Cola 2L', price: 12.90, barcode: '7891234567890' },
  { id: '2', name: 'Pão Francês (kg)', price: 15.90, barcode: '7891234567891' },
  { id: '3', name: 'Leite Integral 1L', price: 6.50, barcode: '7891234567892' },
  { id: '4', name: 'Arroz 5kg', price: 28.90, barcode: '7891234567893' },
  { id: '5', name: 'Feijão 1kg', price: 8.50, barcode: '7891234567894' },
  { id: '6', name: 'Óleo de Soja 900ml', price: 9.90, barcode: '7891234567895' },
  { id: '7', name: 'Açúcar 1kg', price: 5.50, barcode: '7891234567896' },
  { id: '8', name: 'Café 500g', price: 18.90, barcode: '7891234567897' },
];

const paymentMethods = [
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'credito', label: 'Crédito', icon: CreditCard },
  { id: 'debito', label: 'Débito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: QrCode },
];

export const NewSale = () => {
  const { isDarkMode } = useSettingsStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'value'>('percent');
  
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    total,
    subtotal,
    discountAmount,
    setDiscount,
    itemsCount,
    paymentMethod,
    setPaymentMethod,
  } = useCart();

  // Auto-focus no campo de busca
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Event listeners para atalhos
  useEffect(() => {
    const handleFinalize = () => setShowPaymentModal(true);
    const handleDiscountEvent = () => setShowDiscountModal(true);
    const handleClear = () => clear();

    window.addEventListener('pdv:finalize', handleFinalize);
    window.addEventListener('pdv:discount', handleDiscountEvent);
    window.addEventListener('pdv:clear', handleClear);

    return () => {
      window.removeEventListener('pdv:finalize', handleFinalize);
      window.removeEventListener('pdv:discount', handleDiscountEvent);
      window.removeEventListener('pdv:clear', handleClear);
    };
  }, [clear]);

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      const product = mockProducts.find(
        (p) => p.barcode === searchQuery || p.name.toLowerCase() === searchQuery.toLowerCase()
      );
      if (product) {
        addItem(product);
        setSearchQuery('');
      }
    }
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (!isNaN(value) && value > 0) {
      setDiscount({ type: discountType, value });
      setShowDiscountModal(false);
      setDiscountValue('');
    }
  };

  const handleFinalizeSale = () => {
    // Aqui iria a lógica de finalização
    alert('Venda finalizada com sucesso!');
    clear();
    setShowPaymentModal(false);
  };

  return (
    <div className="grid grid-cols-5 gap-6 pb-20">
      {/* Coluna Esquerda - 60% */}
      <div className="col-span-3 space-y-4">
        {/* Campo de busca/scanner */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              ref={searchInputRef}
              data-search-input
              placeholder="Buscar produto ou escanear código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputSize="lg"
              leftIcon={<Search className="w-5 h-5" />}
              rightIcon={<Barcode className="w-5 h-5" />}
            />
          </div>
        </form>

        {/* Sugestões de produtos */}
        {searchQuery && (
          <Card padding="sm">
            <div className="space-y-1">
              {filteredProducts.slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    addItem(product);
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    )}>
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">{product.barcode}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-orange-500">
                    {formatCurrency(product.price)}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Lista de itens do carrinho */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn('text-lg font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              Itens da Venda
            </h2>
            <span className="text-sm text-gray-500">{itemsCount} itens</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item adicionado</p>
              <p className="text-sm">Use o campo acima para buscar produtos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border',
                    isDarkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    )}>
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.price)} / un
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={cn(
                          'p-1 rounded-lg transition-colors',
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        )}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={cn(
                        'w-8 text-center font-semibold',
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      )}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={cn(
                          'p-1 rounded-lg transition-colors',
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        )}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className={cn('w-24 text-right font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Coluna Direita - 40% */}
      <div className="col-span-2 space-y-4">
        {/* Total */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-green-500">
                <span>Desconto</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className={cn(
              'border-t pt-4',
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            )}>
              <div className="flex items-center justify-between">
                <span className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  Total
                </span>
                <span className="text-3xl font-bold text-orange-500">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Cliente */}
        <Card>
          <button className={cn(
            'w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-colors',
            isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
          )}>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            )}>
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-left">
              <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Adicionar Cliente
              </div>
              <div className="text-sm text-gray-500">Clique para selecionar</div>
            </div>
          </button>
        </Card>

        {/* Forma de Pagamento */}
        <Card>
          <h3 className={cn('font-semibold mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Forma de Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                  paymentMethod === method.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : isDarkMode
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <method.icon className={cn(
                  'w-5 h-5',
                  paymentMethod === method.id ? 'text-orange-500' : 'text-gray-400'
                )} />
                <span className={cn(
                  'font-medium',
                  paymentMethod === method.id
                    ? 'text-orange-500'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            fullWidth
            size="lg"
            onClick={() => setShowPaymentModal(true)}
            disabled={items.length === 0}
          >
            Finalizar Venda (F4)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDiscountModal(true)}
              disabled={items.length === 0}
            >
              <Percent className="w-4 h-4" />
              Desconto (F6)
            </Button>
            <Button variant="ghost" onClick={clear} disabled={items.length === 0}>
              <Trash2 className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Modal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        title="Finalizar Venda"
        description="Confirme os dados da venda"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFinalizeSale}>
              Confirmar Pagamento
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={cn(
            'p-4 rounded-xl',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500">Total a Pagar</span>
              <span className="text-2xl font-bold text-orange-500">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {itemsCount} itens • Pagamento: {paymentMethods.find(m => m.id === paymentMethod)?.label}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Desconto */}
      <Modal
        open={showDiscountModal}
        onOpenChange={setShowDiscountModal}
        title="Aplicar Desconto"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDiscountModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyDiscount}>
              Aplicar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={discountType === 'percent' ? 'primary' : 'ghost'}
              onClick={() => setDiscountType('percent')}
            >
              Porcentagem
            </Button>
            <Button
              variant={discountType === 'value' ? 'primary' : 'ghost'}
              onClick={() => setDiscountType('value')}
            >
              Valor Fixo
            </Button>
          </div>
          <Input
            label={discountType === 'percent' ? 'Porcentagem (%)' : 'Valor (R$)'}
            type="number"
            placeholder={discountType === 'percent' ? '10' : '50.00'}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
