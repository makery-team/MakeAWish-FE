# 💬 1:1 매장 채팅 및 실시간 통신 가이드

MakeAWish 프론트엔드 프로젝트의 사용자와 매장 간 1:1 실시간 채팅 기능 및 웹소켓(WebSocket) 통신 메커니즘, 그리고 채팅방 관리 로직에 대한 상세 가이드입니다.

---

## 1. 주요 구성 컴포넌트 및 모듈 구조

채팅 기능은 화면(UI), HTTP REST 통신 서비스, 웹소켓 커스텀 훅의 3계층으로 분리되어 동작합니다.

```
[ app/(tabs)/chat.tsx ]  ────>  [ services/chat.ts ] (방 목록 조회, 방 생성/삭제)
           │                                 │ (HTTP REST API)
           ▼                                 ▼
[ app/chat/[roomId].tsx ] ───>  [ hooks/useChatSocket.ts ] (실시간 메시지 송수신)
                                             │ (WebSocket Connection)
                                             ▼
                              [ ws://.../chats?roomNumber=X&userId=Y ]
```

- **화면 (UI 계층):**
  - `app/(tabs)/chat.tsx`: 유저의 1:1 채팅방 목록을 조회하고 렌더링하는 탭 화면
  - `app/chat/[roomId].tsx`: 특정 채팅방 진입 시 실시간 대화를 주고받는 채팅 상세 화면
- **REST 서비스 계층 (`services/chat.ts`):**
  - 채팅방 목록 조회, 신규 대화방 생성, 과거 대화 내역 조회, 채팅방 삭제(나가기) 등의 HTTP API 통신 담당
- **웹소켓 통신 계층 (`hooks/useChatSocket.ts`):**
  - 백엔드 웹소켓 서버와의 지속적 연결 유지, 실시간 메시지 수신 이벤트 핸들링 및 전송 담당

---

## 2. HTTP REST API 통신 명세 (`services/chat.ts`)

모든 HTTP 요청은 `fetchWithAuth` 래퍼를 거쳐 Bearer 토큰 인증 헤더와 함께 전송됩니다.

| 기능 | HTTP Method | Endpoint | Request Body / Params | 반환 타입 |
| :--- | :---: | :--- | :--- | :--- |
| **채팅방 목록 조회** | `GET` | `/chatting/rooms` | - | `DirectChatRoom[]` |
| **채팅방 생성/조회** | `POST` | `/chatting/room` | `{"userId": 1, "otherId": 2}` | `DirectChatRoom` |
| **과거 대화 조회** | `GET` | `/chatting/rooms/{roomNumber}/messages` | `roomNumber` (Path) | `DirectChatMessage[]` |
| **채팅방 삭제** | `DELETE` | `/chatting/rooms/{roomNumber}` | `roomNumber` (Path) | `void` |

---

## 3. 웹소켓 실시간 통신 명세 (`hooks/useChatSocket.ts`)

### ① 웹소켓 연결 URL 구조
특정 방(`roomNumber`)에 진입하면 백엔드의 웹소켓 엔드포인트(`ws://.../chats`)로 소켓을 연결하며, 방 번호와 사용자 ID를 쿼리 파라미터로 명시합니다.
```
ws://{EXPO_PUBLIC_API_URL}/chats?roomNumber={roomNumber}&userId={myUserId}
```

### ② 메시지 수신 (`ws.onmessage`)
- 서버로부터 메시지 이벤트(`JSON`)를 수신하면, 응답 객체의 `roomNumber`가 현재 활성화된 채팅방 번호와 일치하는지 검증합니다.
- 검증 통과 시 상태 배열(`messages`)의 말단에 새 메시지 객체를 마운트하여 실시간으로 화면을 갱신합니다.

### ③ 메시지 전송 Payload 규격 (`sendMessage`)
- 웹소켓 파이프(`ws.send()`)를 통해 서버로 메시지를 발송할 때 사용하는 JSON 규격입니다.
```json
{
  "userId": 1,
  "message": "안녕하세요, 케이크 예약 가능할까요?",
  "imageUrl": null,
  "roomNumber": 102
}
```

---

## 4. UX 최적화 및 상태 방어 전략

- **낙관적 업데이트 (Optimistic Update):**
  - 사용자가 메시지를 전송할 때 서버 웹소켓 응답을 기다리지 않고, 로컬 상태(`messages`)에 발송 메시지를 즉시 주입하여 지연 시간 없는 쾌적한 UX를 제공합니다.
- **순수 JS Date 객체 사용:**
  - `date-fns` 등 무거운 날짜 라이브러리 의존성을 배제하고 자바스크립트 내장 `Date` 객체의 `toLocaleTimeString()`, `toLocaleDateString()` 함수만으로 상대 날짜 포맷을 가볍게 변환합니다.
- **예외 방어 (Graceful Degradation):**
  - 네트워크 연결 끊김 또는 백엔드 웹소켓 서버 점검 시, 애플리케이션 크래시 없이 빈 방 목록 및 알림창을 렌더링하도록 예외 처리되어 있습니다.
