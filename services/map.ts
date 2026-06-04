import { fetchWithAuth } from '@/utils/api';
import { MapStore, Store, StoreReview, StorePortfolio, PaginatedResponse } from '@/types';

export const mapService = {
  async getNearbyStores(lat: number, lng: number, radius: number): Promise<MapStore[]> {
    const response = await fetchWithAuth(`/api/stores?lat=${lat}&lng=${lng}&radius=${radius}`);
    if (!response.ok) throw new Error(`getNearbyStores failed: ${response.status}`);
    return response.json();
  },

  async getStoreDetail(storeId: number): Promise<Store> {
    const response = await fetchWithAuth(`/api/stores/${storeId}`);
    if (!response.ok) throw new Error(`getStoreDetail failed: ${response.status}`);
    return response.json();
  },

  async getStoreReviews(
    storeId: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<StoreReview>> {
    const response = await fetchWithAuth(
      `/api/stores/${storeId}/reviews?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error(`getStoreReviews failed: ${response.status}`);
    return response.json();
  },

  async getStorePortfolios(
    storeId: number,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<StorePortfolio>> {
    const response = await fetchWithAuth(
      `/api/stores/${storeId}/portfolios?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error(`getStorePortfolios failed: ${response.status}`);
    return response.json();
  },
};
