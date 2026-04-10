import { useContext } from 'react';

import { InquiryContext } from '@/context/InquiryContext';

export function useInquiry() {
  const context = useContext(InquiryContext);

  if (!context) {
    throw new Error('useInquiry must be used within InquiryProvider');
  }

  return context;
}
