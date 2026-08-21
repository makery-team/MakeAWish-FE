# 2026-08-21 주문 생성 파이프라인 매장 ID(storeId) 및 대표 태그 보존 가이드

## 1. 개요 및 문제점
- **현상**: 소비자가 AI 추천 및 에디터에서 도안을 선택하고 주문서를 작성할 때, `conversationHistory.storeId` 및 `tags`가 중간 컴포넌트(슬라이더, 에디터 라우트 등)에서 누락되어 주문이 항상 기본 1번 매장(어드민)으로 생성되거나 태그가 기본값으로 초기화되는 문제 발생.
- **결과**: 특정 사장님 매장(예: 테스트테스트, storeId: 2)으로 들어온 주문이 사장님 앱에서 조회되지 않는 현상 해결.

---

## 2. 주요 변경 사항 (`MakeAWish-FE`)
1. **`components/ai-search-bar.tsx`**:
   - `recommendedCakeDetails` 매핑 시 백엔드 `PortfolioDto`의 `tags` 및 `storeId`, `productId` 보존
   - `onCakeSelect` 및 `onInquiry` 시 `updateConversation`을 통해 `storeId`, `productId`, `portfolioId`, `tags`를 상태에 즉시 저장
   - `LOCAL_ORDER_REMINDER` 카드 확인(`onConfirm`) 시 매장 및 상품 식별자 온전히 전달
2. **`components/image-slider.tsx`**:
   - `onCakeSelect` 및 `onInquiry` 핸들러에 `tags?: string[]` 파라미터 추가 및 전달
3. **`components/cake-card.tsx`**:
   - `handleEdit` 시 라우트 쿼리 파라미터에 `tags` 포함 전달
4. **`app/editor/[id].tsx`**:
   - `useLocalSearchParams`에서 `tags` 수신 및 `handleInquiry` 호출 시 `parsedStoreId`, `parsedProductId`, `parsedTags` 보존하여 `startInquiry` 호출
5. **`components/order-reminder-card.tsx`**:
   - "포함된 태그" 항목에 대표 태그 1개(`#태그명`)만 깔끔하고 콤팩트하게 표출

---

## 3. 검증 결과
- `npx tsc --noEmit` 타입 검사 통과 (0 errors).
