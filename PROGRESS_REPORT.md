# 📋 프로젝트 이식 진행 상황 보고서 (MakeAWish-FE)

본 보고서는 Figma 프로토타입 코드를 React Native + Expo 환경으로 이식하는 작업의 현재 단계와 향후 계획을 정리한 문서입니다.

## 1. 완료된 작업 (Completed)

### 🏗 아키텍처 및 기반 설정
- [x] **기본 라이브러리 구성**: `lucide-react-native`, `expo-image`, `react-native-svg`, `react-native-reanimated` 등 핵심 의존성 설치 및 설정 완료
- [x] **글로벌 타입 시스템 이식**: 프로토타입의 모든 TypeScript 인터페이스(`ViewMode`, `Order`, `Cake` 등)를 `@/types` 경로로 이식하여 타입 안정성 확보
- [x] **테마 시스템 구축**: `constants/theme.ts`에 서비스 전용 컬러 팔레트(`primary`, `secondary` 등) 및 폰트 설정 정의

### 🧠 상태 관리 및 비즈니스 로직 (Hooks)
- [x] **6종 핵심 커스텀 훅 구현**:
    - `use-navigation`: 복잡한 뷰 모드 전환 및 아이템 선택 상태 관리
    - `use-inquiry`: AI 상담 프로세스 단계별 상태 및 대화 히스토리 관리
    - `use-orders`: 주문 데이터 생성 및 주문 상태 추적 로직 이식
    - `use-favorites`: 사용자 찜 목록 관리 (로컬 상태 기반)
    - `use-filter`: 케이크 카테고리별 필터링 기능 구현
    - `use-reviews`: 사용자 리뷰 목록 및 삭제 로직 이식

### 🎨 UI 컴포넌트 변환 (Web → Native)
- [x] **메인 화면 구성 요소**: `Header`, `RecommendationTags`, `CakeGrid`, `CakeCard` 등을 네이티브 컴포넌트로 재구축
- [x] **상세 및 편집 뷰**: `ShopDetail`, `EditorView`, `MapView`(SVG 기반 모크) 구현 완료
- [x] **마이페이지 및 주문 관리**: `MyPage`, `OrderStatus`, `FavoritesView`, `ReviewsView` 변환 완료
- [x] **공통 인터랙션 요소**: `ImageSlider`, `OrderReminderCard` 등 슬라이더 및 카드 UI 최적화

### 📱 UX 및 인터랙션 고도화
- [x] **공식 탭 바 연동**: 수동 메뉴 대신 Expo Router의 `Tabs` 시스템을 사용하여 네이티브 하단 메뉴 구현
- [x] **동적 레이아웃 최적화**: `useBottomTabBarHeight`를 활용하여 탭 바 높이에 따라 AI 검색바 위치가 자동 조정되도록 개선
- [x] **키보드 사용자 경험(UX) 개선**:
    - `useAnimatedKeyboard`를 적용하여 키보드 노출 시 입력창이 실시간으로 따라 올라오도록 구현
    - 메시지 전송 및 시트 닫기 동작 시 `Keyboard.dismiss()`를 통한 키보드 제어 자동화
    - 채팅 목록 드래그 시 키보드가 자연스럽게 닫히는 `keyboardDismissMode` 적용

---

## 2. 현재 상태 (Current Status)
- **레이아웃 안정성**: 하단 탭 바와 AI 검색바가 적층 구조로 배치되어 기기별 여백(Safe Area)을 완벽하게 준수함.
- **인터랙션 완성도**: 키보드와 바텀시트 간의 간섭이 해결되었으며, 프로토타입의 핵심 대화 흐름이 모바일 환경에서 매끄럽게 작동함.
- **코드 구조**: 모든 컴포넌트가 `@/components`, `@/hooks`, `@/types` 등으로 구조화되어 유지보수가 용이함.

---

## 3. 향후 과제 (TODO)

### 🛠 기능 고도화 (Short-term)
- [ ] **파일 기반 라우팅(Route-based) 전환**: 현재 `index.tsx` 내의 뷰 모드 로직을 실제 페이지 경로(`/shop/[id]`, `/orders` 등)로 분리하여 딥링크 대응
- [ ] **지도 라이브러리 적용**: SVG 모크 지도를 `react-native-maps`를 활용한 실제 지도(Google/Apple Maps)로 교체
- [ ] **사용자 에셋 업로드**: `EditorView` 및 리뷰 작성 시 기기 갤러리에서 이미지를 선택하여 업로드하는 기능 추가
- [ ] **데이터 영속성 확보**: `AsyncStorage` 또는 `SQLite`를 연동하여 앱 재시작 시에도 주문 및 찜 목록 보존

### 🧪 안정성 및 품질 개선 (Mid-term)
- [ ] **실제 API 연동**: `mock-data.ts`를 걷어내고 백엔드 서버(REST/GraphQL)와의 실데이터 통신 구현
- [ ] **고급 애니메이션 폴리싱**: 각 화면 전환 시 Lottie 또는 Reanimated를 활용한 부드러운 트랜지션 추가
- [ ] **접근성(Accessibility) 강화**: 스크린 리더 지원 및 폰트 크기 대응 등 접근성 표준 준수

### 🚀 프로덕션 준비 (Long-term)
- [ ] **브랜딩 에셋 적용**: 서비스 전용 앱 아이콘, 스플래시 화면, 고해상도 그래픽 리소스 적용
- [ ] **에러 핸들링 및 로깅**: 네트워크 오류 대응 UI 구현 및 분석 툴(Sentry 등) 연동
- [ ] **앱 스토어 최적화(ASO)**: 출시를 위한 메타데이터 준비 및 빌드 최적화

---
*최종 업데이트: 2026. 04. 06.*
