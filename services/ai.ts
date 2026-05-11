import { 
  AIChatRequest, 
  AIChatResponse, 
  AIInpaintRequest, 
  AIInpaintResponse 
} from '@/types/ai';

// TODO: 환경 변수에서 가져오도록 설정 (현재는 로컬 AI 서버 주소 기본값 사용)
const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL || 'http://localhost:8000';

/**
 * AI 서버와 채팅 통신을 처리하는 서비스
 */
export const aiService = {
  /**
   * 대화 분석 및 응답 요청
   */
  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      const response = await fetch(`${AI_SERVER_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Chat API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Chat Service Error:', error);
      throw error;
    }
  },

  /**
   * 이미지 인페인팅(편집) 요청
   */
  async inpaint(request: AIInpaintRequest): Promise<AIInpaintResponse> {
    try {
      const response = await fetch(`${AI_SERVER_URL}/api/ai/inpaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Inpaint API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Inpaint Service Error:', error);
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
