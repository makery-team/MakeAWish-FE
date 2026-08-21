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

  const handleCakeSelect = (image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number) => {
    router.push({
      pathname: '/editor/[id]',
      params: { 
        id: portfolioId ? portfolioId.toString() : (id || '1'), 
        image, 
        shopName,
        storeId: (storeId || id)?.toString(),
        productId: productId?.toString(),
      }
    });
  };

  const handleCakeInquiry = (image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number) => {
    startInquiry({
      image,
      shopName,
      storeId: storeId || (id ? parseInt(id, 10) : undefined),
      portfolioId,
      productId,
      design: '디자인 상세 선택',
    });
    // The AISearchBar should handle the inquiry mode automatically
    // 에디터와 마찬가지로 상세페이지를 닫고 메인으로 이동
    router.replace('/(tabs)');
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
