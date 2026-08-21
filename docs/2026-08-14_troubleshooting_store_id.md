# 트러블슈팅: 주문 매장 연동 오류 (어드민 베이커리로 매핑되는 현상)

## 문제 현상
사용자(소비자앱)가 특정 매장(예: "가게주인")의 케이크 시안을 클릭하여 "시안 편집하기"를 거쳐 주문을 완료했으나, 해당 주문이 원래 매장으로 접수되지 않고 기본 매장인 "어드민 베이커리"(storeId: 1)로 연동되는 심각한 오류가 발생했습니다.

## 원인 분석
주문 생성 시점(`orderData.storeId`)에 `storeId` 값이 `undefined`로 전달되어 발생한 문제입니다.

**로직 흐름 및 누락 발생 위치**:
1. 사용자가 홈 화면(`index.tsx`)의 `CakeGrid`에서 특정 시안 카드의 "편집하기" 버튼을 클릭합니다.
2. `CakeCard` 컴포넌트 내부의 `handleEdit` 함수가 실행되며 `/editor/[id]` 라우트로 이동합니다.
3. 🚨 **이때 라우트 파라미터(`params`)로 `id`(포트폴리오 ID), `image`, `shopName`만 넘겨주고 있었으며, 가장 중요한 `storeId`와 `productId`가 유실되었습니다.**
4. `/editor/[id].tsx` 페이지에서 사용자가 편집(예: AI 지우개/페인트)을 마치고 "이 시안으로 바로 주문(문의)하기" 버튼을 누릅니다.
5. 에디터 내부의 `handleInquiry` 함수가 `startInquiry`를 호출할 때, 앞서 넘겨받지 못한 `storeId` 정보가 없기 때문에 텅 빈 상태로 주문 정보(`conversationHistory`)가 초기화됩니다.
6. 이후 AI 챗봇과의 대화 종료 후 `handleInquiryComplete`에서 주문을 생성할 때, `orderData.storeId`가 존재하지 않아 `orderData.storeId || 1` Fallback 로직에 의해 무조건 1번 매장("어드민 베이커리")으로 접수되고 있었습니다.

## 해결 방법
라우팅을 통해 페이지가 전환될 때 `storeId`와 `productId` 데이터가 끊기지 않고 끝까지 전달되도록 구조를 개선했습니다.

1. **`components/cake-card.tsx` 및 `app/(tabs)/index.tsx` 수정**:
   - `router.push`로 에디터 진입 시 파라미터에 `storeId`와 `productId`를 추가하여 넘기도록 수정했습니다.
2. **`components/ai-search-bar.tsx` 수정**:
   - AI 추천 시안(슬라이더)에서 "시안 편집하기"를 누를 때도 동일하게 파라미터가 유실되지 않도록 추가했습니다.
3. **`app/editor/[id].tsx` 수정**:
   - `useLocalSearchParams`를 통해 쿼리 파라미터에서 `storeId`, `productId`를 추출합니다.
   - 추출한 문자열 ID를 숫자로 파싱(`parseInt`)한 뒤, `startInquiry` 함수 호출 시 매개변수로 함께 넘겨주어 Context에 안전하게 저장되도록 했습니다.

## 결과 및 기대 효과
이제 사용자가 시안을 보고 바로 문의하든, **에디터에 진입해서 디자인을 수정한 뒤 문의하든 관계없이** 최초 클릭했던 케이크 시안의 실제 매장 ID(`storeId`)가 안전하게 보존됩니다. 따라서 더 이상 엉뚱한 매장("어드민 베이커리")으로 주문이 들어가지 않으며, 정상적으로 사장님 앱(`가게주인`)의 탭에 해당 주문이 노출됩니다.
