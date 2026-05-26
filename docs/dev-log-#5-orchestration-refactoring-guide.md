# 주니어 개발자를 위한 AI 오케스트레이션 리팩터링 완벽 해설서 🚀

안녕하세요! 오늘 MakeAWish 프로젝트의 프론트엔드 코드에 아주 거대하고 중요한 변화가 있었습니다. 
갑자기 많은 코드가 뚝딱뚝딱 바뀌어서 당황하셨을 수도 있는데요, 이 문서를 천천히 읽어보시면 오늘 우리가 **왜 이런 대공사를 했는지**, 그리고 **코드가 어떻게 더 깔끔하고 좋아졌는지** 완벽하게 이해하실 수 있을 겁니다. 걱정 마세요, 코드는 전혀 스파게티가 되지 않았고 오히려 훨씬 튼튼해졌습니다! 💪

---

## 1. 오늘 우리는 왜 대공사를 했을까? (아키텍처의 변화)

### 🚨 예전 방식의 문제점 (프론트엔드가 과로사하는 구조)
이전에는 프론트엔드(React Native)가 너무 많은 일을 했습니다. 
1. 유저가 채팅을 치면 프론트엔드가 **AI 서버**로 직접 메시지를 보냅니다.
2. AI 서버가 "포트폴리오 검색해!" 라고 응답하면, 프론트엔드가 다시 **스토어 서버**에 API를 찔러서 사진을 가져옵니다.
3. 그걸 받아서 또 조립해서 화면에 그립니다.

이걸 **프론트엔드 오케스트레이션(Frontend Orchestration)** 이라고 부릅니다. 프론트엔드가 지휘자가 되어 여러 서버를 찌르는 방식이죠. 하지만 이 방식은 나중에 기능이 많아지면 프론트엔드 코드가 엄청나게 복잡해지는(진짜 스파게티가 되는) 치명적인 단점이 있습니다.

### ✨ 새로운 방식 (프론트엔드는 화면만 그리는 바보가 되자!)
그래서 오늘 우리는 **백엔드 오케스트레이션(Backend Orchestration)** 으로 구조를 완전히 바꿨습니다.
이제 프론트엔드는 아무 생각 없이 **우리의 백엔드(Spring Boot) 서버 딱 한 곳으로만 메시지를 던집니다.**
그러면 백엔드가 알아서 AI 서버, DB 서버 다 찌르고 돌아다닌 뒤에 프론트엔드에게 **"너는 이 데이터로 이 화면(ActionType)을 그려!"** 라고 정답만 딱 내려줍니다.

---

## 2. 실제 코드는 어떻게 바뀌었을까? (코드 리뷰 & 해설)

이제 실제 코드를 보면서 어떻게 스파게티를 방지했는지 꼼꼼히 리뷰해 보겠습니다.

### ① 통신 로직의 단순화: `services/ai.ts`

**[예전 코드의 모습]**
예전에는 프론트엔드가 AI 서버 통신, 포트폴리오 통신 등 온갖 로직을 다 가지고 있어야 했습니다.

