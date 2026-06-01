import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, MapPin, Calendar, CreditCard, ChevronRight } from 'lucide-react-native';
import { orderService } from '@/services/order';
import { OrderDetail } from '@/types';
import { theme } from '@/constants/theme';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        if (!id) return;
        const data = await orderService.getOrderDetail(Number(id));
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_QUOTE': return '견적 대기중';
      case 'APPROVED': return '입금 대기중';
      case 'IN_PROGRESS': return '제작 진행중';
      case 'COMPLETED': return '픽업 완료';
      case 'CANCELED': return '주문 취소됨';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_QUOTE': return '#3B82F6';
      case 'APPROVED': return '#F59E0B';
      case 'IN_PROGRESS': return '#10B981';
      case 'COMPLETED': return '#EC4899';
      case 'CANCELED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>주문 정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backToHomeButton}>
          <Text style={styles.backToHomeText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(order.status);
  const orderItem = order.items?.[0]; // 명세서상 1개의 케이크로 가정

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주문 상세</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.topSection}>
          <Text style={styles.orderDateLabel}>
            주문일시: {new Date(order.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.statusBadgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
            <Text style={styles.orderNumberText}>NO. {order.orderNumber}</Text>
          </View>
        </Animated.View>

        {/* Item Card */}
        {orderItem && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.storeNameText}>{order.storeName}</Text>
              <ChevronRight size={18} color="#9CA3AF" />
            </View>
            <View style={styles.itemRow}>
              {orderItem.customizedImageUrl ? (
                <Image 
                  source={{ uri: orderItem.customizedImageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.placeholderText}>이미지 없음</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{orderItem.name}</Text>
                <Text style={styles.itemQty}>수량: {orderItem.quantity}개</Text>
                <Text style={styles.itemPrice}>{formatCurrency(orderItem.unitPrice)}</Text>
              </View>
            </View>

            {/* Custom Options (orderData) */}
            {order.orderData && Object.keys(order.orderData).length > 0 && (
              <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>요청 사항 및 옵션</Text>
                {Object.entries(order.orderData).map(([key, value]) => (
                  <View key={key} style={styles.optionRow}>
                    <Text style={styles.optionKey}>{key}</Text>
                    <Text style={styles.optionValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(300)} style={styles.card}>
          <Text style={styles.sectionTitle}>예약 정보</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Calendar size={18} color="#6B7280" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>픽업 일시</Text>
              <Text style={styles.infoValue}>
                {order.pickupDate ? new Date(order.pickupDate).toLocaleString('ko-KR', {
                  month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '미정'}
              </Text>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconWrapper}>
              <MapPin size={18} color="#6B7280" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>픽업 장소</Text>
              <Text style={styles.infoValue}>{order.storeName} 매장</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.card}>
          <Text style={styles.sectionTitle}>결제 정보</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>상품 금액</Text>
            <Text style={styles.paymentValue}>{formatCurrency(order.totalPrice)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>최종 결제 금액</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalPrice)}</Text>
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backToHomeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF69B4',
    borderRadius: 8,
  },
  backToHomeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topSection: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  orderDateLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storeNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#DB2777',
  },
  optionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  optionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionKey: {
    fontSize: 13,
    color: '#6B7280',
  },
  optionValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  paymentValue: {
    fontSize: 14,
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DB2777',
  },
});
