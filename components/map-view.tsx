import { CAKE_SHOPS, CakeShop } from '@/constants/map-shops';
import { SEOUL_DISTRICTS, SeoulGu } from '@/constants/seoul-districts';
import { theme } from '@/constants/theme';
import { mapService } from '@/services/map';
import { MapStore } from '@/types';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import {
  ChevronDown,
  ChevronRight,
  List,
  LocateFixed,
  MapPin,
  Search,
  Star,
  X,
} from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// MapStore(API) → CakeShop(UI) 변환
function mapStoreToCakeShop(store: MapStore): CakeShop {
  const guMatch = store.address.match(/(\S+구)/);
  return {
    id: store.id,
    name: store.name,
    latitude: store.latitude,
    longitude: store.longitude,
    thumbnail: store.thumbnailUrl ?? '',
    rating: store.rating,
    reviewCount: store.reviewCount,
    categories: store.tags,
    address: store.address,
    gu: guMatch ? guMatch[1] : '',
  };
}

interface MapViewProps {
  onShopSelect: (shopId: number) => void;
}

export function MapView({ onShopSelect }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  // Location state
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Region selection state
  const [selectedGu, setSelectedGu] = useState<SeoulGu | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGu, setExpandedGu] = useState<string | null>(null);

  // Shop selection state
  const [selectedShop, setSelectedShop] = useState<CakeShop | null>(null);

  // API로 가져온 매장 목록 (없으면 mock 데이터 fallback)
  const [apiStores, setApiStores] = useState<CakeShop[]>([]);

  // Filtered shops by selected gu
  const visibleShops = useMemo(() => {
    // API 데이터가 있으면 우선 사용 (이미 위치/반경 기준으로 필터링됨)
    if (apiStores.length > 0) return apiStores;
    // API 실패 시 mock 데이터 fallback
    if (!selectedGu) return CAKE_SHOPS;
    return CAKE_SHOPS.filter((s) => s.gu === selectedGu.name);
  }, [selectedGu, apiStores]);

  // Filtered districts for search
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return SEOUL_DISTRICTS;
    const q = searchQuery.trim().toLowerCase();
    return SEOUL_DISTRICTS.filter(
      (gu) =>
        gu.name.toLowerCase().includes(q) ||
        gu.dongs.some((dong) => dong.name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const requestLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('위치 권한이 필요합니다');
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
      mapRef.current?.animateCameraTo({
        latitude: coords.latitude,
        longitude: coords.longitude,
        zoom: 14,
      });
    } catch {
      setLocationError('현재 위치를 가져올 수 없습니다');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 사용자 위치 확인 후 주변 매장 조회 (반경 5km)
  useEffect(() => {
    if (!userLocation) return;
    mapService
      .getNearbyStores(userLocation.latitude, userLocation.longitude, 5000)
      .then((stores) => setApiStores(stores.map(mapStoreToCakeShop)))
      .catch(() => {}); // API 실패 시 mock 데이터 유지
  }, [userLocation]);

  // 구 선택 시 해당 구 중심으로 매장 조회 (반경 3km)
  useEffect(() => {
    if (!selectedGu) return;
    mapService
      .getNearbyStores(selectedGu.latitude, selectedGu.longitude, 3000)
      .then((stores) => setApiStores(stores.map(mapStoreToCakeShop)))
      .catch(() => {});
  }, [selectedGu]);

  const handleGuSelect = useCallback((gu: SeoulGu) => {
    setSelectedGu(gu);
    setIsSheetOpen(false);
    setSearchQuery('');
    setExpandedGu(null);
    setSelectedShop(null);
    mapRef.current?.animateCameraTo({
      latitude: gu.latitude,
      longitude: gu.longitude,
      zoom: 14,
    });
  }, []);

  const handleDongSelect = useCallback(
    (dong: { name: string; latitude: number; longitude: number }, gu: SeoulGu) => {
      setSelectedGu(gu);
      setIsSheetOpen(false);
      setSearchQuery('');
      setExpandedGu(null);
      setSelectedShop(null);
      mapRef.current?.animateCameraTo({
        latitude: dong.latitude,
        longitude: dong.longitude,
        zoom: 16,
      });
    },
    []
  );

  const handleMarkerTap = useCallback((shop: CakeShop) => {
    setSelectedShop((prev) => (prev?.id === shop.id ? null : shop));
  }, []);

  const regionLabel = selectedGu ? `서울 ${selectedGu.name}` : '서울특별시';

  return (
    <View style={styles.container}>
      {/* Naver Map */}
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{
          latitude: userLocation?.latitude ?? 37.5665,
          longitude: userLocation?.longitude ?? 126.9780,
          zoom: 12,
        }}
        isShowLocationButton={false}
      >
        {visibleShops.map((shop) => (
          <NaverMapMarkerOverlay
            key={shop.id}
            latitude={shop.latitude}
            longitude={shop.longitude}
            tintColor={theme.colors.primary}
            onTap={() => handleMarkerTap(shop)}
          />
        ))}

        {userLocation && (
          <NaverMapMarkerOverlay
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            width={20}
            height={20}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        )}
      </NaverMapView>

      {/* Region Search Bar (top overlay) */}
      <TouchableOpacity
        style={[styles.regionBar, { top: insets.top + 70 }]}
        onPress={() => setIsSheetOpen(true)}
        activeOpacity={0.85}
      >
        <MapPin size={16} color={theme.colors.primary} />
        <Text style={styles.regionBarText}>{regionLabel}</Text>
        <ChevronDown size={16} color="#888" />
      </TouchableOpacity>

      {/* Location Button */}
      <TouchableOpacity
        style={[styles.locationButton, { top: insets.top + 70 }]}
        onPress={requestLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <LocateFixed size={20} color={theme.colors.primary} />
        )}
      </TouchableOpacity>


      {/* Location Error Banner */}
      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      {/* Shop Bottom Card */}
      {selectedShop && (
        <ShopBottomCard
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onDetail={() => onShopSelect(selectedShop.id)}
        />
      )}

      {/* Region Bottom Sheet */}
      <RegionBottomSheet
        visible={isSheetOpen}
        searchQuery={searchQuery}
        filteredDistricts={filteredDistricts}
        expandedGu={expandedGu}
        onSearchChange={setSearchQuery}
        onGuExpand={(name) =>
          setExpandedGu((prev) => (prev === name ? null : name))
        }
        onGuSelect={handleGuSelect}
        onDongSelect={handleDongSelect}
        onClose={() => {
          setIsSheetOpen(false);
          setSearchQuery('');
          setExpandedGu(null);
        }}
      />
    </View>
  );
}

