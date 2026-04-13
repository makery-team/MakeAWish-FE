import { useShop } from '@/context/ShopContext';

/**
 * Custom hook for managing reviews - now consuming ShopContext
 */
export function useReviews() {
  const { reviews, deleteReview } = useShop();

  return {
    reviews,
    deleteReview,
  };
}
