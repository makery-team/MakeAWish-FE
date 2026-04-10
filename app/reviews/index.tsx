import React from 'react';
import { useRouter } from 'expo-router';
import { ReviewsView } from '@/components/reviews-view';
import { useReviews } from '@/hooks/use-reviews';

export default function ReviewsScreen() {
  const { reviews, deleteReview } = useReviews();
  const router = useRouter();

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
