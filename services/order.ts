import { OrderCreateRequest } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export const orderService = {
  /**
   * 새로운 주문을 생성합니다.
   * @param request 주문 생성 요청 데이터
   */
  async createOrder(request: OrderCreateRequest): Promise<any> {
    try {
      const response = await fetchWithAuth('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order API Error: ${response.status} - ${errorText}`);
      }

      // 201 Created or 200 OK
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('createOrder error:', error);
      throw error;
    }
  },
};
