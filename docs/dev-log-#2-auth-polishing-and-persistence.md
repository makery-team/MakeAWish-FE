# 📝 [Dev Log #2] 인증 시스템 고도화 및 세션 유지 기능 구현

본 문서는 Copilot의 PR 리뷰 피드백을 바탕으로 `feat/auth-screens` 브랜치에서 진행된 인증 시스템의 결함 수정 및 기능 고도화 내역을 기록합니다.

---

## 1. Task: PR 리뷰 피드백 반영 및 시스템 안정화

초기 구현된 인증 시스템의 논리적 허점을 보완하고, 앱 재시작 시에도 로그인 상태가 유지되도록 영속성 계층을 추가하는 것이 주요 목표였습니다.

## 2. Core Knowledge (기술 지식)

### 1) AsyncStorage를 통한 세션 영속성 (Persistence)

* **지식**: React Native의 상태(`useState`)는 앱 프로세스가 종료되면 초기화됩니다. 사용자 경험을 위해 로그인 토큰이나 유저 정보를 기기 내부에 저장해야 합니다.
* **학습 내용**: `AsyncStorage`는 비동기 키-값 저장소로, 데이터를 JSON 문자열로 직렬화하여 영구 저장합니다.
* **적용**: `AuthContext`의 `useEffect`에서 앱 시작 시 저장된 세션을 확인하고, `signIn`/`signOut` 시 데이터를 업데이트하도록 구현했습니다.

### 2) OAuth Flow의 조건부 제어 (Mock vs Real)

* **지식**: 개발 단계에서는 빠른 테스트를 위해 Mock 데이터를 사용하지만, 실제 배포 시에는 외부 라이브러리(`expo-auth-session`)의 흐름이 정상 동작해야 합니다.
* **학습 내용**: `IS_MOCK` 플래그를 통해 모의 로그인과 실제 구글 인증(`promptAsync`) 호출 로직을 명확히 분리하여, API 연동 준비가 끝났을 때 플래그 변경만으로 대응할 수 있게 설계했습니다.

### 3) 플랫폼별 UI 일관성 (Alert vs alert)

* **지식**: 브라우저의 전역 `alert()` 함수는 React Native 환경(특히 iOS/Android)에서 사용자 경험이 일관되지 않거나 동작하지 않을 수 있습니다.
* **적용**: React Native에서 제공하는 `Alert.alert()` API를 사용하여 각 플랫폼의 네이티브 다이얼로그 스타일을 따르도록 수정했습니다.

## 3. Implementation Logic (구현 로직)

### 1) 비동기 인증 함수와 타입 안정성

```typescript
// context/AuthContext.tsx
const signIn = async (userData: Pick<User, 'id' | 'email'> & Partial<User>) => {
  const newUser: User = { ...defaultValues, ...userData } as User;
  setUser(newUser);
  await AsyncStorage.setItem('user', JSON.stringify(newUser));
};
```

* **로직**: `signIn` 함수를 `async`로 전환하여 저장소 업데이트를 보장하고, `Pick` 유틸리티 타입을 사용하여 필수 필드(`id`, `email`)가 누락되지 않도록 컴파일 타임 체크를 강화했습니다.

### 2) 기존 사용자 판단 로직 추가

* **로직**: 구글 로그인 성공 시 무조건 추가 정보 입력(`signup`) 페이지로 보내는 대신, 유저 데이터에 `nickname`과 `phoneNumber`가 이미 존재하는지 확인하여 기존 사용자는 바로 메인 탭으로 이동시킵니다.

### 3) 프로필 이미지 렌더링 최적화

* **로직**: `expo-image` 라이브러리를 사용하여 구글에서 받아온 프로필 이미지 URL을 렌더링합니다. `contentFit="cover"`와 `transition` 효과를 주어 더 고급스러운 이미 로딩 경험을 제공합니다.

## 4. Troubleshooting (문제 해결)

### Reanimated useEffect 의존성 경고

* **현황**: `Particle` 컴포넌트의 `useEffect` 내에서 `useSharedValue` 객체들을 의존성 배열에 넣었으나 불필요하다는 피드백.
* **원인**: `useSharedValue`가 반환하는 객체는 참조가 변하지 않는(Stable) 객체입니다.
* **해결**: 의존성 배열에서 제거하여 불필요한 이펙트 재실행 가능성을 차단하고 가독성을 높였습니다.

---
**Next Step**: `EditorView`의 캔버스 렌더링 로직 구현 및 AI 프롬프트 연동 가이드를 작성할 예정입니다.
