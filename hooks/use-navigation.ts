import { useState, useCallback } from 'react';
import type { ViewMode, SelectedCake } from '../types';

/**
 * Custom hook for managing navigation between different views
 */
export function useNavigation() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [selectedCake, setSelectedCake] = useState<SelectedCake | null>(null);

  const handleShopSelect = useCallback((shopId: number) => {
    setSelectedShopId(shopId);
    setViewMode('detail');
  }, []);

  const handleCakeSelect = useCallback((image: string, shopName: string) => {
    setSelectedCake({ image, shopName });
    setViewMode('editor');
  }, []);

  const handleBackToMap = useCallback(() => {
    setViewMode('map');
    setSelectedShopId(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedCake(null);
  }, []);

  const handleBackToDetail = useCallback(() => {
    setViewMode('detail');
    setSelectedCake(null);
  }, []);

  const handleBackToHome = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleToggleView = useCallback(() => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  }, []);

  const navigateToView = useCallback((view: ViewMode) => {
    setViewMode(view);
  }, []);

  const handleNavigationClick = useCallback((tabId: string) => {
    if (tabId === 'home') {
      setViewMode('list');
    } else if (tabId === 'orders') {
      setViewMode('orders');
    }
  }, []);

  return {
    // State
    viewMode,
    selectedShopId,
    selectedCake,

    // Actions
    handleShopSelect,
    handleCakeSelect,
    handleBackToMap,
    handleBackToList,
    handleBackToDetail,
    handleBackToHome,
    handleToggleView,
    navigateToView,
    handleNavigationClick,
  };
}
