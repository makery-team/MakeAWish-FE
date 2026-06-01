import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
}

const statusSteps = [
  { key: 'PENDING_QUOTE', label: '견적 대기', icon: Clock },
  { key: 'APPROVED', label: '입금 대기', icon: CheckCircle },
  { key: 'IN_PROGRESS', label: '제작 중', icon: Package },
  { key: 'COMPLETED', label: '픽업 완료', icon: Gift },
];

function OrderCard({ order, onPress }: { order: OrderListItem, onPress: () => void }) {
  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

  const progressWidth = useMemo(() => {
    if (order.status === 'CANCELED') return 100;
    if (currentStepIndex === -1) return 0;
    return (currentStepIndex / (statusSteps.length - 1)) * 100;
  }, [currentStepIndex, order.status]);

  const isCanceled = order.status === 'CANCELED';

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
              <Text style={styles.shopNameText}>{order.storeName}</Text>
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
          <View style={[
            styles.statusMessageCard,
            order.status === 'PENDING_QUOTE' ? styles.statusBlue :
            order.status === 'APPROVED' ? styles.statusOrange :
            order.status === 'IN_PROGRESS' ? styles.statusGreen :
            order.status === 'COMPLETED' ? styles.statusPink :
            styles.statusRed
          ]}>
            <Text style={[
              styles.statusMessageTitle,
              order.status === 'PENDING_QUOTE' ? styles.textBlue :
              order.status === 'APPROVED' ? styles.textOrange :
              order.status === 'IN_PROGRESS' ? styles.textGreen :
              order.status === 'COMPLETED' ? styles.textPink :
              styles.textRed
            ]}>
              {order.status === 'PENDING_QUOTE' && '✨ 매장에서 견적을 확인 중이에요'}
              {order.status === 'APPROVED' && '💳 주문 수락 완료! 입금을 진행해주세요'}
              {order.status === 'IN_PROGRESS' && '👩‍🍳 케이크를 열심히 제작 중이에요'}
              {order.status === 'COMPLETED' && '🎉 픽업이 완료되었습니다'}
              {order.status === 'CANCELED' && '❌ 주문이 취소되었습니다'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ orders, onBack, onOrderPress }) => {
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
            <OrderCard key={order.id} order={order} onPress={() => onOrderPress(order.id)} />
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
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
    fontWeight: '600',
    color: '#4B5563',
  },
  orderMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  shopNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: '500',
    color: '#6B7280',
  },
  orderIdText: {
    fontSize: 11,
    fontWeight: '600',
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
    fontWeight: '500',
    color: '#DB2777',
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
    fontWeight: 'bold',
  },
  stepLabelInactive: {
    color: '#9CA3AF',
    fontWeight: '500',
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
    fontWeight: 'bold',
  },
  textBlue: { color: '#1D4ED8' },
  textOrange: { color: '#C2410C' },
  textGreen: { color: '#15803D' },
  textPink: { color: '#BE185D' },
  textRed: { color: '#B91C1C' },
});
