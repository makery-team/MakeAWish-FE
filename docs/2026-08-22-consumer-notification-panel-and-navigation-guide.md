# 2026-08-22 소비자 앱 알림(Notification) 패널 및 실시간 딥링크 연동 가이드

## 1. 개요
- 상단 헤더의 종(🔔) 아이콘에 미확인 알림 뱃지를 실시간으로 표시하고, 알림 클릭 시 해당 주문 상세(`/orders/[id]`)나 채팅으로 자동 딥링크 이동 및 읽음 처리가 되도록 구현.

---

## 2. 주요 변경 사항 (`MakeAWish-FE`)
1. **`types/index.ts`**:
   - `NotificationType` enum 및 `AppNotification` 인터페이스에 `title`, `type`, `targetId` 필드 추가
2. **`services/notification.ts`**:
   - `getUnreadCount()`, `markAsRead(id)`, `markAllAsRead()` API 추가
3. **`components/header.tsx`**:
   - 알림 주기적 폴링 및 패널 오픈 시 즉시 최신화
   - 미확인 알림 개수 뱃지(`(N)`) 노출
   - 개별 알림 클릭 시 즉시 읽음 처리 및 관련 주문 상세 / 채팅 화면으로 딥링크 네비게이션
   - '모든 알림 읽음 처리' 기능 지원
