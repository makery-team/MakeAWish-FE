# 🚀 구글 로그인 네이티브 연동 완벽 가이드

이 문서는 아무것도 모르는 초보자도 "왜 우리가 이 복잡한 과정을 거쳐야 했는지", 그리고 "코드가 정확히 어떻게 돌아가는지" 완벽하게 이해할 수 있도록 기초부터 차근차근 설명하는 가이드입니다. 천천히 읽어보세요!

---

## 1. 배경지식: 왜 굳이 방식을 바꿨을까요?

> [!NOTE]
> **과거 방식 (Expo Go + 웹 브라우저 방식)**
> 예전에는 구글 로그인을 할 때 내 앱에서 직접 로그인하지 않고, "시스템 인터넷 브라우저(크롬 등)"를 띄워서 로그인한 뒤 그 결과만 우리 앱으로 가져오는 방식(`expo-auth-session`)을 썼습니다. 이 방식은 순정 Expo Go 앱에서도 잘 돌아갔습니다.

> [!WARNING]
> **구글의 보안 정책 변경 (현재)**
> 최근 구글이 보안을 강화하면서, **"안드로이드 앱은 절대로 브라우저 창을 띄워서 로그인하지 마! 해킹 위험이 있으니까 반드시 폰에 내장된 안전한 구글 전용 팝업창(네이티브 SDK)을 써라!"** 라며 이전 방식을 완전히 차단해 버렸습니다. (우리가 봤던 `Custom URI scheme is not enabled` 에러가 바로 그 차단벽입니다.)

### 결국 우리의 선택은?
안드로이드 기기에서 구글 로그인을 작동시키려면, 구글이 허락한 유일한 방식인 **네이티브 라이브러리(`@react-native-google-signin/google-signin`)**를 우리 앱에 이식해야만 했습니다.

---

## 2. Expo Go vs 커스텀 빌드 (Development Build)

네이티브 라이브러리를 이식하고 나니, 한 가지 문제가 생겼습니다. 바로 **Expo Go에서는 이 라이브러리가 작동하지 않는다는 점**이었습니다.

*   **🍏 순정 Expo Go:** 앱스토어에서 누구나 다운받을 수 있는 공용 껍데기 앱입니다. 자바스크립트 코드는 잘 읽지만, 우리가 방금 이식한 "구글 로그인 전용 안드로이드/iOS 네이티브 부품"은 이 껍데기 안에 들어있지 않습니다.
*   **🛠️ 커스텀 빌드 (`npx expo run:android`):** 순정 Expo Go 껍데기를 버리고, **우리 프로젝트 전용으로 직접 만든 나만의 껍데기 앱**입니다. 12분이 걸렸던 이유는 이 껍데기 안에 구글 네이티브 부품을 용접해서 넣는 작업을 컴퓨터가 수행했기 때문입니다.

> [!TIP]
> 이제 우리는 "나만의 수제 껍데기 앱(커스텀 빌드)"을 가지게 되었습니다. 이 앱을 켜고 터미널에서 `npx expo start`를 쳐서 연결하면, 예전 Expo Go 시절처럼 1초 만에 화면이 갱신되는 마법(핫리로딩)을 똑같이 쓸 수 있습니다!

---

## 3. 핵심 코드 설명 (`AuthContext.tsx`)

어렵게 느껴졌던 구글 로그인 코드를 아주 쉽게, 한 줄 한 줄 풀어서 설명해 드립니다.

### 🛡️ 1. Expo Go 안전장치 (우리가 방금 추가한 코드)
```typescript
import Constants from "expo-constants";

// 현재 실행된 앱이 앱스토어에서 받은 '순정 Expo Go'인지 확인합니다.
const isExpoGo = Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";
```
아이폰 공기계처럼 아직 나만의 껍데기(커스텀 앱)를 구워내지 못한 기기에서는 어쩔 수 없이 순정 Expo Go로 열어야 합니다. 이때 앱이 에러를 뿜으며 죽지 않도록, "지금이 Expo Go 상태인지" 검사하는 로직입니다.

### ⚙️ 2. 구글 로그인 초기 세팅
```typescript
useEffect(() => {
  if (!isExpoGo) { // 👈 Expo Go가 아닐 때(우리가 만든 커스텀 앱일 때)만 세팅을 시작해!
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }
  // ... 생략 ...
}, []);
```
앱이 켜지자마자(`useEffect`) 구글에게 "우리 앱의 신분증(Client ID)은 이거야!" 라고 알려주는 초기화 과정입니다. 백엔드 개발자분이 만들어주신 `webClientId`를 넣으면, 구글이 우리를 알아보고 정확한 토큰을 발급해 줍니다.

### 🔑 3. 진짜 로그인 버튼을 눌렀을 때 작동하는 함수
```typescript
const signInWithGoogle = async () => {
  if (isExpoGo) { // 👈 아이폰 공기계(Expo Go)에서 버튼을 누르면 작동을 멈춥니다.
    alert("Expo Go 모드입니다. 빌드된 앱에서만 작동합니다.");
    return;
  }

  try {
    setIsLoading(true);
    await GoogleSignin.hasPlayServices(); // 폰에 구글 플레이 서비스가 잘 깔려있는지 확인
    
    const userInfo = await GoogleSignin.signIn(); // 👈 폰 화면 아래에서 "구글 팝업창"이 스르륵 올라오는 마법의 코드!
    
    // v16 최신 라이브러리는 userInfo.data 안에 idToken(영수증)이 깊숙히 숨어있습니다.
    const idToken = userInfo.data?.idToken || userInfo.idToken;

    if (idToken) {
      // 구글한테 받은 영수증(idToken)을 우리 백엔드 서버에 던져서 "우리 회원 맞는지 확인해 줘!" 라고 요청합니다.
      const newToken = await authService.loginWithBackend(idToken);
      
      if (newToken) {
        setToken(newToken); // 백엔드가 확인 도장을 찍어주면 로그인 성공!
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    }
  } catch (error: any) {
    // 유저가 로그인 창을 그냥 닫아버리거나, 에러가 났을 때 처리하는 곳
    console.error("Login Failed:", error);
  } finally {
    setIsLoading(false); // 로딩 뱅글뱅글 도는 것을 멈춥니다.
  }
};
```
