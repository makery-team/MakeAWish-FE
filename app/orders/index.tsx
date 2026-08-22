import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { OrderStatus } from '@/components/order-status';
import { orderService } from '@/services/order';
import { OrderListItem } from '@/types';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders(false);
    }, [fetchOrders])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

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

  const handleReviewPress = (orderId: number) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    router.push({
      pathname: '/reviews/write',
      params: {
        orderId: String(orderId),
        storeName: targetOrder?.storeName || '매장',
        cakeName: '커스텀 케이크',
      },
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <OrderStatus 
      orders={orders} 
      onBack={handleBack} 
      onOrderPress={handleOrderPress} 
      onReviewPress={handleReviewPress}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
  }
});
