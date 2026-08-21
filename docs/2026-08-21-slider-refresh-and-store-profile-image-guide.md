# 2026-08-21 AI 추천 시안 더보기 및 매장 프로필 사진 1순위 바인딩

## 1. 개요 및 변경 사항
1. **소비자 앱 지도 마커 및 매장 상세페이지 매장 프로필 사진(`store.imageUrl`) 연동**:
   - `types/index.ts`: `Store`, `MapStore`에 `imageUrl` 속성 추가
   - `components/map-view.tsx`: 지도 마커/카드 썸네일로 사장님이 등록한 매장 프로필 사진(`store.imageUrl`)을 1순위로 바인딩
   - `app/(tabs)/explore.tsx`: 매장 검색 및 둘러보기 카드에서 `store.imageUrl` 1순위 노출
   - `components/shop-detail.tsx`: 매장 상세 페이지 헤더 로고(`shopLogo`)에 `store.imageUrl` 1순위 노출
2. **AI 추천 시안 카드 [🔄 다른 시안 더보기] 기능 구현**:
   - `components/image-slider.tsx`: 추천 슬라이더 하단에 `[🔄 다른 시안 더보기]` 버튼 및 카운터 정렬 추가
   - `components/ai-search-bar.tsx`: 버튼 클릭 시 AI 점원에게 "다른 디자인 시안 더 보여줘"를 전달하여 다음 추천 시안 세트가 실시간 응답되도록 연동

---

## 2. 검증 결과
- `npx tsc --noEmit` 타입 검사 성공 (0 errors).
