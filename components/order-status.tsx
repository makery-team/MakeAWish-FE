import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Package, 
  Gift, 
  MapPin, 
  Phone, 
  MessageSquare 
} from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeInUp
} from 'react-native-reanimated';
import type { Order, OrderStatus as OrderStatusType } from '@/types';

const { width } = Dimensions.get('window');

interface OrderStatusProps {
  orders: Order[];
  onBack: () => void;
}

const statusSteps = [
  { key: 'inquiry', label: '견적 문의', icon: Clock },
  { key: 'accepted', label: '주문 수락', icon: CheckCircle },
  { key: 'inProgress', label: '제작 중', icon: Package },
  { key: 'ready', label: '픽업 준비 완료', icon: Gift },
];

function OrderCard({ order }: { order: Order }) {
  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

  const progressWidth = useMemo(() => {
    return (currentStepIndex / (statusSteps.length - 1)) * 100;
  }, [currentStepIndex]);

  return (
    <Animated.View 
      entering={FadeInUp.delay(200)}
      style={styles.orderCard}
    >
      {/* Order Header with Image */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTop}>
          <Image
            source={{ uri: order.cakeImage }}
            style={styles.cakeImage}
            contentFit="cover"
          />
          <View style={styles.headerInfo}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderIdLabel}>주문번호</Text>
              <View style={styles.orderIdBadge}>
                <Text style={styles.orderIdText}>#{order.id}</Text>
              </View>
            </View>
            {order.shopName && (
              <Text style={styles.shopNameText}>{order.shopName}</Text>
            )}
            {order.pickupDate && (
              <View style={styles.pickupInfoBadge}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.pickupInfoText}>{order.pickupDate} {order.pickupTime}</Text>
              </View>
            )}
          </View>
        </View>

        {order.lettering && (
          <View style={styles.letteringContainer}>
            <Text style={styles.letteringLabel}>레터링 문구</Text>
            <Text style={styles.letteringText}>💌 "{order.lettering}"</Text>
          </View>
        )}
      </View>

      {/* Status Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressLineBg}>
          <View style={[styles.progressLineActive, { width: `${progressWidth}%` }]} />
        </View>

        <View style={styles.stepsRow}>
          {statusSteps.map((step, index) => {
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
          })}
        </View>

        {/* Current Status Message */}
        <View style={[
          styles.statusMessageCard,
          order.status === 'inquiry' ? styles.statusBlue :
          order.status === 'accepted' ? styles.statusGreen :
          order.status === 'inProgress' ? styles.statusOrange :
          styles.statusPink
        ]}>
          <Text style={[
            styles.statusMessageTitle,
            order.status === 'inquiry' ? styles.textBlue :
            order.status === 'accepted' ? styles.textGreen :
            order.status === 'inProgress' ? styles.textOrange :
            styles.textPink
          ]}>
            {order.status === 'inquiry' && '✨ 매장에서 견적을 검토 중이에요'}
            {order.status === 'accepted' && '🎉 주문이 확정되었어요!'}
            {order.status === 'inProgress' && '👩‍🍳 열심히 제작 중이에요'}
            {order.status === 'ready' && '🎂 픽업 준비가 완료되었어요!'}
          </Text>
          <Text style={styles.statusMessageSub}>
            {order.status === 'inquiry' && '24시간 내로 연락드릴 예정이에요'}
            {order.status === 'accepted' && '곧 케이크 제작을 시작할 거예요'}
            {order.status === 'inProgress' && '조금만 기다려주세요, 거의 다 됐어요'}
            {order.status === 'ready' && '매장으로 찾으러 오세요!'}
          </Text>
        </View>

        {/* Action Buttons */}
        {order.status === 'ready' && (
          <View style={styles.actionSection}>
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <MapPin size={18} color="#FF69B4" />
                <View>
                  <Text style={styles.locationLabel}>픽업 위치</Text>
                  <Text style={styles.locationValue}>서울시 강남구 테헤란로 123</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={16} color="#FF69B4" />
                <Text style={styles.callButtonText}>전화하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton}>
                <MessageSquare size={16} color="#A855F7" />
                <Text style={styles.chatButtonText}>채팅하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ orders, onBack }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주문 현황</Text>
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
              예쁜 케이크를 골라 견적 문의를 시작해보세요!
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
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
  headerTop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  cakeImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderIdLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  orderIdBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  shopNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  pickupInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    alignSelf: 'flex-start',
    gap: 4,
  },
  pickupInfoText: {
    fontSize: 12,
    color: '#4B5563',
  },
  letteringContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  letteringLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  letteringText: {
    fontSize: 14,
    color: '#DB2777',
    fontWeight: '500',
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  statusGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  statusOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  statusPink: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
  },
  statusMessageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessageSub: {
    fontSize: 12,
    color: '#4B5563',
  },
  textBlue: { color: '#1D4ED8' },
  textGreen: { color: '#15803D' },
  textOrange: { color: '#C2410C' },
  textPink: { color: '#BE185D' },
  actionSection: {
    marginTop: 16,
    gap: 12,
  },
  locationCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FFE4E6',
    borderRadius: 12,
  },
  callButtonText: {
    color: '#FF69B4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F3E8FF',
    borderRadius: 12,
  },
  chatButtonText: {
    color: '#A855F7',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
