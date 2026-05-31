# Dev Log #4: AI 챗봇 아키텍처 개편 (Backend Orchestrator 도입)

## 1. 개요 (Overview)
초기 프로토타입 단계에서는 프론트엔드(React Native)가 AI 챗봇 기능을 구현하기 위해 **AI 서버(FastAPI)**, **매장 API**, **포트폴리오 API**를 각각 개별적으로 호출하며 엮어주는 "프론트엔드 오케스트레이터(Frontend Orchestrator)" 방식을 사용했습니다.
하지만 이 방식은 데이터의 무결성(예: 포트폴리오 API 응답에 `storeId`가 누락되어 주문서 스키마를 가져올 수 없는 문제)을 보장하기 어렵고 통신 로직이 지나치게 비대해지는 단점이 있었습니다.

이에 따라 백엔드 팀(Spring Boot)에서 사전에 설계하고 구현해 둔 **백엔드 오케스트레이터(Backend Orchestrator) 패턴**으로 프론트엔드 아키텍처를 전면 리팩터링하였습니다.

## 2. 아키텍처 변경 비교 (Architecture Shift)

### ❌ 변경 전 (Frontend Orchestrator - 폐기됨)
프론트엔드가 모든 복잡성을 감당하던 구조입니다.
1. FE ➔ AI 서버: `POST /api/ai/chat` (유저 입력 전달, 인텐트/태그 추출)
2. FE ➔ Spring Boot BE: `GET /api/portfolios?tags=...` (AI가 준 태그로 사진 검색)
3. FE ➔ Spring Boot BE: `GET /api/stores/{storeId}/order-schema` (주문서 양식 조회)
4. FE ➔ AI 서버: `POST /api/ai/chat` (양식을 AI에게 찔러넣어 질문 유도)

**문제점:**
* 포트폴리오 검색 응답에 `storeId`가 누락되면 다음 단계(주문서 조회)로 넘어갈 수 없는 **블로커(Blocker)**가 발생했습니다.
* 프론트엔드에 각 API의 에러 처리, 파라미터 규격 등 과도한 비즈니스 로직이 집중되었습니다.

### ✅ 변경 후 (Backend Orchestrator - 현재 적용됨)
프론트엔드는 뷰(View)의 역할에만 충실하며, 오직 단 하나의 백엔드 API와 통신합니다.
1. FE ➔ Spring Boot BE: `POST /api/ai-agent/chat` (유저 메시지만 전송)
2. Spring Boot BE 내부 동작:
   * AI 서버 호출 (인텐트 분석)
   * DB 조회 (포트폴리오, 매장 정보 등)
   * 비즈니스 로직 결합 (필요 시 주문서 매칭 등)
3. Spring Boot BE ➔ FE: `{ actionType, message, data }` (완성된 결과물 전송)
4. FE: 백엔드가 지시하는 `actionType`에 따라 화면을 렌더링.

## 3. 프론트엔드 반영 내역 (Refactoring Details)

### 1) `services/ai.ts` 통신 채널 단일화
* 기존의 로컬/외부 AI 서버(`makeawish-ai.onrender.com`)를 향하던 직접 통신 코드를 삭제했습니다.
* 백엔드 API인 `EXPO_PUBLIC_API_URL/api/ai-agent/chat` 하나만 바라보도록 엔드포인트를 변경했습니다.
* 백엔드의 요청/응답 DTO(`AiAgentRequest`, `AiAgentResponse`) 규격에 맞춰 타입을 단순화했습니다.

### 2) `components/ai-search-bar.tsx` 뷰 로직 단순화
* `handleSend` 함수 내부에 덕지덕지 붙어있던 `portfolioService`, `storeService` 호출 로직을 전면 제거했습니다.
* 백엔드가 내려주는 통합 응답 객체의 `actionType`에 따라 조건부 렌더링을 수행하도록 개선했습니다.
  * `actionType === 'PORTFOLIO_LIST'` 인 경우 백엔드가 미리 가공해 둔 `data` (이미지 주소, 가게 이름 등) 배열을 바로 스와이퍼에 뿌려줍니다.
  * `actionType === 'SHOW_SCHEMA'` 또는 `ORDER_SUMMARY` 인 경우, 에이전트가 추출한 `slots` 데이터를 기반으로 UI 상태를 업데이트합니다.
* 컴포넌트 마운트 시 불필요하게 `storeService.searchStores`를 찌르던 초기화 로직을 삭제했습니다.

## 4. 해결된 이슈 & 남은 과제

### 🎉 해결된 병목 (Resolved Blocker)
* **`storeId` 누락 문제 영구 종결**: 프론트엔드가 포트폴리오의 매장 ID를 알아내 스키마를 직접 조회할 필요가 없어졌습니다. 백엔드가 DB를 직접 컨트롤하므로 프론트엔드 관점에서의 데이터 결측(Blocker) 이슈가 근본적으로 해결되었습니다.

### 🛠️ 남은 과제 (TODO)
* 백엔드 `POST /api/ai-agent/chat` 통신 시, Spring Security 인증 토큰(`Authorization: Bearer ...`)이 필요할 경우 `services/ai.ts`에 토큰 주입 로직을 추가해야 합니다.
* 모달 형태로 사용자에게 띄워줄 `OrderSchemaForm.tsx` (주문서 동적 폼) UI 컴포넌트의 추가 고도화 작업이 필요합니다.
