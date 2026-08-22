# 2026-08-22 리뷰 작성 화면 일원화 및 작성 완료 건 차단 가이드

## 1. 개요
1. **리뷰 작성 경험 일원화**:
   - 기존 주문 목록(`app/orders/index.tsx`)에서 열리던 사진 첨부 불가 임시 모달(`WriteReviewModal`)을 제거하고, 사진 첨부(`expo-image-picker`), 별점 라벨, 500자 상세 후기가 지원되는 전용 리뷰 작성 화면(`app/reviews/write.tsx`)으로 통일.
2. **리뷰 작성 완료 주문 버튼 비활성화 (Block)**:
   - 주문 상세 화면(`app/orders/[id].tsx`)에서 `order.hasReview === true`인 경우 하단 [소중한 후기(리뷰) 작성하기] 버튼이 `✓ 후기 작성이 완료되었습니다` 비활성화 UI로 변경되어 중복 클릭 및 작성을 원천 차단.
   - `useFocusEffect`를 적용하여 리뷰 작성 후 돌아왔을 때 즉시 상태가 갱신되도록 처리.

---

## 2. 주요 변경 파일
- `app/orders/index.tsx`: `handleReviewPress`에서 `router.push('/reviews/write')`로 네비게이션 통일
- `app/orders/[id].tsx`: `order.hasReview` 조건에 따라 버튼 비활성화 렌더링 및 `useFocusEffect` 연동
