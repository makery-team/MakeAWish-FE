# 2026-08-21 소비자 앱 추가금(extraFee) 내역 표출 가이드

## 1. 개요
- 사장님이 견적 시 추가한 추가금(`extraFee`)과 그 사유(`extraFeeReason`)를 소비자가 주문 상세 화면 및 주문 내역 카드에서 직관적으로 확인할 수 있도록 UI를 확장.

---

## 2. 주요 변경 사항 (`MakeAWish-FE`)
1. **`types/index.ts`**:
   - `OrderListItem`에 `extraFee?: number;`, `extraFeeReason?: string;` 추가
2. **`app/orders/[id].tsx` (주문 상세)**:
   - 결제 정보 섹션에 기본 상품 금액 (`totalPrice - extraFee`) 및 추가 금액 뱃지(`+₩X,XXX (사유)`)를 분리하여 브레이크다운 렌더링
3. **`components/order-status.tsx` (주문 목록 카드)**:
   - 추가금이 존재하는 주문일 경우 `추가금 +₩X,XXX (사유)` 뱃지 노출

---

## 3. 검증 결과
- `npx tsc --noEmit` 타입 검사 통과 (0 errors).
