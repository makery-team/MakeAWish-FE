import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2, MessageSquare } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import type { ConversationState } from '@/types';

interface OrderReminderCardProps {
  conversationState: ConversationState;
  selectedImage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Helper function to get shop address
 */
function getShopAddress(shopName?: string, region?: string): string {
  // Map shop names to addresses
  const shopAddresses: { [key: string]: string } = {
    'Sweet Dreams': '서울시 강남구 테헤란로 123',
    'Cake Heaven': '서울시 서초구 서초대로 456',
    'Sugar & Spice': '서울시 송파구 올림픽로 789',
    'The Cake Shop': '서울시 마포구 월드컵로 321',
    'Patisserie Belle': '서울시 용산구 이태원로 654',
    'Delicious Cakes': '서울시 강남구 논현로 987',
  };

  // If we have a shop name, return its address
  if (shopName && shopAddresses[shopName]) {
    return shopAddresses[shopName];
  }

  // Otherwise, fall back to region-based addresses
  const regionAddresses: { [key: string]: string } = {
    '강남구': '서울시 강남구 테헤란로 123',
    '서초구': '서울시 서초구 서초대로 456',
    '송파구': '서울시 송파구 올림픽로 789',
    '마포구': '서울시 마포구 월드컵로 321',
    '용산구': '서울시 용산구 이태원로 654',
  };

  if (region && regionAddresses[region]) {
    return regionAddresses[region];
  }

  // Fallback for demo
  if (shopName === '메이커리 강남점') {
    return '서울시 강남구 테헤란로 123';
  }
  if (shopName === '어드민 베이커리') {
    return '서울시 마포구 월드컵로 321';
  }

  return '매장 주소 확인 중';
}

export const OrderReminderCard: React.FC<OrderReminderCardProps> = ({
  conversationState,
  selectedImage,
  onConfirm,
  onCancel
}) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MessageSquare size={16} color="white" />
        </View>
        <Text style={styles.headerTitle}>문의하실 케이크 정보</Text>
      </View>

      {/* Selected Cake Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Order Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <CheckCircle2 size={16} color="#FF69B4" style={styles.detailIcon} />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>매장 주소:</Text>
            <Text style={styles.detailValue}>
              {getShopAddress(conversationState.shopName, conversationState.region)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <CheckCircle2 size={16} color="#FF69B4" style={styles.detailIcon} />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>포함된 태그:</Text>
            <Text style={styles.detailValue}>
              {conversationState.tags && conversationState.tags.length > 0 
                ? conversationState.tags.slice(0, 2).join(', ') 
                : '기본 디자인'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.cancelButton}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          style={styles.confirmButton}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>문의하기</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFE4E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#87CEEB', // Note: Gradient not supported in standard View
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  imageWrapper: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 128,
    borderRadius: 8,
  },
  detailsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF69B4',
    paddingVertical: 10,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
