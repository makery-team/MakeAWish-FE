import { MapView } from '@/components/map-view';
import { useRouter } from 'expo-router';
import React from 'react';

export default function MapScreen() {
  const router = useRouter();

  const handleShopSelect = (shopId: number) => {
    router.push(`/shop/${shopId}` as any);
  };

  return <MapView onShopSelect={handleShopSelect} />;
}
