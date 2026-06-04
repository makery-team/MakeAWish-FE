import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { OrderStatus } from '@/components/order-status';
import { orderService } from '@/services/order';
import { OrderListItem } from '@/types';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleOrderPress = (orderId: number) => {
    router.push(`/orders/${orderId}` as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <OrderStatus orders={orders} onBack={handleBack} onOrderPress={handleOrderPress} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
  }
});
