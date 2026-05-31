import { AIActionType } from '@/types/ai';

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AiAgentRequest {
  message: string;
}

export interface AiAgentResponse {
  message: string;
  actionType: AIActionType;
  data: any;
}

// TODO: 환경 변수에서 가져오도록 설정
const BACKEND_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

/**
 * 백엔드 서버(Spring Boot)와 채팅 통신을 처리하는 서비스
 * (백엔드가 AI, DB 호출을 오케스트레이션함)
 */
export const aiService = {
  /**
   * 사용자 메시지 전송 및 통합 응답 수신
   */
  async chat(message: string): Promise<AiAgentResponse> {
    try {
      // --- UI 테스트용 치트키 (운영 배포 시 삭제) ---
      if (message === '!테스트1') {
        return {
          message: "주문 내역을 꼼꼼히 확인해주세요!",
          actionType: 'CONFIRM_SLOTS',
          data: { slots: { "디자인": "포트폴리오 #12", "맛": "초코", "사이즈": "1호", "문구": "HBD Mom!" } }
        };
      }
      if (message === '!테스트2') {
        return {
          message: "사장님이 주문을 수락했습니다! 하단의 최종 금액을 결제하시겠습니까?",
          actionType: 'ORDER_SUMMARY',
          data: { totalPrice: 45000 }
        };
      }
      // ----------------------------------------------

      const token = await AsyncStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_API_URL}/api/ai-agent/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat Service Error:', error);
      throw error;
    }
  },

  /**
   * 포트폴리오 이미지 기반 인페인팅(디자인 수정) 요청
   */
  async inpaint(portfolioId: number, prompt: string, maskImage: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_API_URL}/api/portfolios/${portfolioId}/inpaintings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, maskImage }),
      });

      if (!response.ok) {
        throw new Error(`Inpaint API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Inpaint Service Error:', error);
      throw error;
    }
  },

  /**
   * 서버 상태 확인
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${AI_SERVER_URL}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
