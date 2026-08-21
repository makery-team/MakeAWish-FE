# 2026-08-21 중복 리뷰 작성 방지 및 사용자 친화적 예외 처리 가이드

## 1. 개요
- **문제점**: 소비자가 이미 리뷰를 작성한 완료 주문에 대해 다시 "리뷰 작성하기"를 눌러 제출할 경우, 백엔드 400 에러가 React Native LogBox의 `console.error` Red Screen으로 노출되는 문제 발생.
- **개선 목표**:
  1. 이미 리뷰를 작성한 주문은 버튼 상태를 `✓ 리뷰 작성 완료` (비활성화)로 변경하여 중복 시도를 원천 차단.
  2. 모달에서 예외 발생 시 `console.error` 대신 깔끔한 알림(`alert`) 후 모달을 닫아 크래시/에러 화면 방지.

---

## 2. 주요 변경 사항
1. **`types/index.ts`**:
   - `OrderListItem`에 `hasReview?: boolean` 필드 추가.
2. **`components/order-status.tsx`**:
   - `order.hasReview === true`일 경우 `✓ 리뷰 작성 완료` 회색 뱃지로 비활성화 렌더링.
3. **`components/WriteReviewModal.tsx`**:
   - `console.error` 제거 및 백엔드 안내 메시지(`error.message`)를 파싱하여 사용자 친화적 알림창 노출 후 모달 닫기 처리.
4. **`services/review.ts`**:
   - 백엔드 400 에러 응답(`{"message":"이미 이 주문에 대한 리뷰가 존재합니다."}`) JSON 파싱 지원.

---

## 3. 백엔드 연동 (`MakeAWish-BE`)
1. **`Order.java`**: `Review` 1:1 양방향 매핑 추가.
2. **`OrderSummaryResponse.java`**: `hasReview`(`order.getReview() != null`) 필드 추가.
