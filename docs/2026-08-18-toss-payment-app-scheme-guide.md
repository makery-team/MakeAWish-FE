# 2026-08-18 토스페이먼츠 간편결제 앱 스킴 연동 및 주문 상태 카드 텍스트 렌더링 수정

## 1. 토스페이먼츠 간편결제(카카오페이/앱카드) 앱 스킴 연동
- **현상**: 모바일 앱 내 토스페이먼츠 결제 웹뷰에서 카카오페이, 토스페이, 카드사 앱 등 간편결제를 선택했을 때 안드로이드 웹뷰에서 `net::ERR_UNKNOWN_URL_SCHEME (Error Code: -10)` 오류 발생
- **원인**:
  - 카카오페이/카드사 결제 창은 웹 URL(`https://`)이 아니라 스마트폰에 설치된 결제 앱을 실행하기 위해 커스텀 앱 스킴(`kakaotalk://`, `kakaopay://`, `ispmobile://`, `intent://` 등)으로 리다이렉트합니다.
  - 리액트 네이티브 웹뷰 기본 설정에서는 이 앱 스킴을 일반 웹페이지 주소로 해석하여 로드하려 하다가 `ERR_UNKNOWN_URL_SCHEME` 에러를 표출하게 됩니다.
- **조치 (`components/TossPaymentModal.tsx`)**:
  - `onShouldStartLoadWithRequest` 핸들러를 추가하여 `Linking.openURL`로 외부 결제 앱/인텐트 실행 및 웹뷰 에러 방지

---

## 2. 주문 내역 카드(`components/order-status.tsx`) 상태 안내 텍스트 누락 수정
- **현상**: 주문 내역 화면에서 주문 카드의 하단 상태 뱃지/안내 박스가 빈 분홍색 박스로 렌더링되어 버튼처럼 눌리기는 하나 글씨가 보이지 않는 현상
- **원인**:
  - 백엔드 상태값(`QUOTED`, `PAID`, `PICKUP_READY` 등)이 `components/order-status.tsx`의 조건문 분기에서 누락되어 모든 조건문이 `false`로 평가되어 빈 텍스트(`<Text></Text>`)로 출력됨
- **조치 (`components/order-status.tsx`)**:
  - `getStepIndex`, `getStatusInfo` 헬퍼 함수를 추가하여 `QUOTED`(입금 대기), `PAID`(결제 완료), `IN_PROGRESS`(제작 중), `PICKUP_READY`(픽업 대기), `COMPLETED`(픽업 완료) 전 상태에 대해 색상 및 문구가 정확하게 렌더링되도록 수정

---

## 3. 검증 결과
- `npx tsc --noEmit` 타입 검사 통과 (0 errors).
- 주문 내역 화면에서 각 주문 상태별 안내 문구 및 스텝 진행 바 정상 표출 확인.
