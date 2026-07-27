# 🚀 백엔드 API 명세서 동기화 및 인터페이스 변경 명세

MakeAWish 프론트엔드 프로젝트와 백엔드 API 서버(`MakeAWish-BE`) 간의 인가(Authorization) 및 데이터 송수신 불일치 이슈를 해결한 내역 및 검증 환경 가이드입니다.

---

## 1. 주요 개선 및 변경 내역

### ① 백엔드 (`MakeAWish-BE`) 보안 및 URL 파라미터 보완
- **AI 엔드포인트 인증 정책 강화 (`SecurityConfig.java`):**
  - 기존에는 `/api/ai-agent/**` 경로가 `permitAll()`로 설정되어 있어, 만료된 토큰 요청이 필터를 통과한 후 Controller 내부에서 인증 객체 부재로 500 Server Error를 유발했습니다.
  - 해당 경로를 `authenticated()`로 지정하여 만료되거나 유효하지 않은 토큰에 대해 정상적인 `401 Unauthorized`를 반환하도록 수정했습니다.
- **AWS S3 서명 URL(Presigned URL) 손실 버그 수정 (`AiInpaintedDesignService.java`):**
  - 프론트엔드로부터 전달받은 S3 이미지 URL에서 쿼리스트링(`split("\\?")[0]`)을 제거하던 코드를 삭제하여 S3 서명 토큰이 AI 마이크로서비스까지 온전히 전달되도록 수정했습니다.

### ② 프론트엔드 (`MakeAWish-FE`) 통신 래퍼 적용 및 로직 단순화
- **AI 서비스 모듈의 인가 인터셉터 적용 (`services/ai.ts`):**
  - `aiService` 내의 통신 함수들이 일반 `fetch` 대신 `utils/api.ts`의 `fetchWithAuth`를 사용하도록 교체되었습니다.
  - 백엔드가 반환하는 401 에러를 인터셉트하여 백그라운드 토큰 재발급 후 자동 재시도하는 흐름이 AI 챗봇 및 인페인팅 기능 전체에 적용되었습니다.
- **이미지 Base64 변환 로직 제거 및 URL 직접 전송 (`editor-view.tsx`):**
  - 백엔드의 S3 쿼리스트링 절삭 버그를 우회하기 위해 임시로 적용되었던 고비용 Base64 인코딩 전송 코드를 제거하고, 원본 S3 URL을 가볍게 전달하도록 롤백 및 최적화했습니다.

---

## 2. 개발 및 로컬 연동 검증 가이드

로컬 개발 환경에서 백엔드와 프론트엔드의 토큰 갱신 및 API 동기화 상태를 검증하는 절차입니다.

### ① 로컬 백엔드 및 AI 서버 구동
1. **Spring Boot (`MakeAWish-BE`):** `http://localhost:8080` 포트로 서버 구동
2. **AI 마이크로서비스 (`MakeAWish-AI`):** `http://localhost:8000` (`uvicorn main:app --reload`) 구동

### ② 프론트엔드 환경 변수(`.env`) 설정
AWS 프로덕션 URL 대신 로컬 호스트를 바라보도록 환경 변수를 변경합니다.
```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```
*(참고: Android 에뮬레이터에서 호스트 OS의 로컬 서버에 접근할 경우 `http://10.0.2.2:8080`을 사용합니다.)*

### ③ 401 토큰 자동 재발급 및 이벤트 감지 테스트
- 앱 내 로그인을 완료한 뒤 기기 스토리지(`AsyncStorage`)의 `"auth_token"` 값을 강제로 변조하거나 유효 기간 1시간 경과를 시뮬레이션합니다.
- `AI 챗봇` 또는 `케이크 디자인 문의` 액션 수행 시 프론트엔드의 `fetchWithAuth`가 `POST /api/token`을 통해 새 액세스 토큰을 수령하고, 원래 요청을 에러 없이 재수행하는지 네트워크 로그로 확인합니다.
