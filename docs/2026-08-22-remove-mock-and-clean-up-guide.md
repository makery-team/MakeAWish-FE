# 2026-08-22 소비자 앱 Mock 잔재 정리 및 순수 API 연동 가이드

## 1. 개요
- 백엔드 전체 API 연동 완료에 따라, 기존에 남아있던 미사용 레거시 Mock 데이터 및 `IS_MOCK` 분기 플래그를 완전히 정리하고 실서버 API 연동으로 일원화.

---

## 2. 주요 변경 사항 (`MakeAWish-FE`)

### 1) Mock 데이터 정리
- `constants/mock-data.ts`: 미사용 레거시 더미 데이터(`CAKE_DATA`, `INITIAL_REVIEWS`) 삭제
- `app/(auth)/login.tsx`: `IS_MOCK` 플래그 및 mock 알림 분기 삭제, 순수 Google 로그인 플로우로 일원화
- `services/auth.ts`: `API_BASE_URL`을 `EXPO_PUBLIC_API_URL` 환경변수와 통일
