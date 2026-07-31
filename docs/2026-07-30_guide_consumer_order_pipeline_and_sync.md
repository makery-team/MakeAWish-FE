# [MakeAWish-FE] 소비자앱 AI 주문 접수 파이프라인 및 주문 내역 실시간 동기화 기술 공략 가이드

- **작성일:** 2026-07-30
- **관련 PR/브랜치:** `feat/consumer-order-pipeline`
- **대상 영역:** 소비자용 앱(`MakeAWish-FE`) AI 상담 완료 → 주문 생성(`createOrder`) → 내 주문 내역(`/orders`) 실시간 서버 동기화

---

## 1. 아키텍처 개요 및 해결 과제

### 문제 배경 (Why)
1. **커스텀 도안 유실 방지 필요**: 소비자가 AI 지니 상담이나 AI 에디터를 통해 커스텀 케이크를 상담 완료하고 주문서(`OrderCreateRequest`)를 생성할 때, `orderData` 내의 커스텀 이미지 URL(`customizedImageUrl` / `customized_image_url`)이 백엔드 `items[0]` 필드에 명시적으로 바인딩되지 않으면 사장앱 상세 화면에서 누락될 위험이 있었습니다.
2. **주문 내역 실시간 동기화 미흡**: 기존 `app/orders/index.tsx` 화면은 컴포넌트 마운트(`useEffect([], ...))`) 시에만 단 1회 API를 호출했습니다. 이로 인해 Expo Router 네비게이션 스택 상에서 새 주문 접수 후 화면에 진입하거나 사장님이 상태를 변경했을 때 즉각 최신 상태가 반영되지 않았습니다.
3. **에러 및 알림 부재**: 주문 생성 실패 시에도 사용자 알림 없이 조용히 넘어가는 UX 문제를 해결해야 했습니다.

---

## 2. 핵심 구현 사항 (How)

### 2-1. `app/(tabs)/index.tsx`: AI 상담 완료 주문 파이프라인 강화
```typescript
const requestPayload: OrderCreateRequest = {
  storeId,
  pickupDate: formattedDate,
  orderData: { ...orderData },
  items: [
    {
      productId,
      quantity: 1,
      portfolioId: portfolioId,
      customizedImageUrl: orderData.customizedImageUrl || orderData.customized_image_url || undefined,
    }
  ]
};

await orderService.createOrder(requestPayload);
Alert.alert("안내", "🎉 주문서가 성공적으로 접수되었습니다!");
router.push("/orders");
```
- **customizedImageUrl 명시적 파이프라인**: `orderData`에서 생성된 도안 이미지 URL을 `OrderCreateRequest.items[0].customizedImageUrl` 속성으로 안전하게 매핑합니다.
- **명확한 사용자 알림**: 성공 시 Toast/Alert를 띄워 접수 완료를 알리고, 에러 발생 시 명확히 오류 사항을 경고하여 네트워크나 백엔드 DB 이상 시 대처할 수 있게 합니다.

### 2-2. `app/orders/index.tsx` & `components/order-status.tsx`: 실시간 동기화 및 Pull-to-Refresh
```typescript
// 화면 포커스 시 자동으로 최신 주문 목록 새로고침
useFocusEffect(
  useCallback(() => {
    fetchOrders(false);
  }, [fetchOrders])
);

// Pull-to-Refresh 핸들러
const handleRefresh = () => {
  setRefreshing(true);
  fetchOrders(true);
};
```
- **`useFocusEffect` 훅 활용**: 사용자가 하단 탭이나 뒤로 가기, 주문 접수 등을 통해 `/orders` 화면을 포커스할 때마다 자동으로 백엔드 실서버(`orderService.getMyOrders()`)를 조회합니다.
- **`RefreshControl` 연동**: 화면을 위에서 아래로 당기는(Pull-to-refresh) 제스처 시 로딩 스피너와 함께 최신 상태(`PENDING_QUOTE` → `APPROVED` → `IN_PROGRESS` → `COMPLETED`)를 즉시 갱신합니다.
- **리뷰 완료 후 갱신**: `COMPLETED`(픽업 완료) 주문에 대해 리뷰 등록 완료(`reviewService.createReview`) 시 즉시 주문 목록을 다시 페치하여 동기화합니다.

---

## 3. 검증 시나리오 (Verification Checklist)

1. **AI 상담 주문 완료 테스트**
   - AI 지니 창에서 대화 완료 후 "주문서 접수하기" 클릭 → "🎉 주문서가 성공적으로 접수되었습니다!" 알림 노출 확인
   - 내 주문 내역 화면 진입 시 서버 DB에서 생성된 주문(`PENDING_QUOTE`)이 상단에 렌더링되는지 확인
2. **Pull-to-Refresh 상태 동기화 테스트**
   - 사장앱(`MakeAWish-FE-Owner`) 또는 DB에서 해당 주문 상태를 `APPROVED` 또는 `COMPLETED`로 변경
   - 소비자앱 내 주문 내역 스크롤을 당겼다 놓으면 즉시 아이콘 배지 및 '⭐ 리뷰 작성하기' 버튼이 동기화되는지 확인
