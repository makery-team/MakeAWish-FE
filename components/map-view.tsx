import { SAMPLE_CAKE_IMAGES } from '@/constants/mock-data';
import { theme } from '@/constants/theme';
import NaverMapView, {
  NaverMapMarker,
} from '@mj-studio/react-native-naver-map';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { Heart, LocateFixed, Star } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const cakeShops = [
  {
    id: 1,
    name: 'Creamy Seoul',
    latitude: 37.4996,
    longitude: 127.0276,
    rating: 4.9,
    likes: 342,
    specialty: 'Y2K 감성 케이크',
    image: SAMPLE_CAKE_IMAGES[0],
    address: '강남구 역삼동',
  },
  {
    id: 2,
    name: 'BlueDream Cakes',
    latitude: 37.5446,
    longitude: 127.0564,
    rating: 5.0,
    likes: 521,
    specialty: '레터링 케이크',
    image: SAMPLE_CAKE_IMAGES[1],
    address: '성동구 성수동',
  },
  {
    id: 3,
    name: 'Rainbow Bakery',
    latitude: 37.5663,
    longitude: 126.9235,
    rating: 4.8,
    likes: 287,
    specialty: '캐릭터 케이크',
    image: SAMPLE_CAKE_IMAGES[2],
    address: '마포구 연남동',
  },
  {
    id: 4,
    name: 'FlowerCake Garden',
    latitude: 37.5172,
    longitude: 127.0473,
    rating: 4.8,
    likes: 389,
    specialty: '플라워 케이크',
    image: SAMPLE_CAKE_IMAGES[3],
    address: '강남구 압구정동',
  },
];

interface MapViewProps {
  onShopSelect: (shopId: number) => void;
}

export function MapView({ onShopSelect }: MapViewProps) {
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<any>(null);

  const selectedShopData = cakeShops.find((s) => s.id === selectedShop);

  const requestLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('위치 권한이 필요합니다');
      setIsLocating(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setUserLocation(coords);
    setIsLocating(false);

    mapRef.current?.animateCameraTo({
      latitude: coords.latitude,
      longitude: coords.longitude,
      zoom: 13,
    });
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{
          latitude: userLocation?.latitude ?? 37.534,
          longitude: userLocation?.longitude ?? 126.99,
          zoom: 12,
        }}
        isShowLocationButton={false}
      >
        {/* 케이크 가게 마커 */}
        {cakeShops.map((shop) => (
          <NaverMapMarker
            key={shop.id}
            latitude={shop.latitude}
            longitude={shop.longitude}
            onTap={() =>
              setSelectedShop(selectedShop === shop.id ? null : shop.id)
            }
          />
        ))}

        {/* 내 현재 위치 마커 */}
        {userLocation && (
          <NaverMapMarker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            width={20}
            height={20}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        )}
      </NaverMapView>

      {/* 내 위치로 이동 버튼 */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={requestLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <LocateFixed size={20} color={theme.colors.primary} />
        )}
      </TouchableOpacity>

      {/* 위치 오류 메시지 */}
      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      {/* 마커 클릭 시 팝업 카드 */}
      {selectedShopData && (
        <View style={styles.popup}>
          <Image
            source={{ uri: selectedShopData.image }}
            style={styles.popupImage}
          />
          <View style={styles.popupContent}>
            <Text style={styles.shopName}>@{selectedShopData.name}</Text>
            <Text style={styles.shopAddress}>{selectedShopData.address}</Text>
            <Text style={styles.shopSpecialty}>
              {selectedShopData.specialty}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Heart
                  size={14}
                  color={theme.colors.primary}
                  fill={theme.colors.primary}
                />
                <Text style={styles.statText}>{selectedShopData.likes}</Text>
              </View>
              <View style={styles.stat}>
                <Star size={14} color="#FACC15" fill="#FACC15" />
                <Text style={styles.statText}>{selectedShopData.rating}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onShopSelect(selectedShopData.id)}
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>상점 상세 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  errorBanner: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#E53E3E',
    textAlign: 'center',
  },
  popup: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  popupImage: {
    width: '100%',
    height: 120,
  },
  popupContent: {
    padding: 16,
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
});
