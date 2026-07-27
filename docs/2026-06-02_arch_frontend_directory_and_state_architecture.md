# 🏗️ MakeAWish-FE 프론트엔드 시스템 아키텍처 및 현황 명세서

MakeAWish 프론트엔드(React Native / Expo) 프로젝트의 기술 스택, 레이어별 디렉토리 아키텍처, 그리고 통신 및 상태 관리 설계 패턴에 대한 종합 문서입니다.

---

## 1. 핵심 기술 스택 (Core Technology Stack)

- **Framework:** Expo SDK (Managed Workflow)
- **Routing:** Expo Router v3 (File-based Navigation)
- **Styling:** React Native StyleSheet & Reanimated v3 (UI-thread animations)
- **Authentication:** `@react-native-google-signin/google-signin` & JWT Token Refresh Architecture
- **State & Storage:** Context API (`AuthContext`), React Native `AsyncStorage`, `DeviceEventEmitter`
- **Network & Real-time:** Native `fetch` wrapper (`fetchWithAuth`) & WebSocket (`useChatSocket`)

---

## 2. 레이어별 폴더 구조 (Layered Architecture)

관심사 분리(Separation of Concerns) 원칙에 따라 UI, 라우팅, 비즈니스 로직, 네트워크 통신 계층을 명확히 분리하여 설계했습니다.

```text
MakeAWish-FE/
├── app/                  # 📍 [Routing Layer] Expo Router 기반 화면 (홈, AI 챗봇, 주문, 매장, 마이페이지)
├── components/           # 🧩 [UI Layer] 재사용 가능한 뷰 컴포넌트 (ai-search-bar, shop-detail 등)
├── context/              # 🔐 [State Layer] 글로벌 전역 상태 관리 (AuthContext)
├── hooks/                # 🔗 [Logic Layer] 비즈니스 로직 및 실시간 통신 훅 (useChatSocket, useLocation 등)
├── services/             # 📡 [API Layer] 백엔드(Spring Boot) 서버와의 네트워크 통신 (ai, auth, chat, order 등)
├── types/                # 🏷️ [Type Layer] TypeScript 공통 데이터 모델 및 인터페이스 정의
├── utils/                # 🛠️ [Utility Layer] fetchWithAuth 인가 래퍼 및 공통 헬퍼 함수
└── docs/                 # 📚 [Documentation] 개발 명세서 및 가이드라인
```

---

## 3. 핵심 설계 패턴 및 아키텍처 특징

### ① Backend Orchestrator 기반 선언적 UI 렌더링
- AI 케이크 맞춤 주문 및 상담 시나리오에서 프론트엔드가 복잡한 다중 서버 통신이나 단계별 계산을 수행하지 않습니다.
- 백엔드가 오케스트레이션한 응답(`actionType`, `data`)에 맞춰 프론트엔드는 선언된 UI 컴포넌트 카드를 동적으로 마운트합니다.
- UI 계층(`components/`)과 API 통신 계층(`services/`) 간의 의존성이 낮아져 화면 추가 및 유지보수가 간편합니다.

### ② 예외 회복력(Resilience)을 갖춘 전역 토큰 인터셉터
- `utils/api.ts`의 `fetchWithAuth` 래퍼는 API 호출 시 `401 Unauthorized`를 감지하여 백그라운드에서 리프레시 토큰으로 자동 갱신합니다.
- 토큰 만료 시에는 `DeviceEventEmitter.emit('EXPIRED_SESSION')`을 발행하여 훅을 사용할 수 없는 서비스 유틸리티 환경에서도 UI 컨텍스트(`AuthContext`)가 즉시 로그아웃 및 경고 메시지를 렌더링할 수 있도록 보장합니다.

### ③ 낙관적 업데이트(Optimistic Update)와 실시간 통신
- 웹소켓 기반 1:1 실시간 매장 채팅(`useChatSocket`)에서 메시지 발송 시 서버 응답 전에 로컬 상태에 먼저 마운트하여 지연 시간을 최소화합니다.
- 안드로이드 및 iOS 네이티브 환경 간의 네트워크 차이를 흡수하는 안전한 비동기 로딩 스피너 및 방어 로직이 적용되어 있습니다.

---

## 4. 모듈별 백엔드 연동 완성도 현황

- **[인증/보안]** 구글 소셜 로그인, JWT 엑세스/리프레시 토큰 저장 및 갱신 인터셉터 연동 완료 (`services/auth.ts`, `AuthContext.tsx`)
- **[AI 챗봇/인페인팅]** `POST /api/ai-agent/chat` 기반 선언적 UI 제어 및 AI 케이크 도안 생성 통신 연동 완료 (`services/ai.ts`)
- **[1:1 매장 채팅]** 웹소켓(`ws://.../chats`) 실시간 대화 및 HTTP REST 채팅방 관리 연동 완료 (`services/chat.ts`, `useChatSocket.ts`)
- **[주문/내역]** 주문 생성, 목록 조회, 단건 상세 조회 및 상태 배지 매핑 연동 완료 (`services/order.ts`)
- **[탐색/매장]** 매장 목록/상세 조회, 포트폴리오 갤러리 피드, 찜 목록 조회 연동 완료 (`services/store.ts`, `services/portfolio.ts`)
