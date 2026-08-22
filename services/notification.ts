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

  /**
   * 미확인 알림 개수를 조회합니다.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetchWithAuth('/api/notifications/unread-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return Number(data?.unreadCount || 0);
    } catch (error) {
      console.warn('getUnreadCount error:', error);
      return 0;
    }
  },

  /**
   * 특정 알림을 읽음 처리합니다.
   */
  async markAsRead(id: number): Promise<void> {
    try {
      await fetchWithAuth(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('markAsRead error:', error);
    }
  },

  /**
   * 전체 알림을 일괄 읽음 처리합니다.
   */
  async markAllAsRead(): Promise<void> {
    try {
      await fetchWithAuth('/api/notifications/read-all', {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('markAllAsRead error:', error);
    }
  },
};
