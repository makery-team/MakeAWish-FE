/**
 * AI 서버와의 통신을 위한 타입 정의
 */

export type AIActionType = 
  | 'SIMPLE_CHAT' 
  | 'PORTFOLIO_LIST' 
  | 'EDIT_IMAGE' 
  | 'SHOW_SCHEMA' 
  | 'CONFIRM_SLOTS' 
  | 'ORDER_SUMMARY'
  | 'INPAINTING_RESULT'
  | 'ORDER_COMPLETE';

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  messages: AIChatMessage[];
  current_message: string;
  schema_json?: Record<string, any>;
}

export interface AIChatResponse {
  actionType: AIActionType;
  message: string;
  data?: {
    tags?: string[];
    extracted_slots?: Record<string, any>;
    status?: 'IN_PROGRESS' | 'COMPLETED';
    options?: string[];
    [key: string]: any;
  };
}

export interface AIInpaintRequest {
  image_b64: string;           // 원본 이미지 (Base64)
  mask_b64: string;            // 마스크 이미지 (Base64)
  prompt: string;              // 편집 요청 프롬프트
  reference_image_b64?: string; // 참조 이미지 (선택 사항)
  messages?: AIChatMessage[];   // 이전 대화 맥락
  current_message?: string;     // 현재 메시지
}

export interface AIInpaintResponse {
  actionType: 'INPAINTING_RESULT';
  result_image: string; // 생성된 이미지 (Base64 포함 URL)
}
