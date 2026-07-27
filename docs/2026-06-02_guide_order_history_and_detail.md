# 🛍️ 주문 내역 및 상세 조회 기능 개발 가이드

MakeAWish 프론트엔드 프로젝트의 사용자의 주문 목록 조회, 주문 상세 조회, 그리고 주문 상태(Status) 변환 로직에 대한 명세 및 개발 가이드입니다.

---

## 1. 백엔드 API 통신 명세 (`services/order.ts`)

모든 주문 관련 API는 `fetchWithAuth` 유틸리티 함수를 거쳐 Bearer 토큰 인증 헤더와 함께 호출됩니다.

### ① 내 주문 목록 조회 (`GET /api/orders`)
- **요청 파라미터:** 없음 (JWT 토큰으로 유저 식별)
- **응답 구조 (`OrderListItem[]`):**
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
  *(참고: 목록 조회 시에는 목록 렌더링 최적화를 위해 케이크 이미지나 동적 상세 옵션 데이터가 제외되고 핵심 기본 정보만 반환됩니다.)*

### ② 주문 상세 조회 (`GET /api/orders/{orderId}`)
- **요청 파라미터:** `orderId` (Path Variable)
- **응답 구조 (`OrderDetail`):**
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
  *(참고: 상세 조회 시에는 AI가 생성하거나 커스텀한 이미지(`customizedImageUrl`) 및 동적 요청 속성 매핑(`orderData`)이 포함됩니다.)*

---

## 2. 데이터 타입 정의 (`types/index.ts`)

API 응답 JSON과 1:1로 대응되는 TypeScript 인터페이스입니다.

```typescript
// 1. 주문 상태 값 명세
export type BackendOrderStatus = 
  | "PENDING_QUOTE" 
  | "APPROVED" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "CANCELED";

// 2. 주문 목록 아이템 (GET /api/orders)
export interface OrderListItem {
  id: number;
  orderNumber: string;
  storeName: string;
  status: BackendOrderStatus;
  totalPrice: number;
  pickupDate: string;
  createdAt: string;
}

// 3. 상품 항목 상세 정보
export interface OrderItemDetail {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  customizedImageUrl: string;
}

// 4. 주문 단건 상세 응답 (GET /api/orders/{orderId})
export interface OrderDetail extends OrderListItem {
  orderData: Record<string, string>; // 동적 슬롯 키-값 구조
  items: OrderItemDetail[];
}
```

---

## 3. UI 매핑 및 상태 배지 변환 로직

### ① 화면 단 호출 구조
- **주문 목록 화면 (`app/orders/index.tsx`):** 화면 진입 시 `useEffect`에서 `orderService.getMyOrders()`를 호출하여 상태 배열에 마운트합니다.
- **주문 상세 화면 (`app/orders/[id].tsx`):** Expo Router의 `useLocalSearchParams()`를 통해 URL 파라미터 `id`를 추출하고, `orderService.getOrderDetail(Number(id))`를 호출합니다.

### ② 주문 상태(Status) 한글 변환 로직
백엔드에서 반환되는 영문 상태 코드(`BackendOrderStatus`)는 화면 렌더링 시 아래 함수를 거쳐 한글 라벨과 스타일로 변환됩니다.

```typescript
export const getStatusText = (status: BackendOrderStatus): string => {
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
