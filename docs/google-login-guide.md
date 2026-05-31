# 🚀 [주니어 개발자를 위한] 구글 로그인 네이티브 연동 완벽 가이드

이 문서는 React Native와 Expo 환경에서 구글 로그인을 구현할 때 마주치는 **"가장 치명적인 에러의 원인"**부터 **"코드 한 줄 한 줄의 의미"**까지, 이제 막 입문한 주니어 개발자도 100% 이해할 수 있도록 아주 상세하게 풀어쓴 가이드입니다.

---

## 🛑 1. 기존 코드의 치명적인 문제점

우리가 처음에 작성했던 구글 로그인 코드는 `expo-auth-session`과 `expo-web-browser`를 사용한 **"브라우저 기반 로그인"** 방식이었습니다.

### ❓ 옛날엔 어떻게 했나요?
1. 앱에서 로그인 버튼을 누르면, 스마트폰의 **'인터넷 브라우저(크롬, 사파리 등)'** 창이 쓱 올라옵니다.
2. 브라우저에서 구글 아이디와 비밀번호를 치고 로그인을 완료합니다.
3. 구글이 `com.makery.makeawish:/` 같은 **'커스텀 URI 스킴(딥링크)'**을 통해 우리 앱을 다시 깨우면서 영수증(토큰)을 쥐여줍니다.

### 💥 무엇이 문제였나요? (에러 발생의 원인)
이 방식은 예전에는 잘 작동했지만, **현재 안드로이드 환경에서는 완전히 막혔습니다.**
구글이 보안 정책을 엄청나게 강화하면서 다음과 같이 선언했기 때문입니다.

> **Google 曰:** "안드로이드 앱에서 인터넷 브라우저 창 띄워서 로그인하는 거 너무 위험해! 나쁜 해킹 앱이 너희 앱인 척하고 `com.makery.makeawish:/` 주소를 가로챌 수도 있잖아? 그러니까 이제 안드로이드에서는 **무조건 앱 서명(APK)이 검증되는 '네이티브 공식 SDK(Google Play Services)'**만 써! 브라우저 방식 쓰면 **Error 400: Custom URI scheme is not enabled** 띄우고 다 차단해 버릴 거야!"

---

## 🛠️ 2. 해결 방법: 네이티브 SDK 도입

구글의 차단벽을 뚫기 위한 유일한 정답은 구글이 공식적으로 요구하는 **`@react-native-google-signin/google-signin` 라이브러리를 설치**하는 것이었습니다.

이 라이브러리는 브라우저를 띄우지 않고, 안드로이드 폰 자체에 깔려 있는 구글 시스템을 직접 호출해서 **"화면 아래에서 스르륵 올라오는 안전한 공식 팝업창"**을 띄워줍니다.

### ⚠️ Expo Go의 한계와 커스텀 빌드 (Development Build)
새로운 정답을 찾았지만, 주니어 개발자들이 여기서 가장 많이 멘붕에 빠집니다. **"어? 이 라이브러리를 깔았더니 Expo Go에서 빨간 화면이 뜨면서 앱이 죽어요!"**

*   **🍏 순정 Expo Go:** 자바스크립트 코드만 읽을 수 있는 미리 만들어진 공용 껍데기입니다. 우리가 방금 설치한 '구글 네이티브 부품'은 자바(Java)와 C++로 만들어져 있어서 순정 껍데기 안에는 들어있지 않습니다.
*   **🛠️ 커스텀 빌드 (`npx expo run:android`):** 순정 Expo Go를 버리고, **우리 앱 전용 네이티브 부품(구글 로그인 등)을 모두 용접해서 넣은 "나만의 수제 껍데기 앱"**을 새로 구워내는 과정입니다. 이 과정을 한 번만 거쳐서 폰에 설치해 두면, 예전 Expo Go 시절처럼 1초 만에 코드가 새로고침(핫리로딩) 되는 편안한 개발이 다시 가능해집니다!

---

## 💻 3. 로직 및 코드 상세 분석 (`AuthContext.tsx`)

어렵게 느껴지는 구글 로그인 코드를 아주 쉽게, 논리적인 흐름에 따라 한 줄 한 줄 뜯어보겠습니다.

### 단계 1: Expo Go를 위한 "안전장치" 만들기
```typescript
import Constants from "expo-constants";

// [설명] 현재 앱이 '앱스토어에서 받은 순정 Expo Go'인지 검사합니다.
// 나중에 맥북이 없는 팀원이 아이폰 공기계(순정 Expo Go)로 UI 디자인만 확인하고 싶을 때,
// 네이티브 코드가 없어서 앱이 죽어버리는 것을 막기 위한 필수 방어막입니다.
const isExpoGo = Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";
```

