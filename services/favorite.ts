import { fetchWithAuth } from '@/utils/api';
import { FavoriteCake } from '@/types';

interface PortfolioResponse {
  id: number;
  imageUrl: string;
  tags: string[];
  isInpaintingAllowed: boolean;
  likeCount: number;
}

export const favoriteService = {
  /**
   * 포트폴리오 좋아요 추가
   */
  addFavorite: async (portfolioId: number): Promise<void> => {
    const response = await fetchWithAuth(`/api/portfolios/${portfolioId}/likes`, { method: 'POST' });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[favoriteService] addFavorite failed (${response.status}) for id=${portfolioId}: ${errText}`);
      throw new Error(`Failed to add favorite (${response.status})`);
    }
  },

  /**
   * 포트폴리오 좋아요 취소
   */
  removeFavorite: async (portfolioId: number): Promise<void> => {
    const response = await fetchWithAuth(`/api/portfolios/${portfolioId}/likes`, { method: 'DELETE' });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[favoriteService] removeFavorite failed (${response.status}) for id=${portfolioId}: ${errText}`);
      throw new Error(`Failed to remove favorite (${response.status})`);
    }
  },

  /**
   * 내 찜 목록(좋아요 목록) 조회
   */
  getMyFavorites: async (): Promise<FavoriteCake[]> => {
    const response = await fetchWithAuth('/api/users/me/likes');
    if (!response.ok) throw new Error('Failed to get favorites');
    const rawData = await response.json();
    const data: PortfolioResponse[] = Array.isArray(rawData) ? rawData : (rawData?.content || []);
    
    // 백엔드의 PortfolioResponse를 프론트엔드의 FavoriteCake 형식으로 매핑
    return data
      .filter((portfolio: any) => portfolio && (portfolio.id !== undefined || portfolio.portfolioId !== undefined))
      .map((portfolio: any) => ({
        id: String(portfolio.id ?? portfolio.portfolioId),
        image: portfolio.imageUrl || '',
        shopName: portfolio.storeName || portfolio.shopName || 'MakeAWish 샵',
        description: portfolio.tags && portfolio.tags.length > 0 ? portfolio.tags.join(', ') : undefined
      }));
  }
};
