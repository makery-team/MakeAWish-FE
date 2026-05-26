import { FeedItem } from '@/types';

// TODO: 환경 변수에서 API URL 가져오도록 수정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

export const portfolioService = {
  /**
   * 태그 기반 포트폴리오 검색
   * @param query 검색어 (태그 콤마 분리 등)
   * @returns FeedItem 배열
   */
  async searchPortfolios(tags: string): Promise<FeedItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolios?tags=${encodeURIComponent(tags)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolios: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Portfolio API Error:', error);
      throw error;
    }
  },
};
