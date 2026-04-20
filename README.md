# 📋 [MakeAWish-FE] 기술 실사 및 이식 상세 보고서 (A to Z)

---

## 1. 초기 환경 설정 (Environment Setup)

프로젝트는 고성능 애니메이션과 유연한 라우팅을 목표로 다음 스택으로 구성되었습니다.

### 🛠 핵심 스택 (Core Stack)

- **Framework**: Expo SDK 54 (Managed Workflow)
- **Routing**: Expo Router v3 (File-based Routing)
- **Styling**: React Native StyleSheet (Native CSS-in-JS)
- **Animation**: React Native Reanimated v3 (UI-thread animations)
- **Gestures**: React Native Gesture Handler (Native gesture recognition)
- **Icons**: Lucide React Native (Consistent icon system)

### 📦 주요 의존성 및 설정 이유

- `expo-image`: 웹 프로토타입의 고해상도 케이크 이미지를 캐싱하고 부드럽게 렌더링하기 위함.
- `react-native-svg`: 지도(`MapView`) 및 에디터(`EditorView`)의 벡터 그래픽 처리를 위함.
- `expo-router`: 네이티브 앱의 계층 구조를 파일 시스템으로 관리하여 딥링크 및 뒤로가기 처리를 표준화함.

---

## 2. 아키텍처 및 컴포넌트 역할 (Component Roles)

### 🏗 전역 구조 (Global Architecture)

- **`app/` (Routing Layer)**: 화면의 진입점 정의. 데이터 패칭 및 레이아웃 래핑 역할.
- **`components/` (UI Layer)**: 순수 UI 및 프레젠테이션 로직.
- **`hooks/` (Logic Layer)**: 비즈니스 로직 및 상태 관리 추상화.
- **`constants/` (Design System)**: 컬러 팔레트, 폰트 크기, 공통 간격 정의.

### 📱 핵심 컴포넌트 상세 분석

#### 1) `AISearchBar` (AI 플래너 및 바텀 시트)

- **역할**: 앱 전체에서 AI와 소통하는 메인 인터페이스.
- **핵심 로직**:
  - **3-Point Snapping**: `CLOSED_Y`, `HALF_Y`, `FULL_Y` 좌표를 계산하여 드래그 시 자석처럼 붙는 제스처 구현.
  - **Keyboard Sync**: `useAnimatedKeyboard`를 통해 키보드 노출 시 입력창이 가려지지 않도록 실시간 위치 보정.
  - **Tab Bar 대응**: 하단 탭 바가 `absolute`인 점을 고려하여 `tabBarHeight`만큼의 유동적 패딩 적용.

#### 2) `EditorView` (AI 이미지 편집기)

- **역할**: 선택한 케이크 이미지를 사용자의 요구에 맞게 수정.
- **핵심 로직**:
  - **SVG Path Drawing**: 사용자의 터치 좌표를 `Svg Path` 데이터로 변환하여 실시간 드로잉 구현.
  - **Undo/Redo**: 그리기 경로를 배열로 관리하여 스택 기반의 실행 취소/다시 실행 지원.

#### 3) `MapView` (SVG 기반 지도)

- **역할**: 위치 기반 상점 탐색 경험 제공.
- **핵심 로직**:
  - **Marker Clustering**: 상점 데이터를 좌표 기반으로 배치하고, 클릭 시 Reanimated 팝업 애니메이션 실행.
  - **Navigation 연동**: 마커 상세 보기 클릭 시 `router.push('/shop/[id]')`를 통한 페이지 전환.

#### 4) `Header` (Global Navigation)

- **역할**: 브랜드 아이덴티티 노출 및 뷰 모드 전환.
- **핵심 로직**:
  - **ViewMode Toggle**: 홈 화면의 리스트/지도 보기를 스위칭하며, `useNavigation` 훅의 상태를 전역적으로 반영.

---

## 3. 핵심 비즈니스 로직 (Core Logic)

### 🧠 상태 관리 흐름 (State Management)

1. **내비게이션 (`useNavigation`)**:
    - 단순히 화면 전환을 넘어, `list`와 `map` 사이의 뷰 상태를 동기화하고 헤더/버튼의 노출 여부를 제어함.
2. **AI 상담 프로세스 (`useInquiry`)**:
    - **단계별 상태 머신**: [디자인 선택] → [픽업 정보] → [문구 입력] → [확정] 순서로 흐르는 대화 상태 관리.
    - **Context 연동**: 상담 완료 시 생성된 주문 데이터를 전역 `ShopContext`에 저장하여 주문 내역에서 즉시 확인 가능하게 함.
3. **동적 레이아웃 계산**:
    - `useBottomTabBarHeight`와 `useSafeAreaInsets`를 결합하여, 기기의 노치 디자인이나 탭 바 유무에 상관없이 하단 여백을 픽셀 단위로 정밀하게 계산.

---

## 4. 진행 현황 및 로드맵 (A to Z Status)

### [A-G] 초기화 및 기반 (100%)

- [x] 프로젝트 초기화 및 환경 변수 설정
- [x] 디자인 시스템(Color/Typography) 정의
- [x] 공통 타입 시스템 구축
- [x] 파일 기반 라우팅 설계 및 구현

### [H-N] 메인 기능 및 UI (90%)

- [x] 홈 화면 리스트/지도 통합 뷰 구현
- [x] **AISearchBar 제스처 및 UX 안정화 (최근 해결)**
- [x] 추천 태그 및 검색 필터링 연동
- [x] 상점 상세 정보 레이아웃 이식

### [O-U] 상세 로직 및 상담 (60%)

- [x] 이미지 슬라이더 및 갤러리 인터랙션
- [x] 케이크 찜하기/주문하기 기본 연동
- [ ] **EditorView AI 명령어 연동 및 UI 고도화 (Next Step)**
- [ ] 상담 프로세스 예외 처리 및 유효성 검사

### [V-Z] 최종 폴리싱 및 데이터 (30%)

- [ ] `AsyncStorage`를 통한 데이터 영속성 확보
- [ ] `mock-data`를 실제 API 호출로 전환 (Service Layer 구축)
- [ ] 출시용 앱 아이콘 및 스플래시 화면 적용

---
*최종 업데이트: 2026. 04. 10.*

---

## 5. Google 로그인 설정 (Expo AuthSession)

로그인 화면은 실제 Google OAuth 흐름을 사용하도록 구성되어 있습니다.

- 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 채웁니다.

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
```

- Google Cloud Console에서 플랫폼별 OAuth Client ID를 발급합니다.
- Expo 스킴은 `makeawishfe`를 사용합니다(`app.json` 기준).
- 개발 중에는 `npx expo start` 재시작 후 로그인 버튼을 테스트합니다.

참고: 버튼 스타일은 Google 브랜딩 형태(40px 높이, 흰 배경, 테두리, 좌측 G 아이콘)를 따르되, 정책 변경 대응을 위해 주기적인 검토가 필요합니다.
