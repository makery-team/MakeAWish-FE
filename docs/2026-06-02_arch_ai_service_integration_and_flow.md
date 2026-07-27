# 🤖 AI 챗봇 및 이미지 인페인팅 서비스 아키텍처 명세서

MakeAWish 프론트엔드 프로젝트의 대화형 AI 케이크 맞춤 주문 및 이미지 인페인팅(AI 디자인 수정) 기능이 백엔드와 통신하고 화면을 렌더링하는 아키텍처 및 API 명세서입니다.

---

## 1. 아키텍처 개요 (Backend Orchestrator 패턴)

### 과거 방식 (Frontend Orchestrator - 폐기됨)
- 프론트엔드가 AI 추천 서버, 매장 정보 서버, DB 서버 등 다수의 API를 순차적으로 직접 호출하여 상태와 순서를 관리했습니다.
- **문제점:** 다중 통신에 따른 복잡도 증가, 중간 단계 네트워크 실패 시 데이터 무결성 손상, 비즈니스 로직의 클라이언트 종속 심화.

### 현재 적용된 방식 (Backend Orchestrator)
- 프론트엔드는 유저의 요청을 **백엔드 메인 서버(`Spring Boot`)의 AI 에이전트 엔드포인트**로 전송합니다.
- 백엔드 서버가 내부적으로 AI 마이크로서비스 호출, 포트폴리오 검색, 주문 가능 여부 조회 등을 모두 통합 처리(Orchestration)한 뒤, 프론트엔드에게 **어떤 UI 컴포넌트를 렌더링할지(`actionType`)와 필요한 데이터(`data`)**를 표준화된 규격으로 반환합니다.
- 프론트엔드는 비즈니스 계산 로직 없이, 반환된 `actionType`에 매칭되는 선언적 UI 카드 컴포넌트만 동적으로 마운트하는 '순수 뷰(View)' 역할에 집중합니다.

---

## 2. 핵심 API 서비스 규격 (`services/ai.ts`)

프론트엔드의 `aiService` 모듈은 사용자 인증 토큰(`fetchWithAuth`)을 사용하여 아래 4가지 핵심 엔드포인트를 호출합니다.

### ① 대화형 주문 AI 챗봇 통신
- **Endpoint:** `POST /api/ai-agent/chat`
- **Request Body:**
  ```json
  {
    "message": "딸기맛 1호 사이즈로 생일 축하 문구 넣어서 주문하고 싶어요.",
    "productId": 12
  }
  ```
  *(참고: 사용자 식별자(`userId`)는 헤더의 JWT Bearer Token에서 백엔드가 자동 추출하므로 바디에 포함하지 않습니다.)*
- **Response Structure (`AiAgentResponse`):**
  ```json
  {
    "message": "주문 내역을 꼼꼼히 확인해주세요!",
    "actionType": "CONFIRM_SLOTS",
    "data": {
      "slots": {
        "디자인": "포트폴리오 #12",
        "맛": "초코",
        "사이즈": "1호",
        "문구": "HBD Mom!"
      }
    }
  }
  ```

### ② 대화 내역 초기화
- **Endpoint:** `DELETE /api/ai-agent/chat`
- **Role:** 백엔드 서버에 저장된 현재 로그인 유저의 AI 챗봇 대화 세션과 이전 주문 슬롯 정보를 모두 초기화합니다.

### ③ 포트폴리오 이미지 기반 인페인팅 (AI 디자인 수정)
- **Endpoint:** `POST /api/ai-agent/inpaint/{portfolioId}`
- **Request Body:**
  ```json
  {
    "prompt": "케이크 위에 핑크색 리본 장식을 추가해줘",
    "maskImage": "base64_encoded_mask_string...",
    "currentImage": "optional_base64_current_image..."
  }
  ```
- **Role:** 기존 포트폴리오 이미지 위에 사용자가 드로잉한 영역(Mask)과 프롬프트를 AI 서버에 전달하여 수정된 케이크 이미지를 비동기로 생성합니다.

### ④ 인페인팅 결과 상세 조회 (Polling)
- **Endpoint:** `GET /api/ai-agent/inpaint/{portfolioId}/{inpaintingId}`
- **Role:** 비동기로 진행되는 AI 이미지 생성 작업의 진행 상태 및 최종 완료 이미지를 가져오기 위한 폴링(Polling) API입니다.

---

## 3. UI 렌더링 매핑 구조 (`AIActionType`)

백엔드의 응답 객체에 포함된 `actionType` 값에 따라 아래와 같이 UI 컴포넌트가 동적으로 전환됩니다.

| `actionType` 값 | 설명 | 마운트되는 UI 컴포넌트 |
| :--- | :--- | :--- |
| `PORTFOLIO_LIST` | 추천 케이크 디자인 목록 제공 | 케이크 이미지 갤러리 카드 |
| `SHOW_SCHEMA` | 케이크 커스텀 가능 항목 안내 | 선택 가능 옵션(맛/사이즈/시트) 칩 뷰 |
| `CONFIRM_SLOTS` | 주문 슬롯 입력 확인 단계 | 주문서 요약 및 수정/확인 카드 |
| `ORDER_SUMMARY` | 최종 금액 산출 및 결제 확인 | 최종 견적서 및 주문 수락 버튼 |
| `ORDER_COMPLETE` | 주문 및 문의 성공 완료 | 완료 안내 배지 및 대화창 이동 링크 |

---

## 4. 아키텍처 이점

1. **안전한 사용자 식별:** 클라이언트 위조를 방지하기 위해 URL이나 바디로 `userId`를 넘기지 않고 JWT 인증 헤더를 기반으로 통신합니다.
2. **프론트엔드 경량화:** 복잡한 대화 상태(State)와 슬롯 추출 로직이 백엔드로 위임되어, 프론트엔드는 UI 렌더링에만 집중하므로 네이티브 앱 성능과 유지보수성이 향상되었습니다.
3. **유연한 기능 확장:** 신규 UI 플로우가 추가되더라도 프론트엔드는 새로운 `actionType`에 매칭되는 카드 컴포넌트만 마운트하면 됩니다.
