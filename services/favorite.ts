import { api } from '@/utils/api';
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
    await api.post(`/portfolios/${portfolioId}/likes`);
  },

  /**
   * 포트폴리오 좋아요 취소
   */
  removeFavorite: async (portfolioId: number): Promise<void> => {
    await api.delete(`/portfolios/${portfolioId}/likes`);
  },

  /**
   * 내 찜 목록(좋아요 목록) 조회
   */
  getMyFavorites: async (): Promise<FavoriteCake[]> => {
    const response = await api.get<PortfolioResponse[]>('/users/me/likes');
    
    // 백엔드의 PortfolioResponse를 프론트엔드의 FavoriteCake 형식으로 매핑
    return response.data.map((portfolio) => ({
      id: portfolio.id.toString(),
      image: portfolio.imageUrl,
      shopName: 'MakeAWish 샵', // 임시 기본값 (포트폴리오 자체에 샵 이름이 없는 상태)
      description: portfolio.tags && portfolio.tags.length > 0 ? portfolio.tags.join(', ') : undefined
    }));
  }
};
