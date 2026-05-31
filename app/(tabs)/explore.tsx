import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Search as SearchIcon, Filter } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();

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
          />
          <TouchableOpacity>
            <Filter size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Grid (Mock) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리별 탐색</Text>
          <View style={styles.categoryGrid}>
            {['🎂 생일', '💘 기념일', '💐 꽃/플라워', '🎀 리본', '🎨 드로잉', '🐰 캐릭터'].map((cat, i) => (
              <TouchableOpacity key={i} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
});
