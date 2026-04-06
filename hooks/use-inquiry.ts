import { useState, useCallback } from 'react';
import type { InquiryMode, ConversationState } from '../types';

/**
 * Custom hook for managing inquiry and AI chat state
 */
export function useInquiry() {
  const [inquiryMode, setInquiryMode] = useState<InquiryMode | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationState>({});

  const startInquiry = useCallback((data: {
    image: string;
    shopName?: string;
    design?: string;
  }) => {
    setInquiryMode({
      active: true,
      image: data.image,
      region: conversationHistory.region,
      size: conversationHistory.size,
      design: data.design || '디자인 상세 선택',
      shopName: data.shopName,
    });
  }, [conversationHistory]);

  const completeInquiry = useCallback(() => {
    setInquiryMode(null);
  }, []);

  const updateConversation = useCallback((data: Partial<ConversationState>) => {
    setConversationHistory(prev => ({ ...prev, ...data }));
  }, []);

  const resetConversation = useCallback(() => {
    setConversationHistory({});
  }, []);

  return {
    inquiryMode,
    conversationHistory,
    startInquiry,
    completeInquiry,
    updateConversation,
    resetConversation,
  };
}
