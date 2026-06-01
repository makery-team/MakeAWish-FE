import { OrderListItem, OrderDetail } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export const orderService = {
  /**
   * 내 주문 목록을 조회합니다.
   */
  async getMyOrders(): Promise<OrderListItem[]> {
    try {
      const response = await fetchWithAuth('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getMyOrders error:', error);
      throw error;
    }
  },

  /**
   * 주문 상세 정보를 조회합니다.
   * @param orderId 주문 ID
   */
  async getOrderDetail(orderId: number): Promise<OrderDetail> {
    try {
      const response = await fetchWithAuth(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order Detail API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getOrderDetail error:', error);
      throw error;
    }
  },
};
