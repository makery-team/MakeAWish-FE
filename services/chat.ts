import { fetchWithAuth } from '../utils/api';
import { DirectChatRoom, DirectChatMessage } from '../types';

export const chatService = {
  /**
   * 내 채팅방 목록을 조회합니다.
   */
  async getChatRooms(): Promise<DirectChatRoom[]> {
    const res = await fetchWithAuth('/api/chatting/rooms');
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No response body');
      console.error(`[getChatRooms Error] Status: ${res.status}, Body: ${errorText}`);
      throw new Error('Failed to get chat rooms');
    }
    return res.json();
  },

  /**
   * 매장과 새로운 채팅방을 생성합니다. (또는 기존 채팅방 정보 조회)
   * @param userId 본인 ID
   * @param otherId 상대(매장) ID
   */
  async createChatRoom(userId: number, otherId: number): Promise<DirectChatRoom> {
    const res = await fetchWithAuth('/api/chatting/room', {
      method: 'POST',
      body: JSON.stringify({ userId, otherId }),
    });
    if (!res.ok) throw new Error('Failed to create chat room');
    return res.json();
  },

  /**
   * 특정 채팅방의 과거 대화 기록을 조회합니다.
   * @param roomNumber 채팅방 고유 번호
   */
  async getChatHistory(roomNumber: number): Promise<DirectChatMessage[]> {
    try {
      const res = await fetchWithAuth(`/api/chatting/rooms/${roomNumber}/messages`, {
        method: 'GET',
      });
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.warn('Chat history API might not be implemented yet.');
      return [];
    }
  },

  /**
   * 채팅방을 삭제(나가기) 합니다.
   * @param roomNumber 채팅방 고유 번호
   */
  async deleteChatRoom(roomNumber: number): Promise<void> {
    await fetchWithAuth(`/api/chatting/rooms/${roomNumber}`, {
      method: 'DELETE',
    });
  }
};
