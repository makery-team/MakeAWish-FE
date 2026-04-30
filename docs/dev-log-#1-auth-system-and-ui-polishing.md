# 📝 [Dev Log #1] 인증 시스템 구축 및 UI/UX 고도화 가이드

본 문서는 `feat/auth-screens` 브랜치에서 진행된 작업의 기술적 배경과 구현 로직을 상세히 기록합니다.

---

## 1. Task: 인증 시스템 기반 및 온보딩 경험 구축

단순히 화면을 그리는 것을 넘어, Expo 환경에서 안정적으로 동작하는 인증 시스템을 구축하고 브랜드 아이덴티티를 담은 UI를 완성하는 것이 목표였습니다.

## 2. Core Knowledge (기술 지식)

### 1) Expo SDK 54와 의존성 관리

* **지식**: Expo는 각 SDK 버전마다 호환되는 라이브러리 버전이 엄격하게 정해져 있습니다.
* **학습 내용**: `npm install`은 무조건 최신 버전을 가져오지만, `npx expo install`은 현재 SDK(54)와 호환되는 버전을 자동으로 찾아줍니다.
* **적용**: `expo-auth-session`과 `react-native-svg`의 버전 충돌을 해결하기 위해 SDK 54의 사양인 `~7.0.11` 및 `15.12.1`로 고정했습니다.

### 2) Mock Auth (모의 인증) 전략

* **지식**: 프로토타입 단계에서 실제 서버 API나 외부 OAuth(Google)가 준비되지 않았을 때, 비즈니스 로직의 흐름을 끊지 않기 위해 사용합니다.
* **학습 내용**: 실제 인증 함수를 호출하는 대신, `setTimeout`과 가짜 유저 데이터를 사용하여 성공 시나리오를 시뮬레이션합니다. 이를 통해 상위 컴포넌트(`AuthContext`)의 상태 변화를 미리 테스트할 수 있습니다.

### 3) Google Branding Guidelines

* **지식**: 글로벌 기업의 로그인 기능을 넣을 때는 브랜드 가이드라인(Branding Guidelines)을 엄격히 준수해야 앱 스토어 심사 거절을 방지하고 사용자 신뢰도를 높일 수 있습니다.
* **학습 내용**: 구글 로그인 버튼은 특유의 폰트(Roboto), 색상(Red, Yellow, Green, Blue), 그리고 아이콘과 텍스트의 정해진 여백(Padding)과 높이(40dp)가 있습니다. 이를 SVG와 스타일 시트로 정교하게 구현했습니다.

## 3. Implementation Logic (구현 로직)

### 1) 전역 인증 상태 관리 (`AuthContext`)

```typescript
// context/AuthContext.tsx
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);

// 로그인 여부에 따른 라우팅 제어 (app/_layout.tsx)
useEffect(() => {
  if (!user && !inAuthGroup) router.replace("/(auth)/login");
  else if (user && inAuthGroup) router.replace("/(tabs)");
}, [user, segments]);
```

* **로직**: `Context API`를 사용하여 유저 상태를 최상위에 두고, `_layout.tsx`에서 이 상태를 구독하여 인증되지 않은 유저가 메인 화면에 접근하는 것을 원천 차단합니다.

### 2) 온보딩 애니메이션 (Reanimated)

* **로직**: `useSharedValue`와 `withRepeat`를 조합하여 로고가 부드럽게 커졌다 작아지는 효과를 주었습니다.
* **UI 스레드**: `Reanimated`는 JS 스레드가 아닌 UI 스레드에서 직접 동작하므로, 앱에 과부하가 걸려도 애니메이션이 끊기지 않고 부드럽게 유지됩니다.

## 4. Troubleshooting (문제 해결)

### 에러: `androidClientId must be defined...`

* **현황**: 안드로이드 플랫폼에서 구글 로그인 기능을 사용하려 할 때 Client ID가 없어 앱이 크래시됨.
* **원인**: `expo-auth-session` 라이브러리의 엄격한 환경 변수 체크.
* **해결**: `.env` 파일을 생성하고 더미 Client ID를 할당하여 라이브러리의 체크 로직을 통과시켰습니다. 또한 `.env.example`을 만들어 팀원들이 같은 에러를 겪지 않게 조치했습니다.

---
**Next Step**: 케이크 에디터(`EditorView`) 개발 시 사용자의 드로잉 좌표 계산 및 SVG 렌더링 최적화 지식을 기록할 예정입니다.
