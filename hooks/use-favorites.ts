import { useState, useCallback } from 'react';
import type { FavoriteCake } from '../types';

/**
 * Custom hook for managing favorite cakes
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCake[]>([]);

  const toggleFavorite = useCallback((
    cakeId: number, 
    image: string,
    shopName: string,
    tag?: string
  ) => {
    const favoriteId = `cake-${cakeId}`;

    setFavorites(prev => {
      const existingFavorite = prev.find(fav => fav.id === favoriteId);

      if (existingFavorite) {
        // Remove from favorites
        return prev.filter(fav => fav.id !== favoriteId);
      } else {
        // Add to favorites
        const newFavorite: FavoriteCake = {
          id: favoriteId,
          image,
          shopName,
          description: tag,
        };
        return [newFavorite, ...prev];
      }
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  }, []);

  const isFavorited = useCallback((cakeId: number) => {
    return favorites.some(fav => fav.id === `cake-${cakeId}`);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    removeFavorite,
    isFavorited,
  };
}
