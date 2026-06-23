import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search as SearchIcon, Filter, MapPin, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { mapService } from '@/services/map';
import { MapStore } from '@/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MapStore[] | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const stores = await mapService.searchStores(query.trim());
      setResults(stores);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderStoreItem = (store: MapStore) => {
    const imageUrl = store.categories && store.categories.length > 0 && store.categories[0].imageUrl
      ? store.categories[0].imageUrl
      : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80';

    return (
      <TouchableOpacity 
        key={store.id} 
        style={styles.storeCard}
        onPress={() => router.push(`/shop/${store.id}`)}
      >
        <Image source={{ uri: imageUrl }} style={styles.storeImage} />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>{store.name || '매장 이름 없음'}</Text>
          <Text style={styles.storeAddress} numberOfLines={1}>{store.address || '주소 정보 없음'}</Text>
          
          <View style={styles.storeStats}>
            <View style={styles.statItem}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.statText}>{store.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statSubText}>({store.reviewCount || 0})</Text>
            </View>
            <View style={styles.statItem}>
              <MapPin size={14} color={theme.colors.gray} />
              <Text style={styles.statSubText}>서울</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={theme.colors.gray} />
          <TextInput 
            placeholder="케이크, 가게 또는 키워드 검색" 
            style={styles.input}
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch}>
            {isSearching ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Filter size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {results === null ? (
          // 기본 카테고리 뷰
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리별 탐색</Text>
            <View style={styles.categoryGrid}>
              {['🎂 생일', '💘 기념일', '💐 꽃/플라워', '🎀 리본', '🎨 드로잉', '🐰 캐릭터'].map((cat, i) => (
                <TouchableOpacity key={i} style={styles.categoryItem} onPress={() => {
                  setQuery(cat.split(' ')[1]);
                  setTimeout(() => handleSearch(), 100);
                }}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          // 검색 결과 뷰
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              검색 결과 <Text style={{ color: theme.colors.primary }}>{results.length}</Text>건
            </Text>
            {results.length === 0 && !isSearching ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                <Text style={styles.emptySubText}>다른 키워드로 검색해 보세요.</Text>
              </View>
            ) : (
              <View style={styles.resultList}>
                {results.map(renderStoreItem)}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  clearBtn: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  recentTagText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  trendingTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  trendingTagText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  listContainer: {
    flex: 1,
  },
  resultList: {
    marginTop: 16,
    gap: 16,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeImage: {
    width: 100,
    height: 100,
  },
  storeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  storeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  statSubText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
