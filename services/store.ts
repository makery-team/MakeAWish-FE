import { OrderSchema } from '@/types';

// TODO: 환경 변수에서 API URL 가져오도록 수정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

export const storeService = {
  /**
   * 매장의 주문서 스키마 조회
   * @param storeId 매장 ID (또는 매장 이름)
   * @returns 해당 매장의 주문 스키마
   */
  async getOrderSchema(storeId: string | number): Promise<OrderSchema> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/order-schema`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch store schema: ${response.status}`);
      }
      const data = await response.json();
      return data.orderSchema;
    } catch (error) {
      console.error('Store API Error:', error);
      throw error;
    }
  },

  /**
   * 매장 검색 (이름으로 매장 ID를 찾기 위한 용도)
   * @param query 매장 이름 등 검색어
   */
  async searchStores(query: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Store Search API Error:', error);
      throw error;
    }
  }
};
