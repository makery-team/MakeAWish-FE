import { useState, useCallback } from 'react';
import type { Order, OrderData } from '../types';

/**
 * Custom hook for managing orders
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = useCallback((orderData: OrderData) => {
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      cakeImage: orderData.cakeImage,
      shopName: orderData.shopName || '가게 정보 없음',
      status: 'inquiry',
      pickupDate: orderData.pickupDate,
      pickupTime: orderData.pickupTime,
      lettering: orderData.lettering,
      createdAt: new Date(),
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  return {
    orders,
    addOrder,
    removeOrder,
    updateOrderStatus,
  };
}
