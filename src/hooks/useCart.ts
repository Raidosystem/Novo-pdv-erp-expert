import { usePDVStore } from '@/store/pdvStore';

export const useCart = () => {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    itemsCount,
    client,
    setClient,
    paymentMethod,
    setPaymentMethod,
    discount,
    setDiscount,
  } = usePDVStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount.type === 'percent' 
    ? subtotal * (discount.value / 100)
    : discount.value;
  const finalTotal = subtotal - discountAmount;

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    total: finalTotal,
    subtotal,
    discount,
    discountAmount,
    setDiscount,
    itemsCount: itemsCount(),
    client,
    setClient,
    paymentMethod,
    setPaymentMethod,
  };
};
