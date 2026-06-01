import { OrderCreateRequest, OrderListItem, OrderDetail } from '@/types';
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
