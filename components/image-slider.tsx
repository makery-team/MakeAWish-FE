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
import { ChevronRight, ChevronLeft, Sparkles, MessageCircle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
  cakeDetails?: { image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number }[];
  onCakeSelect?: (image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number) => void;
  onInquiry?: (image: string, shopName?: string, portfolioId?: number, storeId?: number, productId?: number) => void;
  onMinimize?: () => void;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  cakeDetails,
  onCakeSelect,
  onInquiry,
  onMinimize
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
                onCakeSelect(images[currentIndex], shopName, details?.portfolioId, details?.storeId, details?.productId);
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
              onInquiry && onInquiry(images[currentIndex], details?.shopName, details?.portfolioId, details?.storeId, details?.productId);
            }}
          >
            <MessageCircle size={14} color="white" strokeWidth={1.5} />
            <Text style={styles.actionButtonTextPrimary}>이 시안 문의하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dots Indicator */}
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

      {/* Counter */}
      <Text style={styles.counterText}>
        {currentIndex + 1} / {images.length}
      </Text>
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
    width: width - 64, // Adjusted for typical padding in parent
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  leftButton: {
    left: 8,
  },
  rightButton: {
    right: 8,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonTextPrimary: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.5,
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
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
  counterText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
