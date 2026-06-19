import { ReviewRequest, ReviewResponse, ReviewPageResponse } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export const reviewService = {
  /**
   * 주문에 대한 리뷰를 작성합니다.
   * @param orderId 주문 ID
   * @param data 리뷰 데이터 (content, rating, imageUrl)
   */
  async createReview(orderId: number, data: ReviewRequest): Promise<ReviewResponse> {
    try {
      const response = await fetchWithAuth(`/api/orders/${orderId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Review API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('createReview error:', error);
      throw error;
    }
  },

  /**
   * 매장의 리뷰 목록을 조회합니다.
   * @param storeId 매장 ID
   * @param page 페이지 번호 (기본값 0)
   * @param size 페이지 크기 (기본값 10)
   */
  async getStoreReviews(storeId: number, page: number = 0, size: number = 10): Promise<ReviewPageResponse> {
    try {
      // 인증 없이 조회할 수 있도록 기본 fetch 사용 가능, 하지만 fetchWithAuth도 괜찮음
      const response = await fetchWithAuth(`/api/stores/${storeId}/reviews?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Review API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getStoreReviews error:', error);
      throw error;
    }
  },
};
