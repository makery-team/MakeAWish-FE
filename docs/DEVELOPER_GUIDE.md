# 🛠 [MakeAWish-FE] 개발 환경 통합 가이드

이 문서는 모든 팀원이 동일한 개발 환경을 유지하고, 의존성 충돌 없이 원활하게 프로젝트를 실행하기 위한 가이드입니다.

---

## 1. 초기 설정 (Setup)

프로젝트를 새로 받거나, 의존성 에러가 발생한 경우 다음 순서대로 실행하세요.

### 1) 환경 변수 설정
보안 및 플랫폼 호환성을 위해 `.env` 파일이 반드시 필요합니다.
1. 루트 디렉토리에 `.env` 파일을 생성합니다.
2. `.env.example`의 내용을 복사하여 붙여넣습니다.
   ```bash
   # 터미널 명령어(Windows/macOS 공통)
   cp .env.example .env
   ```

### 2) 의존성 설치
우리 프로젝트는 **Expo SDK 54**를 기준으로 고정되어 있습니다.
```bash
npm install
```

---

## 2. 개발 규칙 (Workflow)

### 1) 라이브러리 추가 시 (중요)
`npm install` 대신 반드시 **`npx expo install`**을 사용하세요.
*   **이유**: SDK 54 버전과 호환되는 최적의 버전을 자동으로 찾아줍니다.
*   **예시**: `npx expo install lucide-react-native`

### 2) 실행 및 캐시 삭제
라이브러리 버전을 변경했거나 이유 없이 화면이 뜨지 않을 때는 캐시를 삭제하며 실행하세요.
```bash
npx expo start -c
```

### 3) 로그인 테스트 (프로토타입)
현재 구글 로그인은 **모의 로그인(Mock Login)**으로 구현되어 있습니다.
*   실제 구글 계정이 없어도 로그인 버튼을 누르면 `지니테스터` 계정으로 즉시 로그인됩니다.
*   실제 구글 인증이 필요한 시점에는 `app/(auth)/login.tsx`의 주석을 해제하고 `.env`에 실제 Client ID를 입력해야 합니다.

---

## 3. 트러블슈팅 (Troubleshooting)

### Q. "Client Id property ... must be defined" 에러가 떠요.
*   **원인**: `.env` 파일이 없거나 환경 변수가 로드되지 않았습니다.
*   **해결**: `.env` 파일이 있는지 확인하고, 메트로 서버를 재시작(`npx expo start -c`)하세요.

### Q. 의존성 에러(Dependency Conflict)가 발생해요.
*   **원인**: `package.json`의 버전이 SDK 54와 맞지 않게 업데이트되었습니다.
*   **해결**: `npx expo install --check`를 실행하여 충돌을 확인하거나, `package.json`을 Git 최신 상태로 되돌린 후 다시 `npm install` 하세요.

---
**문의 사항은 담당자(박사님)에게 전달해 주세요!**
