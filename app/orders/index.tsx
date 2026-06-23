import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { OrderStatus } from '@/components/order-status';
import { WriteReviewModal } from '@/components/WriteReviewModal';
import { orderService } from '@/services/order';
import { reviewService } from '@/services/review';
import { OrderListItem } from '@/types';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  const router = useRouter();

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

  useEffect(() => {
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

  const handleReviewPress = (orderId: number) => {
    setSelectedOrderId(orderId);
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (!selectedOrderId) return;
    await reviewService.createReview(selectedOrderId, { rating, content });
    alert('리뷰가 성공적으로 등록되었습니다!');
    // 필요 시 fetchOrders() 를 다시 호출하여 상태 갱신
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <OrderStatus 
        orders={orders} 
        onBack={handleBack} 
        onOrderPress={handleOrderPress} 
        onReviewPress={handleReviewPress}
      />
      
      <WriteReviewModal 
        visible={reviewModalVisible}
        orderId={selectedOrderId}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
      />
    </>
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
