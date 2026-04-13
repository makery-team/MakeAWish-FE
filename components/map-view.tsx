import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Heart, Star, Navigation, MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import Svg, { Line, Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SAMPLE_CAKE_IMAGES } from '@/constants/mock-data';
import { theme } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT - 200;

const cakeShops = [
  {
    id: 1,
    name: 'Creamy Seoul',
    top: 0.45,
    left: 0.48,
    rating: 4.9,
    likes: 342,
    specialty: 'Y2K 감성 케이크',
    image: SAMPLE_CAKE_IMAGES[0],
    address: '강남구 역삼동',
  },
  {
    id: 2,
    name: 'BlueDream Cakes',
    top: 0.35,
    left: 0.52,
    rating: 5.0,
    likes: 521,
    specialty: '레터링 케이크',
    image: SAMPLE_CAKE_IMAGES[1],
    address: '성동구 성수동',
  },
  {
    id: 3,
    name: 'Rainbow Bakery',
    top: 0.55,
    left: 0.55,
    rating: 4.8,
    likes: 287,
    specialty: '캐릭터 케이크',
    image: SAMPLE_CAKE_IMAGES[2],
    address: '마포구 연남동',
  },
  {
    id: 4,
    name: 'FlowerCake Garden',
    top: 0.70,
    left: 0.65,
    rating: 4.8,
    likes: 389,
    specialty: '플라워 케이크',
    image: SAMPLE_CAKE_IMAGES[3],
    address: '서초구 반포동',
  },
];

interface MapViewProps {
  onShopSelect: (shopId: number) => void;
}

export function MapView({ onShopSelect }: MapViewProps) {
  const [selectedShop, setSelectedShop] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Background Grid & Roads */}
        <Svg style={StyleSheet.absoluteFill}>
          <Rect x="0" y="0" width="100%" height="100%" fill="#F0F9FF" />
          
          {/* Roads */}
          <G stroke="#CBD5E1" strokeWidth="4">
            <Line x1="0" y1="40%" x2="100%" y2="40%" />
            <Line x1="0" y1="60%" x2="100%" y2="60%" />
            <Line x1="50%" y1="0" x2="50%" y2="100%" />
            <Line x1="30%" y1="0" x2="30%" y2="100%" />
            <Line x1="70%" y1="0" x2="70%" y2="100%" />
          </G>
        </Svg>

        {/* Current Location */}
        <View style={[styles.currentLocation, { top: '50%', left: '50%' }]}>
          <View style={styles.locationPulse} />
          <View style={styles.locationDot} />
        </View>

        {/* Markers */}
        {cakeShops.map((shop) => (
          <Marker
            key={shop.id}
            shop={shop}
            isSelected={selectedShop === shop.id}
            onPress={() => setSelectedShop(selectedShop === shop.id ? null : shop.id)}
            onSelect={onShopSelect}
          />
        ))}
      </View>

      {/* Floating Info */}
      <View style={styles.floatingHeader}>
        <Navigation size={16} color="#3B82F6" />
        <Text style={styles.floatingHeaderText}>현재 위치: 강남역 인근</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendPin}>
            <MapPin size={12} color="white" />
          </View>
          <Text style={styles.legendText}>케이크 샵 ({cakeShops.length})</Text>
        </View>
      </View>
    </View>
  );
}

function Marker({ shop, isSelected, onPress, onSelect }: any) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const popupStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected ? 1 : 0),
    transform: [{ scale: withSpring(isSelected ? 1 : 0.8) }],
  }));

  return (
    <View
      style={[
        styles.markerContainer,
        { top: `${shop.top * 100}%`, left: `${shop.left * 100}%` },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View style={[styles.pin, animatedStyle]}>
          <MapPin size={24} color="white" fill={theme.colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      {isSelected && (
        <Animated.View style={[styles.popup, popupStyle]}>
          <Image source={{ uri: shop.image }} style={styles.popupImage} />
          <View style={styles.popupContent}>
            <Text style={styles.shopName}>@{shop.name}</Text>
            <Text style={styles.shopAddress}>{shop.address}</Text>
            <Text style={styles.shopSpecialty}>{shop.specialty}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Heart size={14} color={theme.colors.primary} fill={theme.colors.primary} />
                <Text style={styles.statText}>{shop.likes}</Text>
              </View>
              <View style={styles.stat}>
                <Star size={14} color="#FACC15" fill="#FACC15" />
                <Text style={styles.statText}>{shop.rating}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onSelect(shop.id)}
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>상점 상세 보기</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F0F9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  currentLocation: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: 'white',
  },
  locationPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    position: 'absolute',
    bottom: 40,
    width: 220,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 20,
  },
  popupImage: {
    width: '100%',
    height: 100,
  },
  popupContent: {
    padding: 12,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  shopAddress: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  shopSpecialty: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailButton: {
    backgroundColor: '#FFF0F5',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  floatingHeader: {
    position: 'absolute',
    top: 32,
    left: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
    zIndex: 30,
  },
  floatingHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  legend: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 30,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
