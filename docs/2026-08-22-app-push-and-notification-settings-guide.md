# 2026-08-22 스마트폰 OS 백그라운드 푸시 및 알림 설정 화면 가이드

## 1. 개요
- 스마트폰 화면이 꺼져있거나 앱이 백그라운드 상태일 때도 주문/결제/채팅 알림을 수신할 수 있도록 `expo-notifications` 기반의 푸시 등록 및 딥링크 리스너를 연동하고, 마이페이지에 **알림 설정 화면 (`/settings/notifications`)**을 신설하여 유저가 원하는 알림(주문, 채팅, 마케팅)을 자유롭게 켜고 끌 수 있도록 구현.

---

## 2. 주요 변경 사항 (`MakeAWish-FE`)

### 1) 패키지 및 서비스
- `expo-notifications`, `expo-device` 의존성 추가
- `services/pushNotification.ts`:
  - `registerForPushNotificationsAsync()`: Android/iOS OS 권한 요청, 채널 설정, Expo Push Token 발급 및 백엔드 등록
  - `unregisterPushNotificationAsync()`: 로그아웃 시 토큰 해제
- `services/notification.ts`:
  - `getSettings()`: 백엔드 수신동의 설정 조회 (`GET /api/notifications/settings`)
  - `updateSettings()`: 백엔드 수신동의 설정 변경 (`PATCH /api/notifications/settings`)

### 2) UI 및 네비게이션
- `app/settings/notifications.tsx` (신규 화면):
  - 🔔 주문 및 결제 알림 ON/OFF 스위치
  - 💬 1:1 채팅 알림 ON/OFF 스위치
  - 🎁 혜택 및 이벤트 알림 ON/OFF 스위치 (변경 시 법정 수신동의/철회 안내 팝업 표출)
  - 기기 시스템 알림 설정 안내 가이드 카드
- `app/(tabs)/mypage.tsx`:
  - [앱 설정] 섹션에 **`[🔔 알림 설정]`** 메뉴 항목 추가 및 이동 연동
- `app/_layout.tsx`:
  - 로그인 시 디바이스 푸시 토큰 자동 등록
  - OS 알림 배너 탭 시 해당 주문 상세(`/orders/[id]`)나 채팅 화면으로 자동 딥링크 이동 리스너 등록
