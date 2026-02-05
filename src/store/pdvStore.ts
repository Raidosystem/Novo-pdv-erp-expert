import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  image?: string;
}

interface Discount {
  type: 'percent' | 'value';
  value: number;
}

interface PDVStore {
  items: CartItem[];
  client: string | null;
  paymentMethod: string;
  discount: Discount;
  observation: string;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setClient: (clientId: string | null) => void;
  setPaymentMethod: (method: string) => void;
  setDiscount: (discount: Discount) => void;
  setObservation: (obs: string) => void;
  clear: () => void;
  
  // Computed
  total: () => number;
  itemsCount: () => number;
}

export const usePDVStore = create<PDVStore>()(
  persist(
    (set, get) => ({
      items: [],
      client: null,
      paymentMethod: 'dinheiro',
      discount: { type: 'value', value: 0 },
      observation: '',
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i =>
              i.id === id ? { ...i, quantity } : i
            ),
      })),
      
      setClient: (clientId) => set({ client: clientId }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setDiscount: (discount) => set({ discount }),
      setObservation: (obs) => set({ observation: obs }),
      
      clear: () => set({
        items: [],
        client: null,
        discount: { type: 'value', value: 0 },
        observation: '',
      }),
      
      total: () => {
        const { items, discount } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = discount.type === 'percent'
          ? subtotal * (discount.value / 100)
          : discount.value;
        return subtotal - discountAmount;
      },
      
      itemsCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'pdv-storage',
    }
  )
);
