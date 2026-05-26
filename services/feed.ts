import { FeedItem, PaginatedResponse } from '@/types';

// TODO: Replace with environment variable if needed
const API_BASE_URL = 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

export const feedService = {
  /**
   * 태그 기반으로 피드를 조회합니다.
   * @param tags 필터링할 태그 배열
   * @param page 조회할 페이지 (0부터 시작)
   * @param size 페이지당 개수 (기본값 12)
   */
  async getFeeds(tags: string[] = [], page: number = 0, size: number = 12): Promise<PaginatedResponse<FeedItem>> {
    try {
      const url = new URL(`${API_BASE_URL}/api/portfolios/feeds`);
      
      if (tags.length > 0) {
        url.searchParams.append('tags', tags.join(','));
      }
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());

      console.log('Fetching feeds from:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // 추후 인증 추가 시 활성화
        },
      });

      if (!response.ok) {
        throw new Error(`Feed API Error: ${response.status}`);
      }

      const data: PaginatedResponse<FeedItem> = await response.json();
      return data;
    } catch (error) {
      console.error('getFeeds error:', error);
      throw error;
    }
  },
};