// ─── ShopBottomCard ───────────────────────────────────────────────────────────

interface ShopBottomCardProps {
  shop: CakeShop;
  onClose: () => void;
  onDetail: () => void;
}

function ShopBottomCard({ shop, onClose, onDetail }: ShopBottomCardProps) {
  return (
    <View style={cardStyles.container}>
      <Image source={{ uri: shop.thumbnail }} style={cardStyles.image} />
      <View style={cardStyles.content}>
        <TouchableOpacity style={cardStyles.closeBtn} onPress={onClose}>
          <X size={16} color="#888" />
        </TouchableOpacity>

        <Text style={cardStyles.shopName}>@{shop.name}</Text>
        <Text style={cardStyles.shopAddress}>{shop.address}</Text>

        <View style={cardStyles.statsRow}>
          <View style={cardStyles.stat}>
            <Star size={13} color="#FACC15" fill="#FACC15" />
            <Text style={cardStyles.statText}>{shop.rating}</Text>
            <Text style={cardStyles.statSub}>({shop.reviewCount})</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={cardStyles.categoriesRow}
        >
          {shop.categories.map((cat) => (
            <View key={cat} style={cardStyles.categoryTag}>
              <Text style={cardStyles.categoryText}>{cat}</Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={onDetail} style={cardStyles.detailButton}>
          <Text style={cardStyles.detailButtonText}>상점 상세 보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
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
    flexDirection: 'row',
  },
  image: {
    width: 110,
    height: 110,
    backgroundColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
    marginRight: 24,
  },
  shopAddress: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statSub: {
    fontSize: 11,
    color: '#aaa',
  },
  categoriesRow: {
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  detailButton: {
    backgroundColor: '#FFF0F5',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

// ─── RegionBottomSheet ────────────────────────────────────────────────────────

interface RegionBottomSheetProps {
  visible: boolean;
  searchQuery: string;
  filteredDistricts: SeoulGu[];
  expandedGu: string | null;
  onSearchChange: (q: string) => void;
  onGuExpand: (name: string) => void;
  onGuSelect: (gu: SeoulGu) => void;
  onDongSelect: (
    dong: { name: string; latitude: number; longitude: number },
    gu: SeoulGu
  ) => void;
  onClose: () => void;
}

function RegionBottomSheet({
  visible,
  searchQuery,
  filteredDistricts,
  expandedGu,
  onSearchChange,
  onGuExpand,
  onGuSelect,
  onDongSelect,
  onClose,
}: RegionBottomSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={sheetStyles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={sheetStyles.sheet}>
        {/* Handle */}
        <View style={sheetStyles.handle} />

        {/* Header */}
        <View style={sheetStyles.header}>
          <Text style={sheetStyles.title}>지역 선택</Text>
          <TouchableOpacity onPress={onClose} style={sheetStyles.closeBtn}>
            <X size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View style={sheetStyles.searchRow}>
          <Search size={16} color="#aaa" />
          <TextInput
            style={sheetStyles.searchInput}
            placeholder="구 또는 동 검색"
            placeholderTextColor="#bbb"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={14} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {/* District List */}
        <FlatList
          data={filteredDistricts}
          keyExtractor={(item) => item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={sheetStyles.listContent}
          renderItem={({ item: gu }) => (
            <View>
              {/* Gu row */}
              <TouchableOpacity
                style={sheetStyles.guRow}
                onPress={() => onGuExpand(gu.name)}
                activeOpacity={0.7}
              >
                <TouchableOpacity
                  onPress={() => onGuSelect(gu)}
                  style={sheetStyles.guNameBtn}
                >
                  <Text style={sheetStyles.guName}>{gu.name}</Text>
                </TouchableOpacity>
                <ChevronRight
                  size={16}
                  color="#bbb"
                  style={
                    expandedGu === gu.name
                      ? sheetStyles.chevronDown
                      : undefined
                  }
                />
              </TouchableOpacity>

              {/* Dong list (accordion) */}
              {expandedGu === gu.name && (
                <View style={sheetStyles.dongList}>
                  {gu.dongs.map((dong) => (
                    <TouchableOpacity
                      key={dong.name}
                      style={sheetStyles.dongRow}
                      onPress={() => onDongSelect(dong, gu)}
                    >
                      <Text style={sheetStyles.dongName}>{dong.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  closeBtn: {
    padding: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  guRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  guNameBtn: {
    flex: 1,
  },
  guName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  chevronDown: {
    transform: [{ rotate: '90deg' }],
  },
  dongList: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    marginBottom: 4,
    overflow: 'hidden',
  },
  dongRow: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dongName: {
    fontSize: 13,
    color: '#555',
  },
});

// ─── Root styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  regionBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  regionBarText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
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
});
