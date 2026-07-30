import React, { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { FavoritesView } from '@/components/favorites-view';
import { useFavorites } from '@/hooks/use-favorites';

export default function FavoritesScreen() {
  const { favorites, removeFavorite, refreshFavorites } = useFavorites();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (refreshFavorites) {
        refreshFavorites();
      }
    }, [refreshFavorites])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleCakeSelect = (image: string, shopName: string) => {
    // Navigate to editor with selected cake info
    router.push({
      pathname: '/editor/[id]',
      params: { 
        id: 'favorite', // placeholder id
        image, 
        shopName 
      }
    });
  };

  return (
    <FavoritesView 
      favorites={favorites} 
      onBack={handleBack} 
      onCakeSelect={handleCakeSelect}
      onRemoveFavorite={removeFavorite}
    />
  );
}
