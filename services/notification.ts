import { NotificationResponse } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export const notificationService = {
  /**
   * 알림 목록을 페이징하여 조회합니다.
   * @param page 페이지 번호 (기본값 0)
   * @param size 페이지 크기 (기본값 10)
   */
  async getNotifications(page: number = 0, size: number = 10): Promise<NotificationResponse> {
    try {
      const response = await fetchWithAuth(`/api/notifications?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notification API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getNotifications error:', error);
      throw error;
    }
  },
};
