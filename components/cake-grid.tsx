import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CakeCard } from './cake-card';
import { CAKE_DATA } from '@/constants/mock-data';
import type { FavoriteCake } from '@/types';

interface CakeGridProps {
  onCakeSelect?: (image: string, shopName: string) => void;
  onCakeInquiry?: (image: string, shopName: string) => void;
  selectedCategory?: string;
  favorites?: FavoriteCake[];
  onToggleFavorite?: (
    cakeId: number,
    image: string,
    shopName: string,
    tag?: string
  ) => void;
}

export function CakeGrid({
  onCakeSelect,
  onCakeInquiry,
  selectedCategory,
  favorites = [],
  onToggleFavorite,
}: CakeGridProps) {
  const filteredCakes =
    selectedCategory && selectedCategory !== 'all'
      ? CAKE_DATA.filter((cake) => cake.categories.includes(selectedCategory))
      : CAKE_DATA;

  return (
    <FlatList
      data={filteredCakes}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      renderItem={({ item: cake }) => {
        const isFavorited = favorites.some((fav) => fav.id === `cake-${cake.id}`);
        return (
          <CakeCard
            id={cake.id}
            image={cake.image}
            shopName={cake.shopName}
            likes={cake.likes}
            rating={cake.rating}
            tag={cake.tag}
            onSelect={onCakeSelect}
            onInquiry={onCakeInquiry}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
          />
        );
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for floating button
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
