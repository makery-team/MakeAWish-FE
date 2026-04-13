import React, { createContext, useCallback, useMemo, useState } from "react";

import type { ConversationState, InquiryMode } from "@/types";

interface StartInquiryData {
  image: string;
  shopName?: string;
  design?: string;
}

export interface InquiryContextValue {
  inquiryMode: InquiryMode | null;
  conversationHistory: ConversationState;
  startInquiry: (data: StartInquiryData) => void;
  completeInquiry: () => void;
  updateConversation: (data: Partial<ConversationState>) => void;
  resetConversation: () => void;
}

export const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [inquiryMode, setInquiryMode] = useState<InquiryMode | null>(null);
  const [conversationHistory, setConversationHistory] =
    useState<ConversationState>({});

  const startInquiry = useCallback(
    (data: StartInquiryData) => {
      setInquiryMode({
        active: true,
        image: data.image,
        region: conversationHistory.region,
        size: conversationHistory.size,
        design: data.design || "디자인 상세 선택",
        shopName: data.shopName,
      });
    },
    [conversationHistory.region, conversationHistory.size],
  );

  const completeInquiry = useCallback(() => {
    setInquiryMode(null);
  }, []);

  const updateConversation = useCallback((data: Partial<ConversationState>) => {
    setConversationHistory((prev) => ({ ...prev, ...data }));
  }, []);

  const resetConversation = useCallback(() => {
    setConversationHistory({});
  }, []);

  const value = useMemo<InquiryContextValue>(() => {
    return {
      inquiryMode,
      conversationHistory,
      startInquiry,
      completeInquiry,
      updateConversation,
      resetConversation,
    };
  }, [
    conversationHistory,
    inquiryMode,
    startInquiry,
    completeInquiry,
    updateConversation,
    resetConversation,
  ]);

  return (
    <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>
  );
}
