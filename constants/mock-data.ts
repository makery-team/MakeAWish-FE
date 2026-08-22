import type { Cake, Review } from '../types';

// Placeholder images for the mockup
const PICSUM_URL = 'https://picsum.photos/seed';
const cakeImg1 = `${PICSUM_URL}/cake1/400/400`;
const cakeImg2 = `${PICSUM_URL}/cake2/400/400`;
const cakeImg3 = `${PICSUM_URL}/cake3/400/400`;
const cakeImg4 = `${PICSUM_URL}/cake4/400/400`;
const cakeImg5 = `${PICSUM_URL}/cake5/400/400`;
const cakeImg6 = `${PICSUM_URL}/cake6/400/400`;
const cakeImg7 = `${PICSUM_URL}/cake7/400/400`;
const cakeImg8 = `${PICSUM_URL}/cake8/400/400`;
const cakeImg9 = `${PICSUM_URL}/cake9/400/400`;
const cakeImg10 = `${PICSUM_URL}/cake10/400/400`;
const cakeImg11 = `${PICSUM_URL}/cake11/400/400`;

// Sample cake images for AI & fallback responses
export const SAMPLE_CAKE_IMAGES = [cakeImg1, cakeImg2, cakeImg3, cakeImg4, cakeImg5, cakeImg6];

// Initial AI chat message
export const INITIAL_AI_MESSAGE = {
  type: 'ai' as const,
  text: '안녕하세요! 메이크어위시입니다. 무엇을 도와드릴까요? 원하시는 스타일의 케이크 디자인을 찾고 계신가요? 말씀해 주시면 추천해 드릴게요.',
};
