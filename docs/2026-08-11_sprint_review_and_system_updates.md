# 2026-08-11 System Release & Architecture Updates (Customer App)

이 문서는 최신 스프린트 주기에 따라 성공적으로 배포 및 머지된 소비자 앱(MakeAWish-FE)의 주요 아키텍처 변경 사항 및 신규 피처를 정리한 통합 시스템 릴리즈 명세서입니다.

## 1. 시스템 안정성 및 빌드 환경 아키텍처

### Expo Native 모듈 호환성 패치 (크래시 핫픽스)
- **이슈**: Expo SDK 54 환경에서 최신 `expo-image-picker` 모듈(57.x) 초기화 중 `AnyTypeCache` ClassNotFoundException으로 인한 치명적인 네이티브 크래시 발생.
- **해결**: 패키지 의존성 트리를 분석하여, SDK 54의 네이티브 런타임과 완벽하게 호환되는 `~17.0.11` 버전으로 롤백 및 고정(Lock)하여 시스템 안정성을 복구했습니다.

## 2. 주요 도메인 기능 고도화

### AI 레퍼런스 이미지 기반 인페인팅 통합
- **아키텍처**: `components/editor-view.tsx`, `services/ai.ts`
- **변경 사항**: 
  - 생성형 AI 인페인팅 워크플로우에 '레퍼런스 이미지' 기반 프롬프팅 UI를 구축했습니다.
  - API 통신 계층(`ai.ts`)을 업데이트하여 업로드된 레퍼런스 이미지 URL(`referenceImageUrl`)을 백엔드 파이프라인으로 안전하게 전송합니다.

### 행정구역(Region) 필터 동적 데이터 연동
- **아키텍처**: `components/map-view.tsx`, `services/map.ts`
- **변경 사항**: 
  - 프론트엔드 단일 장애점(SPOF)이 될 수 있는 정적 하드코딩 상수(`constants/korea-districts.ts`)를 완벽히 제거했습니다.
  - 백엔드의 `Region API`와 연동된 동적 데이터 패칭 시스템을 구축하여, 실시간으로 시/구/동 필터 렌더링 상태를 관리하도록 아키텍처를 개선했습니다.

### 비즈니스 운영시간(Business Hours) JSON 스펙 통합
- **아키텍처**: `components/shop-detail.tsx`
- **변경 사항**: 
  - 통합 시스템 규약([2026-08-09-business-hours-json-architecture.md])에 맞춘 표준 JSON 배열 파서를 도입했습니다.
  - 비즈니스 로직에 기반하여 요일별 운영 시간, 브레이크타임, 휴무일 상태를 계산하는 고성능 렌더링 테이블 UI를 구축했습니다.

## 3. UI/UX 개선 및 예외 처리

- **모바일 포트폴리오 데이터 렌더링 최적화**: 
  - 찜(Likes) 수치가 0일 때 발생하던 가짜 데이터 연산 로직의 Edge Case를 해결하여 데이터 무결성을 확보했습니다.
- **지도 위치 기반 주문 리마인더 고도화**: 
  - `order-reminder-card.tsx` 및 `map-view.tsx` 컴포넌트에서 API 응답 기반의 실시간 도로명/지번 주소 데이터가 오차 없이 매핑 및 시각화되도록 렌더링 파이프라인을 개선했습니다.
