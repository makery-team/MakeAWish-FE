# [MakeAWish-FE] 소비자앱 AI 에디터(Inpainting) 도안 -> 상담 -> 주문서 파이프라인 완결 기술 공략 가이드

- **작성일:** 2026-07-30
- **관련 PR/브랜치:** `feat/consumer-ai-editor-pipeline`
- **대상 영역:** 소비자용 앱(`MakeAWish-FE`) AI 케이크 에디터(`/editor`) 수정 도안 → 지니 상담(`useInquiry`, `AISearchBar`) → 실서버 주문서(`customizedImageUrl`) 데이터 파이프라인

---

## 1. 아키텍처 개요 및 해결 과제

### 문제 배경 (Why)
1. **에디터 이미지와 상담 데이터의 연결 단절**: 소비자가 커스텀 케이크 에디터(`app/editor/[id].tsx`)에서 인페인팅이나 꾸미기를 완료한 뒤 '문의하기'를 눌렀을 때, `startInquiry`를 통해 대화를 시작하지만 수정된 도안 이미지 URL(`editedImage`)이 `InquiryContext.conversationHistory.customizedImageUrl`에 명시적으로 보존되지 않았습니다.
2. **주문서 생성 시 커스텀 이미지 누락 위험**: 이로 인해 대화 완료(`ORDER_COMPLETE`) 시 `onInquiryComplete`로 전달되는 주문 데이터(`OrderData`)에 원본 사진만 전달되거나 `customizedImageUrl` 속성이 바인딩되지 않아, 사장님 앱에서 소비자가 열심히 커스텀한 최종 도안이 조회되지 않는 문제가 발생할 수 있었습니다.
3. **타입 안전성 미흡**: `ConversationState`, `OrderData`, `StartInquiryData` 인터페이스에 `customizedImageUrl`이 타입 명세로 누락되어 있어 TS 컴파일 및 유지보수 시 데이터 무결성을 보장하기 어려웠습니다.

---

## 2. 핵심 구현 사항 (How)

### 2-1. `types/index.ts` & `context/InquiryContext.tsx`: 커스텀 도안 속성 명세 및 상태 저장
```typescript
// types/index.ts
export interface ConversationState {
  // ...
  selectedCakeImage?: string;
  customizedImageUrl?: string;
  // ...
}

export interface OrderData {
  cakeImage: string;
  customizedImageUrl?: string;
  customized_image_url?: string;
  // ...
}
```
- **`customizedImageUrl` 타입 명세 추가**: `ConversationState`, `OrderData`, `StartInquiryData`에 명시적으로 속성을 정의하여 타입 안전성을 확보했습니다.
- **`startInquiry` 상태 바인딩 강화**: 에디터나 도안 선택 화면에서 진입할 때 `customizedImageUrl: data.customizedImageUrl || data.image`를 `conversationHistory`에 기록하여 수정 도안을 영속적으로 관리합니다.

### 2-2. `app/editor/[id].tsx`: 에디터 완료 시 도안 URL 파이프라인 주입
```typescript
const handleInquiry = (editedImage?: string) => {
  if (!safeImage || !safeShopName) return;

  startInquiry({
    image: editedImage || safeImage,
    shopName: safeShopName,
    design: conversationHistory.design || "에디터에서 수정된 디자인",
    customizedImageUrl: editedImage || safeImage, // 수정된 이미지(editedImage)를 명시적으로 파이프라인 주입
  });
  
  router.replace("/(tabs)");
};
```
- **커스텀 도안 1순위 적용**: 에디터에서 생성/수정된 최종 도안(`editedImage`)이 있으면 이를 `customizedImageUrl` 파라미터로 우선 바인딩하여 AI 대화방으로 넘어갑니다.

### 2-3. `components/ai-search-bar.tsx`: 상담 완료 시 최종 주문서 파이프라인 전달
```typescript
if (response.actionType === 'ORDER_COMPLETE') {
  setTimeout(() => {
    onInquiryComplete?.({ 
      cakeImage: conversationHistory.selectedCakeImage || "", 
      customizedImageUrl: conversationHistory.customizedImageUrl || conversationHistory.selectedCakeImage || undefined,
      shopName: conversationHistory.shopName, 
      portfolioId: conversationHistory.portfolioId,
      storeId: conversationHistory.storeId,
      productId: conversationHistory.productId,
      ...conversationHistory
    });
    clearChat();
  }, 1500);
}
```
- **`ORDER_COMPLETE` 이벤트와 매핑**: AI 지니가 상담을 마치고 주문서 모달을 띄울 때(`onInquiryComplete`), 대화 내역에 보존된 `customizedImageUrl`을 주문 생성 모달 및 실서버 API(`OrderCreateRequest.items[0].customizedImageUrl`)로 연결되도록 완결했습니다.

---

## 3. 검증 시나리오 (Verification Checklist)

1. **에디터 -> AI 대화방 전환 테스트**
   - 케이크 도안 상세 화면에서 '에디터로 꾸미기' 진입 → 도안 수정 후 '문의하기' 클릭
   - AI 챗봇 대화방 진입 시 왼쪽 상단 섬네일 및 대화 문맥에 수정된 커스텀 이미지(`editedImage`)가 반영되어 있는지 확인
2. **AI 대화 완료 -> 최종 주문서 확인 테스트**
   - 대화를 마치고 '주문서 접수하기' 버튼 클릭
   - 서버로 전송되는 `OrderCreateRequest` 페이로드 및 내 주문 내역 화면에서 최종 수정된 도안 이미지가 정상 렌더링되는지 확인
