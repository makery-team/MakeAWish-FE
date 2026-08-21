import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  ViewToken
} from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, ChevronLeft, Sparkles, MessageCircle, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
  cakeDetails?: { image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number, tags?: string[] }[];
  onCakeSelect?: (image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number, tags?: string[]) => void;
  onInquiry?: (image: string, shopName?: string, portfolioId?: number, storeId?: number, productId?: number, tags?: string[]) => void;
  onMinimize?: () => void;
  onRefresh?: () => void;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  cakeDetails,
  onCakeSelect,
  onInquiry,
  onMinimize,
  onRefresh
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      flatListRef.current?.scrollToIndex({ index: 0 });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    } else {
      flatListRef.current?.scrollToIndex({ index: images.length - 1 });
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.imageWrapper}>
      <Image
        source={{ uri: item }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(_, index) => index.toString()}
          style={styles.flatList}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <TouchableOpacity 
              onPress={goToPrev}
              style={[styles.navButton, styles.leftButton]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#374151" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={goToNext}
              style={[styles.navButton, styles.rightButton]}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color="#374151" strokeWidth={1.5} />
            </TouchableOpacity>
          </>
        )}

        {/* Action Buttons Overlay */}
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.actionButtonSecondary}
            onPress={() => {
              if (onCakeSelect) {
                const details = cakeDetails?.[currentIndex];
                const shopName = details ? details.shopName : '지니 AI';
                onCakeSelect(images[currentIndex], shopName, details?.portfolioId, details?.storeId, details?.productId, details?.tags);
                onMinimize && onMinimize();
              }
            }}
          >
            <Sparkles size={14} color="#374151" strokeWidth={1.5} />
            <Text style={styles.actionButtonTextSecondary}>시안 편집하기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonPrimary}
            onPress={() => {
              const details = cakeDetails?.[currentIndex];
              onInquiry && onInquiry(images[currentIndex], details?.shopName, details?.portfolioId, details?.storeId, details?.productId, details?.tags);
            }}
          >
            <MessageCircle size={14} color="white" strokeWidth={1.5} />
            <Text style={styles.actionButtonTextPrimary}>이 시안 문의하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer: Dots, Counter, and More Designs button */}
      <View style={styles.footerContainer}>
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>

          {onRefresh && (
            <TouchableOpacity 
              style={styles.moreButton} 
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <RefreshCw size={12} color={theme.colors.primary} />
              <Text style={styles.moreButtonText}>다른 시안 더보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sliderWrapper: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    height: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  flatList: {
    flex: 1,
  },
  imageWrapper: {
    width: width - 64,
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -18 }],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftButton: {
    left: 12,
  },
  rightButton: {
    right: 12,
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 8,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 24,
  },
  actionButtonTextPrimary: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    borderRadius: 24,
  },
  actionButtonTextSecondary: {
    color: theme.colors.text,
    fontSize: 13,
    letterSpacing: -0.3,
  },
  footerContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: theme.colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  counterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
