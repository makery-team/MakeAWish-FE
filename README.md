# 🎂 MakeAWish Frontend (Consumer Mobile App)

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Expo%20SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo%20Router-v3-black?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-NativeWind%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Naver%20Map-SDK-03C75A?style=for-the-badge&logo=naver&logoColor=white" />
  <img src="https://img.shields.io/badge/Toss%20Payments-v1%20SDK-0064FF?style=for-the-badge" />
</p>

MakeAWish 모바일 애플리케이션 프론트엔드 저장소입니다. React Native(Expo SDK 54)와 Expo Router v3 기반으로 구축되었으며, AI 대화형 주문서 작성, 캔버스 기반 도안 수정, 네이버 지도 기반 매장 탐색, STOMP 1:1 실시간 상담 채팅, 토스페이먼츠 간편결제 기능을 제공합니다.

---

## 📑 목차 (Table of Contents)
1. [기획 배경 및 핵심 기능](#1-기획-배경-및-핵심-기능)
2. [주요 화면 구성](#2-주요-화면-구성)
3. [기술 스택 및 아키텍처](#3-기술-스택-및-아키텍처)
4. [디렉토리 구조 및 역할](#4-디렉토리-구조-및-역할)
5. [핵심 엔지니어링 구현 상세](#5-핵심-엔지니어링-구현-상세)
6. [트러블슈팅 및 결함 해결 사례](#6-트러블슈팅-및-결함-해결-사례)
7. [환경 설정 및 실행 방법](#7-환경-설정-및-실행-방법)

---

## 1. 기획 배경 및 핵심 기능

- **AI 대화형 슬롯필링 주문**: 자연어 입력을 받아 매장의 커스텀 JSON Schema에 맞는 주문 옵션을 실시간 추출.
- **실물 질감 보존형 캔버스 인페인팅**: 실제 케이크 사진 위에서 원하는 영역을 마스킹하여 도안 합성.
- **네이버 지도 SDK 기반 위치 탐색**: GPS 좌표 기반 1km/3km/5km 반경 내 매장 핀 마커 및 클러스터링 제공.
- **토스페이먼츠 간편결제 & 선결제 에스크로**: 도안 승인 즉시 앱 내 웹뷰를 통해 선결제를 진행하여 노쇼를 방지.

---

## 2. 주요 화면 구성

| 화면 명칭 | 라우트 경로 | 핵심 기능 |
| :--- | :--- | :--- |
| **소셜 로그인** | `app/(auth)/login.tsx` | Google Sign-in OAuth 연동 및 비회원 둘러보기 게스트 모드 지원 |
| **홈 & AI 검색** | `app/(tabs)/index.tsx` | 상단 AI 대화형 검색바, 동적 옵션 칩 UI Guarding, 테마별 추천 케이크 그리드 |
| **네이버 지도 탐색** | `app/(tabs)/explore.tsx` | 네이버 벡터 맵, 1~5km 반경 필터, 매장 핀 마커 및 하단 프리뷰 카드 연동 |
| **1:1 상담 채팅** | `app/chat/[roomId].tsx` | STOMP 웹소켓 실시간 양방향 메시지, 인앱 주문서 요약 카드, 견적 승인 연동 |
| **AI 캔버스 에디터** | `app/editor/[id].tsx` | PanResponder 기반 핑거 마스킹 브러시, 프롬프트 입력, Inpainting 시안 비교 |
| **주문 내역 및 결제** | `app/orders/[id].tsx` | 사장님 추가금 명세서 확인, 토스페이먼츠 웹뷰 결제 팝업 트리거, 4단계 주문 상태 머신 |
| **포토 리뷰 작성** | `app/reviews/write.tsx` | 별점 평가, 갤러리 다중 이미지 선택, S3 Presigned URL 다이렉트 업로드 |

---

## 3. 기술 스택 및 아키텍처

### 3.1 코어 프레임워크 & 라우팅
- **React Native 0.76.x & Expo SDK 54**:
  - `npx expo prebuild`를 통해 네이티브 코드 자동 생성 및 서드파티 라이브러리(Naver Map, Google Sign-in)를 Config Plugin으로 안정적으로 링킹.
- **Expo Router v3 (Typed Routes)**:
  - 파일 시스템 기반 라우팅 체계 및 TypeScript 정적 타입 추론을 통한 화면 전환 런타임 오류 방지.

### 3.2 스타일링 및 레이아웃
- **Tailwind CSS (NativeWind v4)**: 컴파일 타임 최적화를 통한 성능 유지 및 일관된 디자인 시스템 적용.
- **React Native StyleSheet & Safe Area Context**: 캔버스 및 지도 오버레이 절대 배치, 물리 노치/상태바 대응.

### 3.3 상태 관리 및 네트워크
- **Context API & AsyncStorage**: 도메인별 상태 분리(`AuthContext`, `InquiryContext`, `ShopContext`) 및 세션 영속화.
- **STOMP over WebSocket (`hooks/useChatSocket.ts`)**: Spring Boot STOMP 브로커와 실시간 전이중 1:1 상담 채팅 구현.
- **네이티브 웹뷰 브릿지 (`react-native-webview`)**: 토스페이먼츠 Javascript v1 SDK 모바일 웹뷰 렌더링 및 커스텀 앱 스킴 브릿지.

---

## 4. 디렉토리 구조 및 역할

```text
MakeAWish-FE/
├── app/                                # [Routing Layer] Expo Router v3 파일 기반 라우팅
│   ├── _layout.tsx                     # 최상위 프로바이더(AuthContext, ShopContext) 바인딩
│   ├── modal.tsx                       # 공통 모달 컨테이너
│   ├── (auth)/                         # 인증 관련 라우트 그룹 (로그인, 회원가입)
│   ├── (tabs)/                         # 하단 4대 메인 탭 그룹 (홈, 지도, 채팅, 마이페이지)
│   ├── chat/[roomId].tsx               # 1:1 실시간 상담 채팅 상세 (STOMP 소켓)
│   ├── editor/[id].tsx                 # AI 캔버스 핑거 브러시 인페인팅 에디터
│   ├── orders/                         # 주문 내역 목록 및 상세/결제 화면
│   ├── reviews/write.tsx               # 수제 케이크 포토 리뷰 작성
│   └── shop/[id].tsx                   # 매장 상세 정보, 영업시간, 포트폴리오 갤러리
├── components/                         # [Presentation Layer] 재사용 가능한 UI 컴포넌트
│   ├── ai-search-bar.tsx               # AI 대화형 검색창 및 UI Guarding 옵션 칩
│   ├── editor-view.tsx                 # 터치 제스처 마스킹 캔버스
│   ├── map-view.tsx                    # 네이버 지도 SDK 래퍼 및 커스텀 핀 오버레이
│   ├── order-reminder-card.tsx         # AI 슬롯필링 완료 요약 카드
│   ├── order-status.tsx                # 4단계 주문 상태 인디케이터
│   └── TossPaymentModal.tsx            # 토스페이 결제 웹뷰 딥링크 인터셉터 모달
├── context/                            # [Domain State Layer] 비즈니스 세션 상태
├── hooks/                              # [Logic Layer] 커스텀 훅 (소켓, 주문, 인콰이어리)
├── services/                           # [Data Layer] 백엔드 및 AI REST API 통신
├── utils/                              # API 인스턴스(fetchWithAuth) 및 이미지 유틸
├── plugins/                            # Expo Config Plugin (네이버 지도 레포지토리 주입)
├── app.json                            # Expo 네이티브 설정
└── package.json                        # 의존성 명세
```

---

## 5. 핵심 엔지니어링 구현 상세

### 5.1 토큰 인터셉터 및 401 자동 재발급 (`utils/api.ts`)
`fetchWithAuth` 래퍼는 모든 API 요청 헤더에 `Authorization: Bearer <token>`을 자동 주입하며, 401(Unauthorized) 응답 발생 시 Refresh Token으로 Access Token을 무중단 재발급한 후 실패했던 원본 요청을 1회 자동 재시도합니다.

```typescript
// utils/api.ts 발췌: 401 토큰 만료 자동 갱신 및 재시도 파이프라인
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await AsyncStorage.getItem("auth_token");
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  let response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      const newHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
      response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers: newHeaders });
    } else {
      DeviceEventEmitter.emit('EXPIRED_SESSION');
    }
  }
  return response;
}
```

### 5.2 토스페이먼츠 웹뷰 딥링크 인터셉터 (`components/TossPaymentModal.tsx`)
모바일 웹뷰 내에서 결제창 호출 시 발생하는 카드사/간편결제 앱 커스텀 스킴(`kakaotalk://`, `intent://` 등)을 인터셉트하여 React Native 네이티브 `Linking.openURL`로 인계함으로써 웹뷰의 `ERR_UNKNOWN_URL_SCHEME` 크래시를 방지합니다.

```typescript
// components/TossPaymentModal.tsx 발췌: 외부 결제 앱 딥링크 라우팅
const handleShouldStartLoadWithRequest = (request: { url: string }) => {
  const { url } = request;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('about:blank')) {
    return true; // 웹뷰 내부 이동 허용
  }

  // 안드로이드 intent:// 스킴 파싱 및 앱/마켓 인계
  if (Platform.OS === 'android' && url.startsWith('intent:')) {
    Linking.openURL(url).catch(() => {
      const fallbackMatch = url.match(/browser_fallback_url=([^;]+)/);
      if (fallbackMatch?.[1]) {
        webViewRef.current?.injectJavaScript(`window.location.href = '${decodeURIComponent(fallbackMatch[1])}';`);
      }
    });
    return false;
  }
  Linking.openURL(url);
  return false;
};
```

### 5.3 대화 무결성을 지키는 UI Guarding (`components/ai-search-bar.tsx`)
AI 슬롯필링 대화 중 사용자가 필수 옵션(케이크 선택, 문의하기)을 진행해야 할 때, 임의 텍스트 타이핑으로 상태 머신이 꼬이지 않도록 클라이언트 레벨에서 입력창을 잠그고 선택지 선택을 유도합니다.

```tsx
// components/ai-search-bar.tsx 발췌: 상태 기반 입력 가드
const hasPendingReminder = messages.some(m => m.actionType === 'LOCAL_ORDER_REMINDER');
const isInputDisabled = hasPendingReminder || isAiTyping;

<TextInput
  style={[styles.input, hasPendingReminder && { color: theme.colors.textMuted }]}
  placeholder={hasPendingReminder ? "👆 위의 [문의하기] 버튼을 선택해주세요" : "답변을 입력하세요..."}
  value={inputValue}
  editable={!isInputDisabled}
  onChangeText={setInputValue}
/>
```

### 5.4 1:1 STOMP 실시간 채팅 소켓 클라이언트 (`hooks/useChatSocket.ts`)
사장님과의 1:1 상담 채팅을 위해 웹소켓 연결 시 인증 토큰을 쿼리 파라미터로 안전하게 전달하고, 수신된 메시지를 역직렬화하여 상태에 반영합니다.

```typescript
// hooks/useChatSocket.ts 발췌: WebSocket 연결 및 토큰 핸드셰이크
const token = await AsyncStorage.getItem("auth_token");
let wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/chats`;
if (roomNumber && myUserId) {
  wsUrl += `?roomNumber=${roomNumber}&userId=${myUserId}&token=${encodeURIComponent(token)}`;
}
const ws = new WebSocket(wsUrl);
ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  setMessages(prev => [...prev, data]);
};
```

---

## 6. 트러블슈팅 및 결함 해결 사례

| 문제 현상 | 원인 분석 | 해결 방법 |
| :--- | :--- | :--- |
| **Safe Area 노치 침범** | `statusBarTranslucent` 환경에서 기본 SafeAreaView가 `top: 0`으로 계산되어 헤더 텍스트 겹침 | `useSafeAreaInsets()`를 통해 물리 노치 높이를 실시간 측정하여 헤더 `paddingTop`으로 주입 |
| **`storeId` 라우팅 유실 버그** | 매장 상세에서 AI 에디터 진입 시 파라미터가 누락되어 1번 매장으로 고정되는 오결제 위험 | `useLocalSearchParams<{ storeId: string }>()`로 파라미터를 엄격히 수신하고 누락 시 진입 차단 가드 구축 |
| **중복 리뷰 작성 Red Screen 크래시** | 이미 작성한 주문에 재작성 시도시 백엔드 409 Conflict 에러 미처리로 LogBox 크래시 | try-catch 블록 및 커스텀 에러 토스트를 구축하여 안내 메시지와 함께 화면 안전 복구 |
| **토스 웹뷰 `ERR_UNKNOWN_URL_SCHEME`** | 웹뷰가 금융 앱 스킴을 웹 주소로 로딩 시도하여 크래시 발생 | `shouldStartLoadWithRequest` 콜백에서 http/https 외 스킴을 인터셉트하여 `Linking.openURL()`로 위임 |

---

## 7. 환경 설정 및 실행 방법

### 7.1 환경 변수 설정 (`.env`)

```env
EXPO_PUBLIC_API_URL=https://api.makeawish.app
EXPO_PUBLIC_WS_URL=wss://api.makeawish.app/ws-chat
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

### 7.2 설치 및 실행

```bash
# 의존성 설치
npm install

# 네이티브 빌드 파일 생성 (Config Plugin 적용)
npx expo prebuild --clean

# 안드로이드 빌드 및 실행
npx expo run:android

# Metro 번들러 실행
npx expo start
```
