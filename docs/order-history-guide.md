# 🛍️ 주니어 개발자를 위한 주문 내역 연동 가이드 (Order History)

안녕하세요! 이 문서는 백엔드 API 명세서(JSON)가 프론트엔드 코드(TypeScript)로 어떻게 변환되고, 화면(React Native)에 어떻게 그려지는지 주니어 개발자 눈높이에 맞춰 설명하는 가이드입니다.

주문 내역(리스트)과 주문 상세 페이지를 어떻게 만들었는지 단계별로 따라가 봅시다! 🚀

---

## 1. 백엔드 API 명세서 분석하기

백엔드 개발자분께서 넘겨주신 API 명세서 스크린샷을 보면 두 가지 API가 있습니다.

### ① 내 주문 목록 조회 (`GET /api/orders`)
**[응답 JSON 예시]**
```json
[
  {
    "id": 123,
    "orderNumber": "20260412-A1B2C3D4",
    "storeName": "메이커리 강남점",
    "status": "PENDING_QUOTE",
    "totalPrice": 45000,
    "pickupDate": "2026-04-20T15:30:00",
    "createdAt": "2026-04-12T11:00:00"
  }
]
```
👉 여기서는 케이크 이미지가 안 넘어옵니다! 리스트에서는 가게 이름(`storeName`), 가격(`totalPrice`), 주문 상태(`status`) 정도만 간단하게 보여주면 되겠네요.

### ② 주문 상세 조회 (`GET /api/orders/{orderId}`)
**[응답 JSON 예시]**
```json
{
  "id": 123,
  "orderNumber": "20260411-A1B2C3D4",
  "storeName": "메이커리 강남점",
  "status": "PENDING_QUOTE",
  "pickupDate": "2026-04-20T15:30:00",
  "totalPrice": 45000,
  "orderData": {
    "맛": "초코",
    "문구": "생일 축하해",
    "배경색": "화이트"
  },
  "items": [
    {
      "productId": 10,
      "name": "레터링 케이크 1호",
      "quantity": 1,
      "unitPrice": 45000,
      "customizedImageUrl": "https://storage.com/ai-design-123.png"
    }
  ],
  "createdAt": "2026-04-11T12:00:00"
}
```
👉 상세 페이지에서는 커스텀한 케이크 이미지(`customizedImageUrl`), 상세 요청 사항(`orderData`) 등 훨씬 자세한 데이터가 내려옵니다!

---

## 2. JSON을 TypeScript 타입으로 만들기 (`types/index.ts`)

프론트엔드에서는 위에서 본 JSON 데이터를 안전하게 다루기 위해 **타입(Type)**을 만듭니다. JSON 키값과 **완벽하게 똑같은 이름**으로 만들어야 데이터를 잃어버리지 않아요!

```typescript
// 1. 주문 상태 뱃지를 그리기 위해 백엔드의 status 값을 모아둡니다.
export type BackendOrderStatus = "PENDING_QUOTE" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

// 2. 리스트 API (GET /api/orders) 의 응답 타입입니다.
export interface OrderListItem {
  id: number;
  orderNumber: string;
  storeName: string;
  status: BackendOrderStatus;
  totalPrice: number;
  pickupDate: string;
  createdAt: string;
}

// 3. 상세 API의 items 배열 안에 들어갈 상품 1개의 정보입니다.
export interface OrderItemDetail {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  customizedImageUrl: string; // ✨ AI가 생성한 케이크 도안 이미지 URL!
}

// 4. 상세 API (GET /api/orders/{orderId}) 의 최종 응답 타입입니다.
// OrderListItem에 있는 값들(id, storeName 등)을 그대로 물려받고(extends) 정보를 추가합니다.
export interface OrderDetail extends OrderListItem {
  orderData: Record<string, string>; // "맛": "초코" 같은 동적 JSON 매핑
  items: OrderItemDetail[];
}
```

---

## 3. 백엔드와 통신하는 함수 만들기 (`services/order.ts`)

이제 API 주소로 요청을 보내고, 방금 만든 타입을 씌워서 가져오는 함수를 만듭니다. 우리는 JWT 토큰이 필요하므로 일반 `fetch` 대신 `fetchWithAuth`를 사용합니다.

