# 2026-08-18 소비자 앱 토스페이먼츠(Toss Payments) 결제 연동 가이드

## 1. 개요
- **목적**: 주문 상태가 견적 완료/입금 대기(`QUOTED`, `APPROVED`)인 주문에 대해 소비자가 앱 내에서 안전하게 카드/간편결제를 진행하고, 백엔드 승인 API(`POST /api/payments/toss/confirm`)를 통해 최종 결제 완료(`PAID`) 처리를 수행하도록 구현합니다.
- **연동 기술**: 
  - `react-native-webview`: 토스페이먼츠 공식 v1 Javascript SDK를 로드하여 결제창 렌더링
  - `paymentService`: 백엔드 결제 승인 API 및 결제 내역 조회 클라이언트
  - Deep Link / URL 인터셉트: 결제 성공/실패 Redirect URL 감지 후 `paymentKey` 추출

---

## 2. 주요 구현 사항

### 2.1. `TossPaymentModal.tsx` 컴포넌트 개발
- **경로**: `components/TossPaymentModal.tsx`
- **동작 방식**:
  1. 토스 결제용 HTML을 Webview 내에서 렌더링하고 `tossPayments.requestPayment('카드', ...)`를 호출합니다.
  2. 결제 완료 시 `successUrl` (`https://makeawish.app/payment/success?paymentKey=...&orderId=...&amount=...`)로의 이동을 가로채서 `paymentKey`, `orderId`, `amount`를 파싱합니다.
  3. 실패 또는 사용자 취소 시 `failUrl` 및 `onMessage` 브릿지를 통해 에러 메시지를 수신하고 모달을 안전하게 닫습니다.

### 2.2. `paymentService.ts` 클라이언트 API
- **경로**: `services/payment.ts`
- **제공 메서드**:
  - `confirmTossPayment({ paymentKey, orderNumber, amount })`: `POST /api/payments/toss/confirm` 호출 (JWT 토큰 자동 첨부)
  - `getPaymentsByOrderNumber(orderNumber)`: `GET /api/payments/orders/{orderNumber}` 호출
  - `getPaymentDetail(paymentId)`: `GET /api/payments/{paymentId}` 호출

### 2.3. `app/orders/[id].tsx` 주문 상세 화면 결제 UX
- **경로**: `app/orders/[id].tsx`
- **개선점**:
  - `order.status`가 `QUOTED` 또는 `APPROVED`일 때 화면 하단에 고정된 `[토스 결제하기 (총 00,000원)]` 플로팅 CTA 버튼 노출
  - 버튼 클릭 시 `TossPaymentModal`을 띄우고, 결제 성공 콜백 수신 시 백엔드 `confirmTossPayment` 요청 실행
  - 결제 승인 완료 시 주문 상세 정보를 리프레시하여 상태를 `PAID`(결제 완료)로 즉시 갱신하고 결제 완료 안내 알림창 표시

---

## 3. 결제 프로세스 흐름도 (End-to-End Flow)

```
1. 사장님 주문 수락 & 견적/추가금 책정 ➔ 주문 상태: QUOTED / APPROVED
2. 소비자 [주문 상세] 화면 진입 ➔ 하단 [토스 결제하기] 버튼 노출
3. 소비자 [토스 결제하기] 클릭 ➔ TossPaymentModal 팝업
4. 토스 Webview에서 카드 결제 진행 ➔ 결제 성공 시 paymentKey 획득
5. 소비자 앱 ➔ 백엔드 POST /api/payments/toss/confirm 요청
6. 백엔드 위변조 금액 검증 및 토스 서버 최종 승인 ➔ DB OrderStatus: PAID
7. 주문 상세 화면 리프레시 ➔ [결제 완료] 뱃지 표시 및 제작 대기 상태로 전환
```

---

## 4. 빌드 및 타입 검증 결과
- `npx tsc --noEmit` 전체 타입 검사 통과 (0 errors).
