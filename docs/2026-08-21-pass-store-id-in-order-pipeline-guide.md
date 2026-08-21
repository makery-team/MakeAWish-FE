# 2026-08-21 주문 생성 파이프라인 매장 ID (storeId) 온전한 보존 및 사장님 연동 수정

## 1. 개요 및 원인 분석
- **문제**: 매장 상세 페이지(`ShopDetail`)나 AI 검색창(`AISearchBar`)에서 특정 매장(예: 테스트왕)의 시안을 선택해 주문서를 생성할 때, `storeId`가 에디터와 주문 요청 객체로 온전히 전달되지 못해 기본 fallback인 `storeId: 1`로 주문이 들어가는 현상이 발생함.
- **결과**: `storeId: 2`를 소유한 사장님(테스트왕)의 사장님 앱 주문 목록에는 해당 주문이 조회되지 않고 `storeId: 1`의 매장으로 주문이 귀속되었음.

---

## 2. 해결 및 구현 내용
1. **`components/shop-detail.tsx`**:
   - `onCakeSelect`, `onCakeInquiry` 콜백에 현재 매장 ID(`shop.id`), 상품 ID(`item.productId`), 포트폴리오 ID(`item.id`)를 온전히 포함하여 호출하도록 개선
2. **`app/shop/[id].tsx`**:
   - 에디터 라우트 이동(`router.push`) 및 AI 상담 시작(`startInquiry`) 시 `storeId: id`, `productId`, `portfolioId`를 온전히 파라미터로 전달
3. **`app/(tabs)/index.tsx`**:
   - `AISearchBar`의 `onCakeSelect`에서 `storeId`, `productId`를 에디터 라우트로 전달
   - `handleInquiryComplete` 시 `conversationHistory.storeId`를 1순위로 참조하여 실제 선택된 매장 ID로 `POST /api/orders` 요청이 전송되도록 수정

---

## 3. 검증 결과
- `npx tsc --noEmit` 타입 검사 통과 (0 errors).
