import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeOut, 
  Layout, 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 2 columns with gutter

interface CakeCardProps {
  id: number;
  image: string;
  shopName: string;
  likes: number;
  rating: number;
  tag?: string;
  tags?: string[];
  storeId?: number;
  productId?: number;
  onInquiry?: (image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number, tags?: string[]) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (
    cakeId: number,
    image: string,
    shopName: string,
    tag?: string
  ) => void;
}

export function CakeCard({
  id,
  image,
  shopName,
  likes,
  rating,
  tag,
  tags,
  storeId,
  productId,
  onInquiry,
  isFavorited,
  onToggleFavorite,
}: CakeCardProps) {
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();
  const scale = useSharedValue(1);

  const handleEdit = () => {
    setShowActions(false);
    router.push({
      pathname: '/editor/[id]',
      params: { id: id.toString(), image, shopName }
    });
  };

  const handleInquiry = () => {
    setShowActions(false);
    onInquiry?.(image, shopName, id, storeId, productId, tags);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(id, image, shopName, tag);
  };

  const onPressIn = () => {
    scale.value = withSpring(0.97);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View 
      layout={Layout.springify()}
      style={[styles.container, animatedStyle]}
    >
      <Pressable 
        onPress={() => setShowActions(!showActions)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          {/* Tag */}
          {tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          )}

          {/* Bottom Info Gradient Simulation */}
          <View style={styles.infoOverlay}>
            <Text style={styles.shopName} numberOfLines={1}>
              {shopName}
            </Text>
            <View style={styles.statsContainer}>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.statItem}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Heart
                  size={14}
                  color={isFavorited ? '#EF4444' : '#fff'}
                  fill={isFavorited ? '#EF4444' : 'transparent'}
                />
                <Text style={styles.statText}>{likes}</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Actions Overlay */}
          {showActions && (
            <Animated.View 
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.actionsOverlay}
            >
              {storeId && (
                <TouchableOpacity
                  onPress={() => { setShowActions(false); router.push(`/shop/${storeId}`); }}
                  style={[styles.actionButton, styles.shopButton]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.shopButtonText}>매장 보기</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleEdit}
                style={[styles.actionButton, styles.editButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.editButtonText}>편집하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleInquiry}
                style={[styles.actionButton, styles.inquiryButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.inquiryButtonText}>문의하기</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  shopName: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  actionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 16,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shopButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  editButton: {
    backgroundColor: '#fff',
  },
  editButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  inquiryButton: {
    backgroundColor: theme.colors.primary,
  },
  inquiryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
