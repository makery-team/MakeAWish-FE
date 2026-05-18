# 🚀 [MakeAWish-FE] AI 통합 및 비즈니스 로직 고도화 TODO

AI 서버와의 실질적인 연동을 시작하고, 상담부터 주문까지의 흐름을 완성하기 위한 작업 목록입니다.

## 1단계: AI 통신 기반 구축 (100%)
- [x] AI 서버 API 스펙에 맞춘 TypeScript 타입 정의 (`types/ai.ts`)
- [x] `axios` 또는 `fetch` 기반의 API 클라이언트 서비스 구축 (`services/ai.ts`)
- [x] 환경 변수(`.env`)에 AI 서버 베이스 URL 설정

## 2단계: AI 에디터 실 연동 (Inpainting) (100%)
- [x] SVG Drawing Path를 Mask Image(Base64)로 변환하는 유틸리티 구현 (`utils/image-utils.ts`)
- [x] `EditorView`의 `handleGenerate`를 실제 API 호출로 전환
- [x] 생성된 결과를 `InquiryContext`에 저장하여 상담으로 전달

## 3단계: AI 채팅 및 상담 로직 고도화 (100%)
- [x] `AISearchBar`의 메시지 전송 로직을 AI 서버의 `actionType` 대응 구조로 개편
- [x] 단계별 상담 상태 머신(FSM) 구현 (디자인 -> 수령정보 -> 확정)
- [x] `SHOW_SCHEMA` 응답에 따른 동적 UI 요소(칩, 옵션 리스트) 렌더링
- [x] `CONFIRM_SLOTS` 응답 시 최종 주문 확인 카드 표시

## 4단계: 주문 시스템 및 데이터 영속성 (Current)
- [ ] 상담 완료 시 주문 데이터를 백엔드로 전송하는 로직 추가
- [ ] 대화 내역(`messages`) 및 찜하기 목록 `AsyncStorage` 영속성 적용
- [ ] 실제 결제 유도로 이어지는 주문 요약 UI 구현

## 5단계: 폴리싱 및 예외 처리
- [ ] 네트워크 오류 및 AI 응답 지연에 대한 에러 핸들링 (Toast, Retry)
- [ ] 입력값 유효성 검사 (번호, 날짜 형식 등)
- [ ] 앱 아이콘 및 스플래시 화면 최종 적용
