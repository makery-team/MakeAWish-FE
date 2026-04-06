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

// Sample cake images for AI responses
export const SAMPLE_CAKE_IMAGES = [cakeImg1, cakeImg2, cakeImg3, cakeImg4, cakeImg5, cakeImg6];

// Main cake data for the grid
export const CAKE_DATA: Cake[] = [
  {
    id: 1,
    image: cakeImg1,
    shopName: '@Creamy_Seoul',
    likes: 342,
    rating: 4.9,
    tag: '빈티지 감성',
    categories: ['y2k'],
  },
  {
    id: 2,
    image: cakeImg2,
    shopName: '@BlueDream_Cakes',
    likes: 521,
    rating: 5.0,
    tag: '푸른 바다를 담은 디자인',
    categories: ['y2k', 'colorful'],
  },
  {
    id: 4,
    image: cakeImg4,
    shopName: '@MinimalCake_',
    likes: 189,
    rating: 4.7,
    tag: '심플 이즈 베스트',
    categories: ['minimal'],
  },
  {
    id: 5,
    image: cakeImg5,
    shopName: '@Cutie_Patisserie',
    likes: 612,
    rating: 4.9,
    tag: '귀여운 강아지',
    categories: ['y2k', 'colorful'],
  },
  {
    id: 6,
    image: cakeImg6,
    shopName: '@Letter_Mastery',
    likes: 445,
    rating: 5.0,
    tag: '감각적인 레터링',
    categories: ['lettering'],
  },
  {
    id: 7,
    image: cakeImg7,
    shopName: '@Wedding_Cakes',
    likes: 389,
    rating: 4.8,
    tag: '격조 있는 디저트',
    categories: ['minimal'],
  },
  {
    id: 8,
    image: cakeImg8,
    shopName: '@Character_Cakes',
    likes: 578,
    rating: 4.9,
    tag: '익살스러운 공룡',
    categories: ['animal'],
  },
  {
    id: 9,
    image: cakeImg9,
    shopName: '@Puppy_Sweets',
    likes: 534,
    rating: 5.0,
    tag: '우리 반려견 생일 파티',
    categories: ['colorful'],
  },
  {
    id: 11,
    image: cakeImg11,
    shopName: '@Flower_Dreams',
    likes: 467,
    rating: 4.9,
    tag: '화사한 꽃다발',
    categories: ['minimal'],
  },
  {
    id: 12,
    image: cakeImg1,
    shopName: '@Sweet_Seoul',
    likes: 298,
    rating: 4.7,
    tag: '달달한 생일 케이크',
    categories: ['y2k'],
  },
];

// Initial review data
export const INITIAL_REVIEWS: Review[] = [
  {
    id: '1',
    cakeImage: 'https://images.unsplash.com/photo-1611810797891-ac09c37a1f93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWNvcmF0ZWQlMjBjYWtlJTIwZGVzaWdufGVufDF8fHx8MTc3MDI5MjQxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    shopName: '@더맛있는 케이크',
    rating: 5,
    comment: '정말 예쁘고 맛있었어요! 선물했는데 주인공이 너무 좋아해서 뿌듯했어요. 서비스도 친절하고 시간도 정확하게 맞춰주셨어요!',
    images: [
      'https://images.unsplash.com/photo-1765947379428-dea2cf670da8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBjYWtlJTIwYXJ0aXN0aWN8ZW58MXx8fHwxNzcwMjkyNDE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    date: '2024.01.15',
    orderInfo: '오렌지 블라썸 디자인 케이크 1호',
  },
];

// Initial AI chat message
export const INITIAL_AI_MESSAGE = {
  type: 'ai' as const,
  text: '안녕하세요! 메이크어위시입니다. 무엇을 도와드릴까요? 원하시는 스타일의 케이크 디자인을 찾고 계신가요? 말씀해 주시면 추천해 드릴게요.',
};
