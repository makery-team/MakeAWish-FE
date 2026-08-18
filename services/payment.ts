import { TossPaymentConfirmRequest, PaymentDetailResponse } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export const paymentService = {
  /**
   * 토스 결제 승인 요청 API
   * 소비자가 토스 결제창에서 결제 완료 후 획득한 paymentKey, orderNumber, amount를 백엔드로 전송합니다.
   * @param request TossPaymentConfirmRequest
   */
  async confirmTossPayment(request: TossPaymentConfirmRequest): Promise<void> {
    try {
      const response = await fetchWithAuth('/api/payments/toss/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment Confirm Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('confirmTossPayment error:', error);
      throw error;
    }
  },

  /**
   * 주문 번호 기준 결제 내역 목록 조회
   * @param orderNumber 주문 번호
   */
  async getPaymentsByOrderNumber(orderNumber: string): Promise<PaymentDetailResponse[]> {
    try {
      const response = await fetchWithAuth(`/api/payments/orders/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get Payments Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getPaymentsByOrderNumber error:', error);
      throw error;
    }
  },

  /**
   * 결제 ID 기준 결제 상세 조회
   * @param paymentId 결제 ID
   */
  async getPaymentDetail(paymentId: number): Promise<PaymentDetailResponse> {
    try {
      const response = await fetchWithAuth(`/api/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get Payment Detail Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getPaymentDetail error:', error);
      throw error;
    }
  },
};