### 단계 2: 구글에게 우리 앱의 신분증(Client ID) 제출하기
```typescript
  useEffect(() => {
    // [설명] Expo Go 상태일 때는 이 세팅을 무시합니다. (안 그러면 에러가 나니까요!)
    if (!isExpoGo) {
      // [설명] 앱이 처음 켜질 때 딱 한 번 실행되는 초기 세팅입니다.
      GoogleSignin.configure({
        // [핵심] 백엔드에서 발급받은 '웹용 클라이언트 ID'를 넣어야 합니다.
        // 앱인데 왜 웹용 ID를 넣냐고요? 안드로이드 기기 안에서는 네이티브로 로그인하지만, 
        // 최종적으로 백엔드 서버(웹)에 토큰을 던져서 "이 유저 진짜 구글 회원 맞지?" 하고 
        // 교차 검증을 받아야 하기 때문입니다.
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        offlineAccess: false,
      });
    }
    // ... 생략 (이후 저장된 토큰이 있는지 검사하는 자동 로그인 로직이 이어집니다) ...
  }, []);
```

### 단계 3: 로그인 버튼을 눌렀을 때의 험난한 여정
```typescript
  // 유저가 "구글 로그인" 버튼을 터치했을 때 실행되는 함수입니다.
  const signInWithGoogle = async () => {
    
    // [안전장치 발동] 아이폰 공기계(순정 Expo Go)에서 버튼을 누르면 여기서 멈춥니다.
    if (isExpoGo) {
      alert("Expo Go 모드입니다. 빌드된 커스텀 앱에서만 실제 로그인이 작동합니다.");
      return;
    }

    try {
      setIsLoading(true); // 로딩 스피너(빙글빙글)를 켭니다.
      
      // 1. 유저의 스마트폰에 구글 플레이 서비스가 제대로 깔려있는지 확인합니다.
      await GoogleSignin.hasPlayServices(); 
      
      // 2. 화면 아래에서 구글 공식 팝업창이 올라옵니다! 유저가 계정을 선택할 때까지 코드 진행이 멈춥니다(await).
      // 유저가 계정을 선택하면, 구글이 'userInfo'라는 보따리에 유저 정보를 담아서 줍니다.
      const userInfo = await GoogleSignin.signIn(); 
      
      // 3. [최신 라이브러리(v16) 주의사항] 🚨
      // 구버전 라이브러리는 userInfo.idToken 처럼 바로 토큰을 줬지만,
      // 최신 버전은 userInfo.data.idToken 처럼 'data'라는 이중 보따리 안에 토큰을 숨겨두었습니다!
      // (이걸 몰라서 "토큰이 없어!"라는 에러로 며칠을 고생하는 주니어들이 엄청 많습니다.)
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (idToken) {
        // 4. 구글한테 받은 영수증(idToken)을 우리 백엔드 서버로 보냅니다.
        // "백엔드야, 유저가 구글 로그인 성공했어! 이 영수증 진짜인지 확인해 줘!"
        const newToken = await authService.loginWithBackend(idToken);
        
        if (newToken) {
          // 5. 백엔드가 "확인 완료! 우리 서비스 전용 토큰을 발급해 줄게" 라고 하면 로그인 대성공!
          setToken(newToken);
          const userData = await authService.getCurrentUser(); // 유저 닉네임, 사진 등을 가져옵니다.
          setUser(userData);
        }
      } else {
        throw new Error("No ID token returned from Google Sign In");
      }
    } catch (error: any) {
      // [예외 처리] 유저가 마음이 바뀌어서 로그인 팝업창을 그냥 닫아버린 경우
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("유저가 로그인을 취소했습니다.");
      } else {
        console.error("로그인 중 알 수 없는 에러 발생:", error);
      }
    } finally {
      setIsLoading(false); // 로딩 스피너를 끕니다.
    }
  };
```

---

## 💡 주니어를 위한 요약 꿀팁
1. 브라우저 띄워서 로그인하는 옛날 튜토리얼 블로그 글들은 이제 잊으세요. 안드로이드에서는 다 막혔습니다.
2. 네이티브 부품을 쓴 이상, 무조건 `npx expo run:android`로 나만의 커스텀 빌드를 뽑아내야 합니다. (빌드가 10분 넘게 걸려도 당황하지 마세요. 처음 딱 한 번만 오래 걸립니다!)
3. 라이브러리 버전이 오르면서 리턴 받는 데이터 구조(ex. `userInfo.data.idToken`)가 몰래 바뀌는 경우가 허다합니다. 에러가 나면 반드시 `console.log(userInfo)`를 찍어서 껍데기를 까보는 습관을 들이세요!
