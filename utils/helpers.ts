/**
 * Generate a unique order ID
 */
export function generateOrderId(): string {
  return `ORD-${Date.now().toString().slice(-6)}`;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replace(/\./g, '.').trim();
}

/**
 * Check if a view should show the header
 */
export function shouldShowHeader(viewMode: string): boolean {
  return !['detail', 'editor', 'orders', 'favorites', 'reviews'].includes(viewMode);
}

/**
 * Check if a view should show the bottom navigation
 */
export function shouldShowBottomNav(viewMode: string): boolean {
  return !['detail', 'editor', 'favorites', 'reviews'].includes(viewMode);
}

/**
 * Check if a view should show the floating map button
 */
export function shouldShowMapButton(viewMode: string): boolean {
  return !['detail', 'editor', 'orders', 'favorites', 'reviews'].includes(viewMode);
}

/**
 * Get active tab for bottom navigation
 */
export function getActiveTab(viewMode: string): string {
  return viewMode === 'orders' ? 'orders' : 'home';
}
