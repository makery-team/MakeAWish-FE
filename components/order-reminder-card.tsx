import React, { useEffect, useState } from 'react';
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
import { mapService } from '@/services/map';

interface OrderReminderCardProps {
  conversationState: ConversationState;
  selectedImage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function getShopAddressFallback(shopName?: string, region?: string, shopAddress?: string): string {
  if (shopAddress) return shopAddress;

  // Fallback for demo
  if (shopName === '메이커리 강남점') {
    return '서울시 강남구 테헤란로 123';
  }
  if (shopName === '어드민 베이커리') {
    return '서울시 마포구 연남동 239-20 1층';
  }
  if (shopName === '위시 케이크') {
    return '서울 성동구 서울숲2길 14';
  }
  if (shopName === '달콤달콤 케이크') {
    return '서울 강남구 테헤란로 123 2층';
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
  const [realAddress, setRealAddress] = useState<string | null>(null);

  useEffect(() => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  useEffect(() => {
    if (conversationState.storeId) {
      mapService.getStoreDetail(conversationState.storeId)
        .then(store => {
          if (store && store.address) {
            setRealAddress(store.address);
          }
        })
        .catch(err => console.error("Failed to fetch store address:", err));
    }
  }, [conversationState.storeId]);

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
              {realAddress || getShopAddressFallback(conversationState.shopName, conversationState.region, conversationState.shopAddress)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <CheckCircle2 size={16} color="#FF69B4" style={styles.detailIcon} />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>포함된 태그:</Text>
            <Text style={styles.detailValue}>
              {conversationState.tags && conversationState.tags.length > 0 
                ? `#${conversationState.tags[0].replace('#', '')}` 
                : '커스텀 디자인'}
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
    },
});
