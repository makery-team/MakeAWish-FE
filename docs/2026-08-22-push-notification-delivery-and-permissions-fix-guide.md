# 2026-08-22 스마트폰 OS 푸시 권한 및 로컬 실시간 알림 트리거 가이드

## 1. 문제 원인
- 최신 Android 13+ (API 33+) 환경에서는 `POST_NOTIFICATIONS` 권한 선언이 없으면 OS가 모든 푸시 알림을 자동으로 차단하고 권한 팝업도 띄우지 않습니다.
- 또한 `app.json`에 `expo-notifications` 플러그인이 누락되어 있었고, 실시간 알림 발생 시 클라이언트 측 로컬 OS 알림 트리거(`showLocalNotification`)가 연결되어 있지 않았습니다.

---

## 2. 해결 및 개선 사항 (`MakeAWish-FE`)

### 1) Android 13+ 권한 및 플러그인 등록
- `app.json`:
  - `android.permissions`: `POST_NOTIFICATIONS` 권한 추가
  - `plugins`: `expo-notifications` 플러그인 추가 (`icon`, `color`)

### 2) 로컬 OS 알림 트리거 (`services/pushNotification.ts`)
- `showLocalNotification(title, body, data)`:
  - 백엔드에서 생성된 새 알림을 스마트폰 OS 알림 트레이(소리/진동/최상단 배너)로 즉시 팝업 표시

### 3) 실시간 알림 수신 연동 (`components/header.tsx`)
- 백엔드로부터 새로운 미확인 알림이 감지되는 즉시 `showLocalNotification`을 호출하여, 앱이 화면에 켜져 있거나 백그라운드에 진입할 때 스마트폰 상단에 알림 배너가 즉시 뜨도록 연동