```typescript
import { OrderListItem, OrderDetail } from '@/types';
import { fetchWithAuth } from '@/utils/api';

export const orderService = {
  // ① 리스트 가져오기 함수 (배열 리턴)
  async getMyOrders(): Promise<OrderListItem[]> {
    const response = await fetchWithAuth('/api/orders', { method: 'GET' });
    return await response.json();
  },

  // ② 상세 정보 가져오기 함수 (단건 리턴)
  async getOrderDetail(orderId: number): Promise<OrderDetail> {
    const response = await fetchWithAuth(`/api/orders/${orderId}`, { method: 'GET' });
    return await response.json();
  }
};
```

---

## 4. 컴포넌트에서 데이터 꺼내 쓰기 (UI 매칭)

### 📌 주문 목록 화면 (`app/orders/index.tsx`)
화면에 들어오면 `useEffect`가 실행되면서 `getMyOrders()`를 호출합니다.

```tsx
// 1. 상태(State) 선언: 처음엔 빈 배열([])
const [orders, setOrders] = useState<OrderListItem[]>([]);

// 2. 데이터 페칭 (서버에서 가져와서 orders 상태에 넣기)
useEffect(() => {
  const fetchOrders = async () => {
    const data = await orderService.getMyOrders();
    setOrders(data); // 데이터 장착 완료!
  };
  fetchOrders();
}, []);

// 3. 가져온 orders 데이터를 화면에 그리는 자식 컴포넌트(<OrderStatus />)로 넘겨줍니다.
return <OrderStatus orders={orders} />;
```

### 📌 주문 상세 화면 (`app/orders/[id].tsx`)
리스트에서 특정 주문 카드를 클릭하면 `/orders/123` 같은 주소로 이동합니다. 이때 URL에 있는 숫자 `123`을 가져와서 API에 넣어야 합니다.

```tsx
// 1. URL에서 아이디 가져오기 (Expo Router 제공)
const { id } = useLocalSearchParams(); 
const [order, setOrder] = useState<OrderDetail | null>(null);

// 2. 상세 데이터 가져오기
useEffect(() => {
  const fetchOrderDetail = async () => {
    const data = await orderService.getOrderDetail(Number(id)); // id=123 전달!
    setOrder(data);
  };
  fetchOrderDetail();
}, [id]);

// --- 화면 그리기 부분 ---
// 백엔드의 order.storeName -> "메이커리 강남점" 출력!
<Text>{order.storeName}</Text> 

// 백엔드의 items[0].customizedImageUrl -> 이미지로 그리기!
<Image source={{ uri: order.items[0].customizedImageUrl }} />

// 옵션들 (맛, 문구 등) 은 Object.entries로 반복문 돌려서 예쁘게 출력!
{Object.entries(order.orderData).map(([key, value]) => (
  <View key={key}>
    <Text>{key}</Text>   {/* 예: "맛" */}
    <Text>{value}</Text> {/* 예: "초코" */}
  </View>
))}
```

### 💡 상태(Status)를 예쁜 한글 배지로 바꾸는 꿀팁
백엔드에서는 `"PENDING_QUOTE"` 처럼 대문자 영어로 줍니다. 프론트엔드에서는 이걸 유저가 보기 편하게 스위치문으로 한글+색상으로 바꿔주는 로직을 넣습니다.

```tsx
const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_QUOTE': return '견적 대기중';
    case 'APPROVED': return '입금 대기중';
    case 'IN_PROGRESS': return '제작 진행중';
    case 'COMPLETED': return '픽업 완료';
    case 'CANCELED': return '주문 취소됨';
    default: return status;
  }
};
```

---

## 🎯 요약
주니어 개발자 여러분, 백엔드와 연동할 때는 **[API 명세서 확인] ➡️ [타입(Interface) 작성] ➡️ [통신(Service) 함수 작성] ➡️ [React(컴포넌트)에서 호출 및 UI 매핑]** 이 네 박자만 기억하시면 어떠한 기능이든 거뜬히 만드실 수 있습니다! 파이팅! 🍰
