import { useState, useCallback } from 'react';

/**
 * Custom hook for managing navigation between list and map views within the home tab.
 * Other views (shop detail, editor, orders, etc.) are handled via Expo Router.
 */
export function useNavigation() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const handleToggleView = useCallback(() => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  }, []);

  const navigateToView = useCallback((view: 'list' | 'map') => {
    setViewMode(view);
  }, []);

  return {
    // State
    viewMode,

    // Actions
    handleToggleView,
    navigateToView,
  };
}
