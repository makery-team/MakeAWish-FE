import { useState, useCallback } from 'react';

/**
 * Custom hook for managing category filter
 */
export function useFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleTagSelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const resetFilter = useCallback(() => {
    setSelectedCategory('all');
  }, []);

  return {
    selectedCategory,
    handleTagSelect,
    resetFilter,
  };
}
