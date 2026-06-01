# 🤖 AI 챗봇 아키텍처 가이드 (Backend Orchestrator)

이 문서는 MakeAWish 프론트엔드 프로젝트의 AI 챗봇 기능이 어떻게 백엔드와 통신하고, 화면을 구성하는지에 대한 아키텍처 가이드입니다. 
초기 프로토타입의 '프론트엔드 중심(Frontend Orchestrator)' 통신 방식에서, 현재의 **'백엔드 중심(Backend Orchestrator)'** 아키텍처로 리팩터링된 배경과 구현 방식을 설명합니다.

---

## 1. 아키텍처 개요 (Overview)

### ❌ 과거의 방식: Frontend Orchestrator (폐기됨)
- 프론트엔드가 AI 서버, 매장 서버, DB 서버 등 여러 개의 API를 직접 호출하며 순서를 제어했습니다.
- **문제점**: 데이터 무결성 붕괴(예: 특정 API 응답 지연 시 다음 단계 진행 불가), 프론트엔드 비즈니스 로직의 비대화, 잦은 통신 에러 발생.

### ✅ 현재의 방식: Backend Orchestrator (현재 적용됨)
- 프론트엔드는 **오직 단 하나의 백엔드 API (`POST /api/ai-agent/chat`)** 와만 통신합니다.
- 백엔드(Spring Boot)가 내부적으로 AI 인텐트 분석, 포트폴리오 검색, 매장 조회 등을 모두 처리한 뒤, 프론트엔드에게 **"무엇을 렌더링할지(ActionType)"** 정답만 내려줍니다.
- 프론트엔드는 복잡한 비즈니스 로직 없이, 백엔드가 주는 지시어(`actionType`)에 따라 UI 컴포넌트(레고 블록)만 조립해서 화면에 그리는 '순수 뷰(View)' 역할에 집중합니다.

---

## 2. 프론트엔드 구현 로직

### ① 통신 로직 단일화 (`services/ai.ts`)

프론트엔드는 유저의 메시지를 백엔드 에이전트 엔드포인트 하나로만 전송합니다.

```typescript
export const aiService = {
  async fetchAiResponse(message: string, userId: string = '1') {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/ai-agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    return response.json();
  }
};
```

### ② 상태 렌더링 규격 (`types/index.ts`)

백엔드는 프론트엔드에게 특정 UI를 그리라고 지시하기 위해 `actionType`과 `data`를 응답 객체에 포함하여 보냅니다.

```typescript
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  // 백엔드의 UI 렌더링 지시어
  actionType?: 'PORTFOLIO_LIST' | 'SHOW_SCHEMA' | 'CONFIRM_SLOTS' | 'ORDER_SUMMARY' | 'ORDER_COMPLETE';
  // 렌더링에 필요한 추가 데이터 (포트폴리오 사진 배열, 주문서 데이터 등)
  data?: any; 
  slots?: Record<string, any>; 
}
```

### ③ UI 컴포넌트 렌더링 (`components/ai-search-bar.tsx`)

채팅 화면에서는 복잡한 API 호출이나 비즈니스 로직 계산을 하지 않습니다. 대신 `switch`문이나 `if`문을 활용하여 `actionType`에 매칭되는 적절한 UI 카드를 화면에 보여줍니다. (Declarative UI 패턴)

```tsx
{/* actionType이 'CONFIRM_SLOTS'일 경우 영수증 형태의 카드 렌더링 */}
{item.actionType === 'CONFIRM_SLOTS' && item.slots && (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>입력하신 내용을 확인해주세요:</Text>
    <View style={styles.slotsList}>
      {Object.entries(item.slots).map(([key, val]) => (
        <Text key={key} style={styles.summaryRow}>📌 {key}: {String(val)}</Text>
      ))}
    </View>
    <TouchableOpacity onPress={() => handleSend("이대로 문의할게요")}>
      <Text>문의하기</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## 3. 요약 및 이점

- **에러 발생 최소화**: 프론트엔드가 여러 서버의 응답을 기다리고 조립할 필요가 없어 데이터 결측 에러(예: storeId 누락)가 근본적으로 해결되었습니다.
- **확장성 증가**: 새로운 화면이나 챗봇 시나리오가 추가되더라도, 프론트엔드는 백엔드로부터 새로운 `actionType`을 받아 해당되는 뷰(View) 템플릿만 추가해주면 됩니다.
- 프론트엔드 코드는 '예쁘게 그리는 역할'에 최적화되어 유지보수가 매우 쉬워졌습니다.
