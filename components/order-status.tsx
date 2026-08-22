import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mapService } from '@/services/map';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Package, 
  Gift, 
  ChevronRight,
  XCircle
} from 'lucide-react-native';
import Animated, { 
  FadeInUp
} from 'react-native-reanimated';
import type { OrderListItem, BackendOrderStatus } from '@/types';

const { width } = Dimensions.get('window');

interface OrderStatusProps {
  orders: OrderListItem[];
  onBack: () => void;
  onOrderPress: (orderId: number) => void;
  onReviewPress?: (orderId: number) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const statusSteps = [
  { key: 'PENDING_QUOTE', label: '견적 대기', icon: Clock },
  { key: 'APPROVED', label: '입금 대기', icon: CheckCircle },
  { key: 'IN_PROGRESS', label: '제작 중', icon: Package },
  { key: 'COMPLETED', label: '제작 완료', icon: Gift },
];

const getStepIndex = (status: BackendOrderStatus | string) => {
  switch (status) {
    case 'PENDING_QUOTE':
      return 0;
    case 'QUOTED':
    case 'APPROVED':
      return 1;
    case 'PAID':
    case 'IN_PROGRESS':
      return 2;
    case 'PICKUP_READY':
    case 'COMPLETED':
      return 3;
    default:
      return 0;
  }
};

function OrderCard({ order, onPress, onReviewPress }: { order: OrderListItem, onPress: () => void, onReviewPress?: (orderId: number) => void }) {
  const router = useRouter();

  const handleViewShop = async () => {
    try {
      const stores = await mapService.searchStores(order.storeName);
      if (stores && stores.length > 0) {
        const targetStore = stores.find(s => s.name === order.storeName) || stores[0];
        router.push(`/shop/${targetStore.id}`);
      } else {
        Alert.alert('알림', '매장 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to search store:', error);
      Alert.alert('알림', '매장 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const currentStepIndex = getStepIndex(order.status);

  const getStatusInfo = (status: BackendOrderStatus | string) => {
    switch (status) {
      case 'PENDING_QUOTE':
        return {
          cardStyle: styles.statusBlue,
          textStyle: styles.textBlue,
          message: '✨ 매장에서 견적을 확인 중이에요',
        };
      case 'QUOTED':
      case 'APPROVED':
        return {
          cardStyle: styles.statusOrange,
          textStyle: styles.textOrange,
          message: '💳 주문 수락 완료! 입금(결제)을 진행해주세요',
        };
      case 'PAID':
        return {
          cardStyle: styles.statusBlue,
          textStyle: styles.textBlue,
          message: '💰 결제 완료! 곧 사장님이 제작을 시작해요',
        };
      case 'IN_PROGRESS':
        return {
          cardStyle: styles.statusGreen,
          textStyle: styles.textGreen,
          message: '👩‍🍳 케이크를 열심히 제작 중이에요',
        };
      case 'PICKUP_READY':
        return {
          cardStyle: styles.statusGreen,
          textStyle: styles.textGreen,
          message: '📦 케이크 완성! 매장에서 픽업해주세요',
        };
      case 'COMPLETED':
        return {
          cardStyle: styles.statusPink,
          textStyle: styles.textPink,
          message: '🎉 픽업이 완료되었습니다',
        };
      case 'REJECTED':
        return {
          cardStyle: styles.statusRed,
          textStyle: styles.textRed,
          message: order.rejectReason ? `❌ 주문이 거절되었습니다 (${order.rejectReason})` : '❌ 주문이 거절되었습니다',
        };
      case 'CANCELED':
        return {
          cardStyle: styles.statusRed,
          textStyle: styles.textRed,
          message: order.rejectReason ? `❌ 주문이 취소되었습니다 (${order.rejectReason})` : '❌ 주문이 취소되었습니다',
        };
      default:
        return {
          cardStyle: styles.statusBlue,
          textStyle: styles.textBlue,
          message: '주문이 접수되었습니다',
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  const progressWidth = useMemo(() => {
    if (order.status === 'CANCELED' || order.status === 'REJECTED') return 100;
    return (currentStepIndex / (statusSteps.length - 1)) * 100;
  }, [currentStepIndex, order.status]);

  const isCanceled = order.status === 'CANCELED' || order.status === 'REJECTED';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Animated.View 
      entering={FadeInUp.delay(200)}
      style={styles.orderCard}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {/* Order Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <View style={styles.orderDateRow}>
              <Text style={styles.orderDateText}>{formattedDate}</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
            
            <View style={styles.orderMainInfo}>
              <TouchableOpacity style={styles.shopNameRow} onPress={handleViewShop} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.shopNameText}>{order.storeName}</Text>
                <ChevronRight size={18} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.priceText}>{formatCurrency(order.totalPrice)}</Text>
            </View>
            
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdLabel}>주문번호</Text>
              <Text style={styles.orderIdText}>{order.orderNumber}</Text>
            </View>
            
            {order.pickupDate && (
              <View style={styles.pickupInfoBadge}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.pickupInfoText}>픽업일: {new Date(order.pickupDate).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            )}

            {order.extraFee !== undefined && order.extraFee > 0 && (
              <View style={styles.extraFeeRow}>
                <View style={styles.extraFeeMiniBadge}>
                  <Text style={styles.extraFeeMiniBadgeText}>추가금</Text>
                </View>
                <Text style={styles.extraFeeRowText}>
                  +{formatCurrency(order.extraFee)}
                  {order.extraFeeReason ? ` (${order.extraFeeReason})` : ''}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLineBg}>
            <View style={[
              styles.progressLineActive, 
              { width: `${progressWidth}%` },
              isCanceled && styles.progressLineCanceled
            ]} />
          </View>

          <View style={styles.stepsRow}>
            {isCanceled ? (
              <View style={styles.stepItem}>
                <View style={[styles.stepIconContainer, styles.stepIconCanceled]}>
                  <XCircle size={20} color="white" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive, { color: '#EF4444' }]}>
                  주문 취소
                </Text>
              </View>
            ) : (
              statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View style={[
                      styles.stepIconContainer,
                      isActive ? (isCurrent ? styles.stepIconCurrent : styles.stepIconActive) : styles.stepIconInactive
                    ]}>
                      <Icon 
                        size={20} 
                        color={isActive ? 'white' : '#9CA3AF'} 
                      />
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      isActive ? styles.stepLabelActive : styles.stepLabelInactive
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Current Status Message */}
          <View style={[styles.statusMessageCard, statusInfo.cardStyle]}>
            <Text style={[styles.statusMessageTitle, statusInfo.textStyle]}>
              {statusInfo.message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {order.status === 'COMPLETED' && (
        <TouchableOpacity 
          style={[styles.reviewButton, order.hasReview && styles.reviewButtonDisabled]}
          onPress={() => {
            if (order.hasReview) {
              Alert.alert('안내', '이미 리뷰를 작성하신 주문입니다.');
              return;
            }
            onReviewPress?.(order.id);
          }}
          disabled={order.hasReview}
        >
          <Text style={[styles.reviewButtonText, order.hasReview && styles.reviewButtonTextDisabled]}>
            {order.hasReview ? '✓ 리뷰 작성 완료' : '⭐ 리뷰 작성하기'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ orders, onBack, onOrderPress, onReviewPress, refreshing, onRefresh }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 주문 내역</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            colors={['#FFB6C1']}
            tintColor="#FFB6C1"
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Package size={56} color="#FFB6C1" />
            </View>
            <Text style={styles.emptyTitle}>주문 내역이 없습니다</Text>
            <Text style={styles.emptySub}>
              예쁜 케이크를 골라 첫 견적 문의를 시작해보세요!
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onPress={() => onOrderPress(order.id)} onReviewPress={onReviewPress} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: '#111827',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIconWrapper: {
    width: 112,
    height: 112,
    backgroundColor: '#FFE4E6',
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewButton: {
    backgroundColor: '#FFF0F5',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  reviewButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  reviewButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  reviewButtonTextDisabled: {
    color: '#9CA3AF',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFE4E1',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    padding: 20,
    backgroundColor: '#FFF9FB',
  },
  headerInfo: {
    flex: 1,
  },
  orderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDateText: {
    fontSize: 14,
    color: '#4B5563',
  },
  orderMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopNameText: {
    fontSize: 18,
    color: '#111827',
  },
  priceText: {
    fontSize: 16,
    color: '#DB2777',
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  orderIdLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  orderIdText: {
    fontSize: 11,
    color: '#4B5563',
  },
  pickupInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE4E1',
    gap: 6,
  },
  pickupInfoText: {
    fontSize: 12,
    color: '#DB2777',
  },
  extraFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  extraFeeMiniBadge: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  extraFeeMiniBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  extraFeeRowText: {
    fontSize: 11,
    color: '#BE185D',
    fontWeight: '600',
  },
  progressSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  progressLineBg: {
    position: 'absolute',
    top: 46,
    left: 48,
    right: 48,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
  },
  progressLineActive: {
    height: '100%',
    backgroundColor: '#FF69B4',
    borderRadius: 2,
  },
  progressLineCanceled: {
    backgroundColor: '#EF4444',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIconActive: {
    backgroundColor: '#FFB6C1',
  },
  stepIconCurrent: {
    backgroundColor: '#FF69B4',
    transform: [{ scale: 1.1 }],
  },
  stepIconInactive: {
    backgroundColor: '#F3F4F6',
  },
  stepIconCanceled: {
    backgroundColor: '#EF4444',
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  stepLabelActive: {
    color: '#111827',
    },
  stepLabelInactive: {
    color: '#9CA3AF',
    },
  statusMessageCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  statusOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  statusGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  statusPink: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
  },
  statusRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  statusMessageTitle: {
    fontSize: 13,
    },
  textBlue: { color: '#1D4ED8' },
  textOrange: { color: '#C2410C' },
  textGreen: { color: '#15803D' },
  textPink: { color: '#BE185D' },
  textRed: { color: '#B91C1C' },
});
