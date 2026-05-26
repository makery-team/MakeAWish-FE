import type { FavoriteCake, FeedItem } from "@/types";
import React from "react";
import { FlatList, StyleSheet, ViewStyle } from "react-native";
import { CakeCard } from "./cake-card";

interface CakeGridProps {
  cakes?: FeedItem[];
  onCakeSelect?: (image: string, shopName: string) => void;
  onCakeInquiry?: (image: string, shopName: string) => void;
  selectedCategory?: string; // Kept for compatibility if needed, but API handles filtering
  favorites?: FavoriteCake[];
  onToggleFavorite?: (
    cakeId: number,
    image: string,
    shopName: string,
    tag?: string,
  ) => void;
  contentContainerStyle?: ViewStyle;
  onEndReached?: () => void;
}

export function CakeGrid({
  cakes = [],
  onCakeSelect,
  onCakeInquiry,
  selectedCategory,
  favorites = [],
  onToggleFavorite,
  contentContainerStyle,
  onEndReached,
}: CakeGridProps) {
  return (
    <FlatList
      data={cakes}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item: cake }) => {
        const isFavorited = favorites.some(
          (fav) => fav.id === cake.id.toString(),
        );
        const primaryTag = cake.tags && cake.tags.length > 0 ? cake.tags[0] : undefined;
        
        return (
          <CakeCard
            id={cake.id}
            image={cake.imageUrl}
            shopName={cake.storeName}
            likes={cake.likeCount}
            rating={0} // API response doesn't include rating currently
            tag={primaryTag}
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
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
