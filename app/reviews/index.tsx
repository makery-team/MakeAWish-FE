import React, { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { ReviewsView } from '@/components/reviews-view';
import { useReviews } from '@/hooks/use-reviews';

export default function ReviewsScreen() {
  const { reviews, deleteReview, refreshReviews } = useReviews();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (refreshReviews) {
        refreshReviews();
      }
    }, [refreshReviews])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ReviewsView 
      reviews={reviews} 
      onBack={handleBack} 
      onDeleteReview={deleteReview}
    />
  );
}
