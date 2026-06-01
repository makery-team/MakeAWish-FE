# 🔐 인증 시스템 및 로그인 연동 완벽 가이드

본 문서는 MakeAWish 프론트엔드 프로젝트의 사용자 인증(Auth) 시스템 구조와 구글 소셜 로그인 연동, 그리고 토큰 갱신 로직을 종합적으로 설명하는 가이드입니다. 

---

## 1. 🚀 구글 로그인 네이티브 연동

Expo 환경에서 구글 로그인을 구현하기 위해, 브라우저 기반의 `expo-auth-session` 대신 **네이티브 공식 SDK (`@react-native-google-signin/google-signin`)**를 사용합니다. 이는 안드로이드 환경에서의 커스텀 URI 스킴 차단 문제를 해결하고 안전한 공식 팝업창을 띄우기 위함입니다.

> [!WARNING] 
> **네이티브 모듈 의존성**
> 순정 Expo Go 환경에서는 구글 로그인 네이티브 부품이 없으므로 앱이 다운될 수 있습니다. 
> 반드시 `npx expo run:android` 또는 `run:ios`를 통해 커스텀 빌드(Development Build) 환경에서 테스트해야 합니다.

### 로그인 로직 흐름
1. `GoogleSignin.hasPlayServices()` 로 플레이 서비스 사용 가능 여부 확인
2. `GoogleSignin.signIn()` 을 호출하여 구글 팝업창을 통해 인증
3. 응답받은 `userInfo.data.idToken` (최신 v16+ 기준) 추출
4. 해당 `idToken`을 백엔드 서버로 전송(`POST /api/auth/google`)하여 서비스 전용 엑세스 토큰(Access Token) 발급

---

## 2. 💾 세션 영속성 (Persistence) 관리

React Native의 `useState` 상태는 앱 종료 시 초기화되므로, `AsyncStorage`를 사용하여 토큰과 사용자 정보를 기기에 영구 저장합니다.

- **로그인 시**: 백엔드에서 받은 `accessToken`과 `refreshToken`, 그리고 사용자 기본 정보를 `AsyncStorage.setItem()`으로 기기 스토리지에 저장합니다.
- **앱 시작 시**: `AuthContext`의 `useEffect`에서 스토리지에 토큰이 존재하는지 검사하여, 로그인 상태를 복원(Auto Login)하고 메인 화면으로 즉시 라우팅합니다.

---

## 3. 🔄 토큰 재발급 (Token Refresh) 메커니즘

엑세스 토큰은 보안상 유효 기간이 짧습니다. 사용자 경험을 위해 백그라운드에서 토큰을 자동 갱신하는 로직이 적용되어 있습니다.

### `fetchWithAuth` 래퍼 (Wrapper)
모든 API 호출은 `utils/api.ts` 의 `fetchWithAuth` 함수를 거칩니다.

1. **에러 감지**: API 호출 결과가 `401 Unauthorized` 일 경우 인터셉트.
2. **토큰 재발급**: `AsyncStorage`에서 `refreshToken`을 꺼내 `POST /api/token` 에 보내 새 엑세스 토큰을 발급받습니다.
3. **재시도 (Retry)**: 새로 발급받은 엑세스 토큰으로 헤더를 교체한 뒤, 실패했던 원래의 API 요청을 다시 전송합니다.

유저는 이 모든 과정을 인지하지 못하며, 토큰 만료로 인해 로그아웃되는 불편함 없이 앱을 쾌적하게 이용할 수 있습니다.

---

## 4. 🎨 UI/UX 고도화

- **Google Branding**: 구글 로그인 버튼은 구글의 엄격한 브랜드 가이드라인(Roboto 폰트, 색상, 높이 40dp 등)을 준수하여 디자인되었습니다.
- **온보딩 애니메이션**: 렌더링 성능 최적화를 위해 `Reanimated` 라이브러리를 사용하였으며, UI 스레드에서 직접 애니메이션이 동작하도록 설계하여 부드러운 트랜지션을 제공합니다.
- **Mock Auth 전략**: 개발 단계에서 API 연동이 되지 않았을 경우를 대비해 `IS_MOCK` 플래그로 모의(Mock) 로그인을 지원하여 비즈니스 로직 테스트를 원활하게 진행할 수 있습니다.
