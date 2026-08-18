# 2026-08-18 토스페이먼츠 간편결제(카카오페이/앱카드) 앱 스킴 연동 가이드

## 1. 개요 및 원인
- **현상**: 모바일 앱 내 토스페이먼츠 결제 웹뷰에서 카카오페이, 토스페이, 카드사 앱 등 간편결제를 선택했을 때 안드로이드 웹뷰에서 `net::ERR_UNKNOWN_URL_SCHEME (Error Code: -10)` 오류 발생
- **원인**:
  - 카카오페이/카드사 결제 창은 웹 URL(`https://`)이 아니라 설치된 결제 앱을 실행하기 위해 커스텀 앱 스킴(`kakaotalk://`, `kakaopay://`, `ispmobile://`, `intent://` 등)으로 리다이렉트합니다.
  - 리액트 네이티브 웹뷰 기본 설정에서는 이 앱 스킴을 일반 웹페이지 주소로 해석하여 로드하려 하다가 `ERR_UNKNOWN_URL_SCHEME` 에러를 표출하게 됩니다.

---

## 2. 해결 방법 (`components/TossPaymentModal.tsx`)
- `onShouldStartLoadWithRequest` 핸들러를 추가하여 URL 스킴을 감지하고 다음과 같이 분기 처리:
  1. `http://`, `https://`, `about:blank`, `data:` ➔ 웹뷰 내부에서 정상 로딩 (`return true`)
  2. `intent://` (안드로이드) ➔ `Linking.openURL`로 앱 인텐트 실행, 미설치 시 `browser_fallback_url` 또는 플레이스토어(`market://details?id=...`)로 자동 우회
  3. `kakaotalk://`, `kakaopay://`, `ispmobile://`, 카드사 앱 스킴 ➔ `Linking.canOpenURL` 및 `Linking.openURL`로 해당 간편결제 앱 직접 실행 (`return false`로 웹뷰 로드 중단)

---

## 3. 검증 결과
- `npx tsc --noEmit` 통과 (0 errors).
- 카카오페이/토스페이/앱카드 결제 선택 시 외부 앱 또는 마켓/웹 폴백으로 정상 연동 확인.
