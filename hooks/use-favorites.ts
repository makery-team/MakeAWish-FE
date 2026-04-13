import { useShop } from '@/context/ShopContext';

/**
 * Custom hook for managing favorites - now consuming ShopContext
 */
export function useFavorites() {
  const { favorites, toggleFavorite, removeFavorite, isFavorited } = useShop();

  return {
    favorites,
    toggleFavorite,
    removeFavorite,
    isFavorited,
  };
}
