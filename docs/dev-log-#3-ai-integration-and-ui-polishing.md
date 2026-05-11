# 📝 [Dev Log #3] AI 서버 연동 및 UI/UX 상세 구현 가이드

본 문서는 주니어 개발자의 시점에서 AI 서버(FastAPI)와 프론트엔드 간의 실시간 연동 과정, 핵심 로직의 원리, 그리고 복잡한 UI 레이아웃 문제를 해결한 과정을 코드와 함께 아주 상세히 기록합니다.

---

## 1. AI와 소통하는 통로 만들기 (API 클라이언트)

프론트엔드 앱이 AI 서버에 요청을 보내고 응답을 받기 위해서는 약속된 데이터 규격(Type)과 통신 도구(Service)가 필요합니다.

### ✅ 핵심 구현 코드 (`services/ai.ts`)

```typescript
/**
 * aiService: AI 서버와의 모든 통신을 담당하는 싱글톤 객체
 */
export const aiService = {
  // 1. 대화 분석 및 응답 요청 함수
  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      const response = await fetch(`${AI_SERVER_URL}/api/ai/chat`, {
        method: 'POST', // 데이터를 보낼 때는 POST 방식을 사용합니다.
        headers: { 'Content-Type': 'application/json' }, // 우리가 보내는 상자가 JSON 형태임을 알려줍니다.
        body: JSON.stringify(request), // 자바스크립트 객체를 서버가 이해할 수 있는 문자열로 변환합니다.
      });

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);
      return await response.json(); // 서버의 대답을 다시 객체로 변환하여 반환합니다.
    } catch (error) {
      console.error('AI Chat Service Error:', error);
      throw error;
    }
  }
};
```

* **💡 원리 이해**: `async/await`를 사용하여 서버의 응답이 올 때까지 기다리되, 앱 전체가 멈추지 않도록 비동기 처리를 했습니다. 서버 주소는 안드로이드 에뮬레이터 루프백 주소인 `10.0.2.2`를 대응하여 로컬 통신 문제를 해결했습니다.

---

## 2. AI 이미지 편집 기능 구현 (Inpainting)

사용자가 사진 위에 낙서(마스킹)를 하면, AI가 그 부분을 인식하여 새로운 그림을 그려넣는 '인페인팅' 기능을 구현했습니다.

### ✅ 마스크 이미지 생성 및 전송 로직 (`components/editor-view.tsx`)

```typescript
const handleGenerate = async () => {
  // 1. 사용자가 그린 영역(SVG)만 사진으로 캡처합니다.
  const maskB64 = await captureRef(svgContainerRef, {
    format: 'png',
    quality: 1,
    result: 'base64', // 캡처된 사진을 '텍스트 문자열' 형태로 변환합니다.
  });

  // 2. AI 서버에 원본 이미지 + 마스크 이미지 + 요청 사항을 함께 보냅니다.
  const response = await aiService.inpaint({
    image_b64: await uriToBase64(currentImage), // 원본 사진을 텍스트로 변환
    mask_b64: maskB64,                          // 그린 부분 사진
    prompt: command,                             // 사용자의 명령 (예: "리본 달아줘")
  });

  // 3. AI가 생성해준 결과 이미지를 화면에 즉시 반영합니다.
  setCurrentImage(response.result_image);
};
```

* **💡 기술 포인트**: `react-native-view-shot`을 사용하여 특정 View(SVG 오버레이)만 스크린샷을 찍듯 추출했습니다. 이렇게 하면 서버에서 "어디를 고쳐야 하는지"를 픽셀 단위로 정확히 알 수 있습니다.

---

## 3. 대화형 상담 엔진 및 동적 UI 렌더링

AI가 단순히 대답만 하는 것이 아니라, 앱의 상태를 조절하고 주문서를 작성하도록 `actionType` 기반의 상태 머신을 구축했습니다.

### ✅ 의도 분류 대응 로직 (`components/ai-search-bar.tsx`)

```typescript
const handleSend = async (inputValue) => {
  // ... 생략: 사용자 메시지 추가 로직
  const response = await aiService.chat({ ... });

  // AI의 응답 종류(actionType)에 따라 행동 지침을 정합니다.
  if (response.actionType === 'PORTFOLIO_LIST') {
    // [추천 시뮬레이션] AI가 준 태그로 로컬 데이터를 필터링합니다.
    const filteredCakes = CAKE_DATA.filter(cake => 
      cake.categories.some(cat => response.data.tags.includes(cat))
    );
    // 추천 결과를 이미지 슬라이더(메시지 내부)로 노출합니다.
    newAiMsg.images = filteredCakes.map(c => c.image);
  }
  
  // 상담 정보를 InquiryContext에 저장하여 주문 데이터를 완성해 나갑니다.
  if (response.data?.extracted_slots) {
    updateConversation(response.data.extracted_slots);
  }
};
```

---

## 4. UI 트러블슈팅: 바텀시트 레이아웃 정밀 보정

복잡한 제스처 라이브러리와 절대 좌표계를 활용하여 사용자 경험을 방해하던 결함들을 수정했습니다.

### 🚩 해결된 주요 문제들

1. **아이콘 잘림 (물리적 겹침)**:
    * **문제**: 드래그 핸들이 아래에 있는 아이콘을 가림.
    * **해결**: `dragHandleArea`(32px)를 최상단에 배치하고, 컨텐츠 영역은 무조건 그 아래(`top: 32`)부터 시작하도록 **절대 좌표**를 할당했습니다.
2. **스크롤 먹통 (제스처 충돌)**:
    * **문제**: 시트를 올리려는 손동작과 채팅창을 올리려는 손동작이 충돌함.
    * **해결**: `react-native-gesture-handler`의 전용 `FlatList`를 도입하고, 시트가 완전히 열린 상태에서만 내부 스크롤이 우선권을 갖도록 제스처 우선순위를 조절했습니다.
3. **X 버튼(닫기) 무반응**:
    * **문제**: 제스처가 터치 이벤트를 가로채서 닫기 버튼이 안 눌림.
    * **해결**: 버튼의 터치 범위를 넓히는 `hitSlop`을 적용하고, `pointerEvents` 로직을 정교화하여 닫기 명령이 즉시 전달되도록 수정했습니다.

---

## 5. 결론 및 향후 계획

오늘의 작업으로 **[디자인 검색 ➡️ AI 편집 ➡️ 대화형 주문서 작성]**으로 이어지는 핵심 사용자 시나리오가 기술적으로 완성되었습니다.

**Next Step:**
* `AsyncStorage`를 도입하여 대화 내역이 앱 종료 후에도 유지되도록 구현할 예정입니다.
* 상담이 완료된 데이터를 바탕으로 실제 주문 목록을 생성하는 기능을 추가합니다.

---
**최종 업데이트**: 2026. 05. 11.
**작성자**: Gemini CLI (Lead Architect)
