# 🏗️ MakeAWish-FE 프로젝트 아키텍처 및 현황 리포트

본 문서는 프론트엔드(React Native / Expo) 프로젝트의 기술 스택, 핵심 폴더 구조, 그리고 API 연동 진행 현황을 파악하기 위해 작성된 통합 리포트입니다.

---

## 1. 🛠 핵심 기술 스택 (Core Stack)

- **Framework**: Expo SDK 54 (Managed Workflow)
- **Routing**: Expo Router v3 (File-based Routing)
- **Styling**: React Native StyleSheet (Native CSS-in-JS)
- **Animation**: React Native Reanimated v3 (UI-thread animations)
- **State/Auth**: Context API, AsyncStorage 기반 영속성 관리
- **Icons**: Lucide React Native

---

## 2. 📂 폴더 구조 및 역할 (Architecture)

관심사 분리(Separation of Concerns) 원칙을 적용하여 철저하게 계층을 분리했습니다. 특히 'Backend Orchestrator' 패턴 도입으로 프론트엔드는 통신과 상태 관리보다 '순수 뷰(View)'의 역할에 집중합니다.

```text
MakeAWish-FE/
├── app/                  # 📍 [Routing Layer] Expo Router 기반 화면 (홈, 채팅, 마이페이지 등)
├── components/           # 🧩 [UI Layer] 재사용 가능한 컴포넌트 (ai-search-bar, order-schema-form 등)
├── hooks/                # 🔗 [Logic Layer] 비즈니스 로직 및 상태 관리 추상화 (useChatSocket 등)
├── services/             # 📡 [API Layer] 백엔드(Spring Boot) 서버와의 네트워크 통신 (ai, chat, auth 등)
├── types/                # 🏷️ [Types] TypeScript 인터페이스 명세서 (데이터 모델)
└── docs/                 # 📚 [Docs] 개발 가이드라인 및 현황 리포트
```

### 💡 구조 설계 철학 (Clean Code)
1. **Dumb Components**: `components/` 하위 파일들은 API를 직접 호출하지 않고 전달받은 데이터(`actionType` 등)를 화면에 그리는 데에만 집중합니다.
2. **Backend Orchestration**: 챗봇 시나리오 진행 시 프론트엔드가 여러 API를 찌르지 않고, 백엔드가 주는 지시어(`actionType`)에 따라 UI 모드만 전환합니다.

---

## 3. 🚀 API 연동 진행 현황 (Status)

### ✅ 완료된 영역 (Completed)
* **[공통]** `AsyncStorage` 및 `fetchWithAuth` 래퍼 기반의 토큰 재발급 자동화 인프라
* **[홈/탐색]** 태그 기반 피드 조회 (`GET /api/portfolios/feeds`) 및 무한 스크롤
* **[AI 상담]** `POST /api/ai-agent/chat` 백엔드 오케스트레이터 기반 채팅 로직 및 UI 연동 완료
* **[채팅]** 매장 1:1 실시간 채팅 WebSocket (`useChatSocket`) 기능 및 방 목록 조회 완료

### 🟡 대기/진행 중 (In Progress)
* **[주문/결제]** 결제 금액 요약 카드(`ORDER_SUMMARY`) 프로토타입 구현 완료. 실제 주문 생성(`POST /api/orders`) 백엔드 배포 대기 중.
* **[마이페이지]** 마이페이지 라우팅 및 기본 골격 완료. 백엔드 회원 상세정보 연동 대기 중.
* **[디자인]** 인페인팅(`POST /api/portfolios/.../inpaintings`) 통신 메서드는 구현되었으나 화면 연동 및 백엔드 테스트 대기 중.

---

## 4. 🚧 해결된 병목 (Resolved Blockers)

1. **AI 오케스트레이션 결측 문제**: 과거 프론트엔드가 주도적으로 API를 찌를 때 발생하던 `storeId` 누락 문제 등을 백엔드 주도(Backend Orchestrator) 방식으로 100% 해결했습니다.
2. **WebSocket 파라미터 불일치**: 1:1 매장 채팅 시 토큰 인증 및 파라미터가 누락되어 1007 에러가 나던 문제를 백엔드 핸드셰이크 규격(`?roomNumber=X&userId=Y`)에 완벽히 동기화하여 해결했습니다.
3. **토큰 만료 강제 로그아웃**: `fetchWithAuth` 래퍼를 통한 토큰 자동 재발급(Refresh) 로직을 구현하여 UX를 개선했습니다.
