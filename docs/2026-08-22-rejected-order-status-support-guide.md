# 2026-08-22 주문 거절(REJECTED) 상태 및 거절 사유 표출 가이드

## 1. 개요
- 사장님이 주문을 거절했을 때, 소비자 앱에서도 주문 상태를 "주문 거절됨"으로 명확하게 인지하고 사장님이 입력한 거절 사유(`rejectReason`)를 주문 상세 및 목록 카드에서 확인할 수 있도록 개선.

---

## 2. 주요 변경 사항 (`MakeAWish-FE`)
1. **`types/index.ts`**:
   - `BackendOrderStatus`에 `"REJECTED"` 타입 추가
   - `OrderListItem`에 `rejectReason?: string` 추가
2. **`app/orders/[id].tsx`**:
   - `getStatusText` 및 `getStatusColor`에 `REJECTED` 매핑
   - 거절/취소 사유 박스(`rejectReasonBox`) UI 렌더링
3. **`components/order-status.tsx`**:
   - `REJECTED` 상태 카드 및 거절 사유 메시지 노출 지원
