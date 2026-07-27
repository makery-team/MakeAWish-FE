# 🔐 인증 시스템 및 구글 로그인 연동 완벽 가이드

MakeAWish 프론트엔드 프로젝트의 사용자 인증(Auth) 시스템 구조와 구글 소셜 로그인 연동, 그리고 토큰 자동 갱신(Refresh) 로직 작동 방식에 대한 상세 설명서입니다.

---

## 1. 🚀 구글 로그인 네이티브 SDK 연동 (`AuthContext.tsx`)

Expo 환경에서 안전하고 매끄러운 구글 로그인을 구현하기 위해, 브라우저 리디렉션 방식 대신 **네이티브 공식 SDK (`@react-native-google-signin/google-signin`)**를 사용합니다.

> [!WARNING]
> **Expo Go 환경 주의사항**
> 순정 Expo Go 환경에서는 네이티브 구글 로그인 라이브러리를 직접 호출할 수 없습니다.
> 이를 방어하기 위해 `AuthContext.tsx`는 `Constants.appOwnership === "expo"` 검사를 수행하여, **Expo Go 모드일 경우 네이티브 모듈을 불러오지 않고 안전하게 안내 메시지를 표시**하도록 설계되어 있습니다.  
> 실제 로그인 테스트는 반드시 `npx expo run:android` 또는 `run:ios`를 통한 커스텀 빌드(Development Build) 환경에서 진행해야 합니다.

### 로그인 흐름 (Flow)
1. **Google Play 서비스 확인:** `GoogleSignin.hasPlayServices()` 호출
2. **구글 로그인 팝업:** `GoogleSignin.signIn()`을 호출하여 구글 공식 네이티브 로그인 창 실행
3. **토큰 추출:** 반환된 사용자 정보에서 구글 `idToken` 추출 (`userInfo.data.idToken`)
4. **백엔드 검증 요청:** 추출한 `idToken`을 백엔드 API (`POST /api/auth/google`)로 전송 (`services/auth.ts`)
5. **토큰 수령 및 저장:** 백엔드 검증이 완료되면 MakeAWish 서비스 전용 `accessToken`과 `refreshToken`을 받아 기기에 저장

---

## 2. 💾 세션 영속성 및 자동 로그인 (Persistence & Auto Login)

앱을 종료해도 로그인 상태가 유지되도록 React Native 기기 내부 스토리지(`AsyncStorage`)를 활용합니다.

- **로그인 성공 시:**
  - `AsyncStorage.setItem("auth_token", accessToken)`
  - `AsyncStorage.setItem("refresh_token", refreshToken)`
- **앱 실행 시 (Auto Login):**
  - `AuthContext`가 렌더링될 때 `useEffect`에서 `"auth_token"`이 존재하는지 검사합니다.
  - 토큰이 존재하면 `authService.getCurrentUser() (GET /api/users/me)`를 호출하여 유저 정보를 갱신하고 메인 화면으로 즉시 전환합니다.
  - 토큰이 유효하지 않다면 기기 내부 토큰을 정리하고 로그인 화면을 유지합니다.

---

## 3. 🔄 토큰 자동 재발급 (Token Refresh & Event Emitter)

엑세스 토큰(Access Token)의 유효 기간(1시간)이 지나도 사용자가 로그인 상태를 끊김 없이 유지할 수 있도록, **인터셉터 기반의 자동 재발급 로직(`utils/api.ts`)**이 구현되어 있습니다.

```
[앱의 API 요청] ──> (401 Unauthorized 발생)
                       │
                       ▼
       [refreshToken으로 POST /api/token 호출]
         ├── (재발급 성공) ──> 새 accessToken 저장 & 실패했던 API 자동 재요청
         └── (재발급 실패) ──> DeviceEventEmitter 'EXPIRED_SESSION' 발행 -> 자동 로그아웃 안내
```

### `fetchWithAuth` 핵심 로직 (`utils/api.ts`)
1. **헤더 자동 삽입:** `AsyncStorage`에서 `"auth_token"`을 읽어와 모든 HTTP 요청의 `Authorization: Bearer <token>` 헤더에 자동으로 추가합니다.
2. **401 에러 감지 및 갱신:** API 호출 결과가 `401 Unauthorized`이면 즉시 `refreshAccessToken()`을 호출합니다.
3. **재시도 (Retry):** 새로 발급받은 토큰을 스토리지에 갱신하고, 원래 보내려던 API 요청의 헤더를 새 토큰으로 교체하여 자동 재전송합니다.
4. **세션 만료 처리 (EXPIRED_SESSION):** 리프레시 토큰까지 만료되었을 경우, `DeviceEventEmitter.emit('EXPIRED_SESSION')` 이벤트를 발생시킵니다. `AuthContext`가 이를 감지하여 알림창을 띄우고 깔끔하게 로그아웃(`signOut()`)을 수행합니다.

---

## 4. 🎨 UI/UX 및 브랜드 가이드 준수

- **구글 공식 브랜딩 규정 준수:** 로그인 버튼(`login.tsx`)은 구글 공식 디자인 가이드라인(기본 글꼴, 40dp 이상의 터치 영역, 좌측 구글 로고 아이콘 배치)을 준수하여 제작되었습니다.
- **안전한 모달/에러 핸들링:** 로그인 진행 중 로딩 스피너(`isLoading`)를 표시하여 중복 터치를 방지하고, 네트워크 또는 통신 에러 발생 시 사용자 친화적인 안내 텍스트를 렌더링합니다.
