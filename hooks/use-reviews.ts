import { useState, useCallback } from 'react';
import type { Review } from '../types';
import { INITIAL_REVIEWS } from '../constants/mock-data';

/**
 * Custom hook for managing reviews
 */
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  const addReview = useCallback((review: Review) => {
    setReviews(prev => [review, ...prev]);
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id));
  }, []);

  const updateReview = useCallback((id: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(review =>
      review.id === id ? { ...review, ...updates } : review
    ));
  }, []);

  return {
    reviews,
    addReview,
    deleteReview,
    updateReview,
  };
}
