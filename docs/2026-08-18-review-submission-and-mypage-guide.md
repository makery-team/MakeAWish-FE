# 2026-08-18 소비자 앱 리뷰 작성 폼 및 마이페이지 연동 가이드

## 1. 개요
- **목적**: 픽업 완료(`COMPLETED`)된 주문 건에 대해 소비자가 별점, 실물 사진, 상세 후기 텍스트를 입력하여 서버에 등록(`POST /api/orders/{orderId}/reviews`)하고, 마이페이지에서 내가 작성한 리뷰 목록을 실시간으로 관리할 수 있도록 연동합니다.

---

## 2. 주요 구현 사항

### 2.1. `services/review.ts`
- `uploadImage(imageUri: string): Promise<string>`: `expo-image-picker`로 선택한 로컬 사진 파일을 `multipart/form-data`로 S3 업로드 서버(`POST /api/images/upload`)에 전송하고 CDN 접근 URL을 반환받는 메서드 추가

### 2.2. `app/reviews/write.tsx` (신규 화면)
- **주문/매장 요약 카드**: 매장명 및 케이크 상품 정보 렌더링
- **별점 선택 (1~5점)**: 반응형 터치 인터랙션 및 감성 피드백 라벨(5점: "인생 최고의 케이크였어요! 💖" 등) 제공
- **사진 첨부**: `expo-image-picker`를 통한 사진 선택, 미리보기, 삭제 기능 지원
- **상세 후기 작성**: 5자 이상 필수 유효성 검사, 500자 카운터 표시
- **리뷰 등록 처리**: S3 사진 업로드 ➔ `reviewService.createReview` 호출 ➔ `ShopContext.refreshReviews` 캐시 동기화 ➔ 성공 알림 및 이전 화면 복귀

### 2.3. `app/orders/[id].tsx` (주문 상세)
- 주문 상태가 `COMPLETED`(픽업 완료)일 때 하단 고정 바에 **`⭐ 소중한 후기(리뷰) 작성하기`** 버튼을 노출하여 리뷰 작성 화면으로 파라미터(`orderId`, `storeName`, `cakeName`, `cakeImage`)와 함께 네비게이션 이동

### 2.4. `app/(tabs)/mypage.tsx` & `app/reviews/index.tsx`
- 마이페이지 '작성 리뷰' 및 '내 리뷰 관리'에서 내가 쓴 리뷰 목록 화면으로의 원활한 이동 및 `ShopContext` 기반 캐시/서버 최신화 보장

---

## 3. 검증 결과
- `npx tsc --noEmit` 타입 검사 통과 (0 errors).
- 주문 상세 ➔ 리뷰 작성 ➔ S3 사진 업로드 ➔ 리뷰 API 등록 ➔ 마이페이지 리뷰 목록 갱신 E2E 흐름 검증 완료.