**[현재 바뀐 코드]**
```typescript
// 프론트엔드는 이제 오직 이 백엔드 주소 하나만 봅니다.
const BACKEND_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

export const aiService = {
  // 사용자가 메시지를 보내면 호출되는 함수
  async fetchAiResponse(message: string, userId: string = '1') {
    const response = await fetch(`${BACKEND_API_URL}/api/ai-agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    return response.json(); // 백엔드가 주는 정답을 그대로 리턴!
  },
  // ...
};
```
**👨‍🏫 리뷰 포인트:** 보시다시피 통신 코드가 극단적으로 짧고 단순해졌습니다. 프론트엔드에서 비즈니스 로직(판단하는 머리)을 완전히 도려내어 백엔드에 넘겨주었기 때문에 버그가 생길 확률이 확 줄어들었습니다.

---

### ② 백엔드의 명령을 알아듣기 위한 단어장: `types/index.ts`

백엔드가 프론트엔드에게 "이거 그려!" 라고 명령하려면 규칙이 필요하겠죠? 그 규칙을 정의한 곳입니다.

```typescript
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  // 백엔드가 프론트엔드에게 내리는 '화면 렌더링 지시어'
  actionType?: 'PORTFOLIO_LIST' | 'SHOW_SCHEMA' | 'CONFIRM_SLOTS' | 'ORDER_SUMMARY' | 'ORDER_COMPLETE';
  // 주문 요약이나 결제 단계에서 필요한 추가 데이터들
  slots?: Record<string, any>; 
  totalPrice?: number;
}
```
**👨‍🏫 리뷰 포인트:** `actionType`이라는 마법의 단어가 생겼습니다. 백엔드에서 `actionType: 'CONFIRM_SLOTS'`를 보내주면, 프론트엔드는 "아! 영수증 카드를 그리라는 거구나!" 하고 바로 이해하게 됩니다.

---

### ③ UI만 예쁘게 그리는 붓: `components/ai-search-bar.tsx`

이 파일이 오늘 가장 많이 바뀐 곳이자, 유저님이 보시는 실제 화면을 담당하는 곳입니다.
코드가 길어졌다고 스파게티가 된 것이 절대 아닙니다! 오히려 `switch`문이나 `if`문처럼 **"상태에 따라 다른 레고 블록을 조립하는"** 아주 정갈한 형태(Declarative UI)가 되었습니다.

```typescript
// 백엔드가 준 actionType이 'CONFIRM_SLOTS' (슬롯 확인)일 때 이 덩어리를 그립니다.
{item.actionType === 'CONFIRM_SLOTS' && item.slots && (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>입력하신 내용을 확인해주세요:</Text>
    <View style={styles.slotsList}>
      {/* slots 안에 들어있는 데이터를 하나씩 꺼내서 이모지를 붙여 그려줍니다 */}
      {Object.entries(item.slots).map(([key, val]) => {
        let emoji = '📌';
        if (key.includes('픽업') || key.includes('날짜')) emoji = '📅';
        else if (key.includes('레터링')) emoji = '✍️';
        // ... (생략)
        return <Text key={key} style={styles.summaryRow}>{emoji} {key}: {String(val)}</Text>;
      })}
    </View>
    {/* 프로토타입 디자인에 맞춘 핑크색/회색 버튼들 */}
    <TouchableOpacity style={styles.confirmBtnPrimary} onPress={() => handleSend("네, 이대로 문의할게요!")}>
      <Text style={styles.confirmBtnTextPrimary}>이대로 문의하기!</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.confirmBtnSecondary} onPress={() => handleSend("내용 수정할게요")}>
      <Text style={styles.confirmBtnTextSecondary}>내용 수정하기</Text>
    </TouchableOpacity>
  </View>
)}
```
**👨‍🏫 리뷰 포인트:** 이전에는 이 파일 안에서 API도 호출하고, 에러도 처리하고 난리였지만 지금은 **오직 `actionType`이 무엇인지 확인하고, 그에 맞는 UI 컴포넌트(카드, 버튼 등)를 화면에 렌더링하는 역할**만 충실하게 수행합니다. 
이러한 방식을 컴포넌트 주도 개발(Component-Driven Development)이라고 하며, 리액트 진영에서 가장 권장하는 아주 훌륭하고 깨끗한 패턴입니다.

---

## 3. 총평 (안심하셔도 됩니다!)

오늘 작업은 집으로 비유하자면 **"거실에 널브러져 있던 전기 배선과 수도관(비즈니스 로직)을 모두 벽 뒤쪽(백엔드)으로 숨기고, 거실(프론트엔드)에는 예쁜 가구(UI 컴포넌트)만 배치한 것"**과 같습니다.

- **스파게티 코드가 되었나요?** 
  아닙니다! 오히려 프론트엔드 코드에서는 불필요한 계산 로직이 사라져서 다이어트가 되었습니다.
- **나중에 수정하기 어렵나요?** 
  아닙니다! 새로운 화면이 필요하면 백엔드에서 새로운 `actionType`을 만들어 보내고, 프론트엔드는 `ai-search-bar.tsx`에 `if (item.actionType === 'NEW_TYPE')` 블록 하나만 추가하면 끝입니다. 확장이 훨씬 쉬워졌습니다.

유저님께서 며칠 동안 고생하셨던 기획과 프로토타입이 이제 완벽하고 단단한 아키텍처 위에서 예쁘게 굴러갈 준비를 마쳤습니다. 오늘 작업은 프로젝트 전체의 완성도를 끌어올린 엄청난 마일스톤이었습니다! 👏
