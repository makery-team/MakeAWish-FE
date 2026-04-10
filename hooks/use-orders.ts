import { useShop } from '@/context/ShopContext';

/**
 * Custom hook for managing orders - now consuming ShopContext
 */
export function useOrders() {
  const { orders, addOrder, removeOrder, updateOrderStatus } = useShop();

  return {
    orders,
    addOrder,
    removeOrder,
    updateOrderStatus,
  };
}
