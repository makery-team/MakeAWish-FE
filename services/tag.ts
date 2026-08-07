// TODO: 환경 변수에서 API URL 가져오도록 수정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

export const tagService = {
  /**
   * 포트폴리오에 가장 많이 사용된 상위 태그 목록을 조회합니다.
   * @param limit 가져올 태그 개수 (기본값 7)
   */
  async getTrendingTags(limit: number = 7): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tags/trending?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending tags: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Trending Tags API Error:', error);
      throw error;
    }
  },
};
