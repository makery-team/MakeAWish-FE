# 2026-08-21 소비자 앱 매장 상세 페이지 다중 키워드 및 카테고리 태그 전체 표출 UI 개선

## 1. 개요 및 변경 사항
1. **매장 상세 프로필 상단 태그 렌더링 개선 (`components/shop-detail.tsx`, `types/index.ts`)**:
   - 기존 첫 번째 카테고리 1개만 단일 뱃지로 뜨던 로직을 개선
   - 사장님이 등록한 매장 핵심 키워드(`storeData.keywords`)와 카테고리 목록(`storeData.categories`)을 통합하여 중복 없는 전체 태그 목록(`shop.tags`)으로 구성
   - `shopTagsContainer`를 적용하여 여러 개의 태그가 부드럽게 줄바꿈(`flexWrap: 'wrap'`, `gap: 5`)되면서 분홍색 뱃지(`#태그명`) 형태로 한눈에 예쁘게 표출되도록 개선

---

## 2. 검증 결과
- `npx tsc --noEmit` 타입 검사 통과 (0 errors).
