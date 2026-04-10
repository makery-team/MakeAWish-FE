import React from 'react';
import { useRouter } from 'expo-router';
import { OrderStatus } from '@/components/order-status';
import { useOrders } from '@/hooks/use-orders';

export default function OrdersScreen() {
  const { orders } = useOrders();
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return <OrderStatus orders={orders} onBack={handleBack} />;
}
