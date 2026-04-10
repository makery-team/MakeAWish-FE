import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShopDetail } from '@/components/shop-detail';
import { useInquiry } from '@/hooks/use-inquiry';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { startInquiry } = useInquiry();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleCakeSelect = (image: string, shopName: string) => {
    router.push({
      pathname: '/editor/[id]',
      params: { id, image, shopName }
    });
  };

  const handleCakeInquiry = (image: string, shopName: string) => {
    startInquiry({
      image,
      shopName,
      design: '디자인 상세 선택',
    });
    // The AISearchBar should handle the inquiry mode automatically
  };

  return (
    <ShopDetail 
      shopId={id ? parseInt(id) : 1} 
      onBack={handleBack}
      onCakeSelect={handleCakeSelect}
      onCakeInquiry={handleCakeInquiry}
    />
  );
}
