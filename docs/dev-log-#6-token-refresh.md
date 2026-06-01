# 🔐 [MakeAWish-FE] 토큰 재발급 (Token Refresh) 메커니즘 도입기

이 문서는 사용자 인증 편의성을 위해 도입된 JWT 토큰 재발급 메커니즘의 필요성과 프론트엔드 레벨에서의 적용 방법을 기록한 문서입니다.

## 1. 토큰 재발급은 왜 필요한가요? 🤔

MakeAWish 앱은 보안을 위해 구글 소셜 로그인 성공 시 백엔드로부터 인증용 **JWT 엑세스 토큰(Access Token)**을 발급받아 사용합니다.
하지만 이 엑세스 토큰은 보안상의 이유로 유효 기간이 매우 짧게(통상 30분~1시간) 설정되어 있습니다.

만약 토큰 재발급 로직이 없다면 다음과 같은 심각한 **사용자 경험(UX) 저하**가 발생합니다:
1. 사용자가 앱을 켜두고 1시간 뒤에 결제를 시도하면 `401 Unauthorized` 에러가 발생합니다.
2. 서버가 응답을 거부하므로 앱은 사용자를 강제로 로그아웃 처리하고 초기 로그인 화면으로 튕겨냅니다.
3. 사용자는 **매시간마다 다시 구글 로그인을 수행**해야 하는 불편함을 겪게 됩니다.

이를 해결하기 위해, 만료 기간이 긴 **리프레시 토큰(Refresh Token)**을 함께 발급받고, 엑세스 토큰이 만료되었을 때 유저 모르게 백그라운드에서 새 토큰을 받아오는 로직이 필수적입니다.

---

## 2. 프론트엔드에서는 어떻게 적용했나요? 💻

### Step 1: 리프레시 토큰 저장하기 (`services/auth.ts`)
구글 로그인 직후 백엔드(`POST /api/auth/google`)에서 응답을 받을 때, 기존에는 `accessToken` 하나만 저장했습니다. 
이제는 응답 모델에서 `refreshToken`도 함께 추출하여 기기의 안전한 로컬 저장소(`AsyncStorage`)에 보관하도록 수정했습니다.

```typescript
const accessToken = tokenResponse.accessToken || tokenResponse.token;
const refreshToken = tokenResponse.refreshToken;

if (accessToken) await AsyncStorage.setItem("auth_token", accessToken);
if (refreshToken) await AsyncStorage.setItem("refresh_token", refreshToken);
```

### Step 2: 자동 갱신 인터셉터 만들기 (`utils/api.ts`)
매번 API를 호출할 때마다 만료되었는지 검사하는 것은 비효율적입니다. 따라서 모든 통신의 통로가 되는 공통 함수인 **`fetchWithAuth` 래퍼(Wrapper)**를 개발했습니다.

동작 원리는 다음과 같습니다:
1. **평상시:** 모든 API 요청에 자동으로 `Authorization: Bearer {accessToken}` 헤더를 붙여서 서버로 보냅니다.
2. **에러 감지:** 서버가 `401 Unauthorized` (만료됨) 에러를 뱉어내면, 에러 화면을 띄우지 않고 잠시 요청을 멈춥니다(Intercept).
3. **토큰 재발급:** 스토리지에 있던 `refreshToken`을 꺼내 `POST /api/token` 으로 조용히 재발급을 요청합니다.
4. **재시도 (Retry):** 새 엑세스 토큰을 받자마자 원래 보내려던 API 요청의 헤더를 새 토큰으로 갈아끼우고 **다시 전송**합니다.

```typescript
// 401 Unauthorized 에러 발생 시 토큰 재발급 로직 수행
if (response.status === 401) {
  const newToken = await refreshAccessToken();
  if (newToken) {
    // 새 토큰으로 헤더 업데이트 후 기존 요청 다시 보내기 (Retry)
    headers.set("Authorization", `Bearer ${newToken}`);
    response = await fetch(url, { ...options, headers });
  }
}
```

### Step 3: 프로젝트 적용
이제 `authService.getCurrentUser()` 등 보안이 필요한 API 호출 코드는 기존의 순수 `fetch` 대신 `fetchWithAuth`를 사용하도록 변경되었습니다. 
결과적으로 개발자는 토큰 만료 여부를 신경 쓸 필요 없이 API 로직만 작성하면 되며, 유저는 앱을 사용하는 내내 한 번도 끊기지 않는 매끄러운 경험을 할 수 있게 되었습니다! 🎉
