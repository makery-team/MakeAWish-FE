# 📚 MakeAWish 프론트엔드(FE - React Native) 기술 문서 및 가이드 색인 (Documentation Index)

이 디렉토리(`docs/`)는 MakeAWish 프론트엔드(React Native / Expo) 프로젝트의 개발 가이드, 기능 명세 및 아키텍처 문서를 관리합니다.  
문서 이름만 보고도 어떤 내용인지 한눈에 파악할 수 있도록 **표준 문서 네이밍 규칙** 및 분류 체계를 준수합니다.

---

## 📐 문서 네이밍 규칙 (`YYYY-MM-DD_[분류]_[직관적_주제].md`)

```
예시: 2026-06-02_guide_oauth_jwt_auth_system.md
       (날짜)       (분류: 가이드)    (주제: OAuth 및 JWT 인증 시스템)
```

| 분류 접두어 | 설명 | 문서 예시 |
| :---: | :--- | :--- |
| `guide_` | 프론트엔드 개발 환경 설정 및 공통 UI/UX 개발 가이드 | `2026-05-31_guide_react_native_expo_setup.md` |
| `arch_` | 프론트엔드 전체 시스템 구조 및 백엔드/AI 연동 아키텍처 | `2026-06-02_arch_ai_service_integration_and_flow.md` |
| `devlog_` | 주요 피처 마이그레이션 및 리팩토링 개발 일지 | `2026-06-01_devlog_mypage_migration.md` |

---

## 📋 문서 목록 (Index - 시간순 정렬)

### 1. 🛠️ 온보딩 & 공통 개발 가이드 (`guide_`)
* [`2026-05-31_guide_react_native_expo_setup.md`](./2026-05-31_guide_react_native_expo_setup.md) : 개발 환경 세팅 (React Native, Expo, 전역 상태 등)
* [`2026-05-31_guide_react_native_fundamentals.md`](./2026-05-31_guide_react_native_fundamentals.md) : React Native 핵심 컴포넌트 및 네이티브 동작 기초 가이드
* [`2026-05-31_guide_safe_area_and_edge_to_edge_ui.md`](./2026-05-31_guide_safe_area_and_edge_to_edge_ui.md) : iOS/Android Safe Area 및 Edge-to-Edge UI 가이드
* [`2026-06-02_guide_oauth_jwt_auth_system.md`](./2026-06-02_guide_oauth_jwt_auth_system.md) : Google OAuth 및 JWT 기반 사용자 인증 시스템 구조
* [`2026-06-02_guide_ai_cake_order_chat_feature.md`](./2026-06-02_guide_ai_cake_order_chat_feature.md) : 대화형 AI 케이크 주문 및 실시간 채팅 UI 가이드
* [`2026-06-02_guide_order_history_and_detail.md`](./2026-06-02_guide_order_history_and_detail.md) : 사용자 주문 내역 조회 및 상태 관리 가이드

### 2. 🏗️ 아키텍처 & API 연동 (`arch_`)
* [`2026-06-02_arch_frontend_directory_and_state_architecture.md`](./2026-06-02_arch_frontend_directory_and_state_architecture.md) : 전체 프로젝트 구조 및 디렉토리/상태관리 아키텍처 안내
* [`2026-06-02_arch_ai_service_integration_and_flow.md`](./2026-06-02_arch_ai_service_integration_and_flow.md) : AI 서비스 기능 연동 및 프론트엔드 아키텍처 명세
* [`2026-07-20_arch_backend_api_sync_and_interface_update.md`](./2026-07-20_arch_backend_api_sync_and_interface_update.md) : 백엔드 API 변경에 따른 프론트엔드 동기화 및 인터페이스 명세

### 3. 📝 개발 로그 & 마이그레이션 (`devlog_`)
* [`2026-06-01_devlog_mypage_migration.md`](./2026-06-01_devlog_mypage_migration.md) : 마이페이지 개편 및 리팩토링 개발 로그
* [`2026-06-04_devlog_frontend_ui_final_polishing.md`](./2026-06-04_devlog_frontend_ui_final_polishing.md) : 프론트엔드 UI 최종 마감 및 폴리싱 작업 일지
