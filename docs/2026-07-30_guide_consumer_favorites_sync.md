# [MakeAWish-FE] 소비자앱 찜하기(Favorites) 실시간 API 연동 및 마이페이지 동기화 기술 공략 가이드

- **작성일:** 2026-07-30
- **관련 PR/브랜치:** `feat/consumer-favorites-sync`
- **대상 영역:** 소비자용 앱(`MakeAWish-FE`) 마이페이지(`/mypage`), 찜 목록(`/favorites`), 리뷰 목록(`/reviews`) 및 상태 관리(`ShopContext`, `favoriteService`, `reviewService`)

---

## 1. 아키텍처 개요 및 해결 과제

### 문제 배경 (Why)

1. **마이페이지 상단 찜한 가게/작성 리뷰 카운트 하드코딩 (`0`)**: 기존 `app/(tabs)/mypage.tsx` 상단 프로필 통계 박스에 `orderCount` 외에 `찜한 가게`, `작성 리뷰` 수는 항상 `0`으로 하드코딩되어 있어 사용자의 실제 활동 내역을 나타내지 못했습니다.
2. **화면 간 실시간 동기화 부재**: 마이페이지 진입 시 최초 마운트(`useEffect`)에만 로딩하거나, 찜 목록(`/favorites`) 또는 리뷰 목록(`/reviews`) 화면 진입 시 최신 백엔드 데이터를 다시 로드하는 로직이 없어 화면 간 데이터가 불일치했습니다.
3. **백엔드 다형성(PaginatedResponse vs Array) 응답 런타임 에러 위험**: `/api/users/me/likes` 및 `/api/reviews/me` 응답 파싱 시 배열인지 페이징 객체(`content: [...]`)인지 검증하지 않아, 런타임에 `.map is not a function` 예외가 발생할 수 있었습니다.

---

## 2. 핵심 구현 사항 (How)

### 2-1. `app/(tabs)/mypage.tsx`: 실시간 3대 통계 바인딩 및 Pull-to-Refresh 추가

```typescript
const fetchLatestData = useCallback(async () => {
  try {
    const userData = await authService.getCurrentUser();
    if (userData) {
      updateUser(userData);
    }
    
    const [orders, favorites, reviewsRes] = await Promise.all([
      orderService.getMyOrders().catch(() => []),
      favoriteService.getMyFavorites().catch(() => []),
      reviewService.getMyReviews(0, 1).catch(() => ({ totalElements: 0, content: [] }))
    ]);
    setOrderCount((orders || []).length || 0);
    setFavoriteCount((favorites || []).length || 0);
    const rCount = (reviewsRes as any)?.totalElements || (reviewsRes as any)?.content?.length || 0;
    setReviewCount(rCount);
  } catch (error) {
    console.error('Failed to fetch mypage data:', error);
  }
}, [updateUser]);

useFocusEffect(
  useCallback(() => {
    fetchLatestData();
  }, [fetchLatestData])
);
```

- **화면 포커스 시 실시간 갱신 (`useFocusEffect`)**: 사용자가 다른 탭이나 화면에서 작업을 마친 후 마이페이지로 돌아오면, 주문/찜/리뷰 데이터를 즉시 재조회하여 항상 최신 통계가 보이도록 보장합니다.
- **당겨서 새로고침 (`RefreshControl`) 지원**: 화면을 스와이프 다운할 때 수동 새로고침(`onRefresh`)이 가능하도록 구현했습니다.
- **통계 박스 터치 네비게이션**: 상단 숫자 카드를 클릭하면 각각 주문 내역(`/orders`), 찜 목록(`/favorites`), 리뷰 목록(`/reviews`)으로 즉시 이동합니다.

### 2-2. `context/ShopContext.tsx` & `services/favorite.ts`: 다형성 파싱 안전성 강화 및 강제 갱신 API 노출

```typescript
// ShopContext.tsx
const favList = Array.isArray(backendFavorites) ? backendFavorites : ((backendFavorites as any)?.content || []);
const rawList = Array.isArray(backendReviews) ? backendReviews : (backendReviews?.content || []);

export interface ShopContextType {
  // ...
  refreshFavorites: () => Promise<void>;
  refreshReviews: () => Promise<void>;
}
```

- **`refreshFavorites`, `refreshReviews` 액션 노출**: `ShopContext`에서 백엔드 동기화 함수를 외부 훅(`useFavorites`, `useReviews`)에 공개하여 화면 진입 시 트리거할 수 있게 했습니다.

### 2-3. `app/favorites/index.tsx`, `app/reviews/index.tsx`: 포커스 시 실서버 Sync

```typescript
useFocusEffect(
  useCallback(() => {
    if (refreshFavorites) {
      refreshFavorites();
    }
  }, [refreshFavorites])
);
```

- 찜 목록이나 리뷰 관리 화면에 입장할 때마다 `useFocusEffect`로 서버 데이터와 로컬 상태(`ShopContext`)를 자동 동기화합니다.

---

## 3. 검증 시나리오 (Verification Checklist)

1. **마이페이지 상단 통계 수치 실시간 검증**
   - 케이크나 매장을 찜한 후 마이페이지 진입 시 '찜한 가게' 카운트가 0에서 정상 수치로 증가하는지 확인
   - 리뷰 작성 후 마이페이지 진입 시 '작성 리뷰' 카운트가 실시간 증가하는지 확인
2. **스와이프 새로고침(Pull-to-Refresh) 및 통계 터치 이동 검증**
   - 마이페이지 아래로 당겨서 스피너 작동 및 데이터 최신화 확인
   - '찜한 가게', '작성 리뷰' 박스 클릭 시 각각의 목록 화면으로 정상 이동 확인
3. **타입 안전성 및 컴파일러 검증**
   - `node ./node_modules/typescript/bin/tsc --noEmit` 전체 컴파일 0 에러 통과 확인

---

## 4. 트러블슈팅 (Troubleshooting & Real-Time Sync Deep Dive)

### 4-1. 백엔드 DTO 프로퍼티 불일치 (`id` vs `portfolioId`) 및 404 에러 해결

- **증상**: 홈 화면에서 찜한 뒤 매장 상세페이지 진입 시 찜 상태가 불일치하거나, `POST /api/portfolios/{id}/likes` 호출 시 404 에러 발생.
- **원인**: `/api/portfolios/feeds` (홈 피드)에서는 `"id"` 키를 기본키로 내려주지만, `/api/stores/{id}/portfolios` (매장 포트폴리오) 및 `/api/users/me/likes` (내 찜 목록)에서는 `"portfolioId"` 키로 기본키를 반환하는 백엔드 DTO 불일치 문제.
- **해결 방안**:
  - `StorePortfolio` 인터페이스에 `portfolioId?: number` 속성을 정식 DTO 속성으로 정의.
  - `ShopDetail.tsx` 및 `favorite.ts`에서 기본키 매핑 시 `p.id ?? p.portfolioId`로 통합 매핑하여, 홈 화면 ↔ 매장 상세페이지 ↔ 마이페이지 ↔ 찜 목록 전역에서 동일한 기본키(PK)를 정확히 일치시킴.
  - 임시 우회 분기(예: `ID < 1000` 조건, 로컬 가짜 찜 병합 로직 등)를 100% 제거하고 정석적인 백엔드 직접 동기화 아키텍처로 정화.

### 4-2. `TypeError: Cannot read property 'toString' of undefined` 런타임 예외 해결

- **증상**: 찜 목록이나 리뷰 목록 로딩 시 런타임에 `Cannot read property 'toString' of undefined` 예외 발생.
- **원인**: `favoriteService.getMyFavorites` 및 `ShopContext`에서 DB 응답을 파싱할 때 `portfolio.id.toString()`을 직접 호출했으나, 백엔드가 `"id"` 대신 `"portfolioId"`로 키를 내려주어 `undefined.toString()`이 실행됨.
- **해결 방안**:
  - `String(portfolio.id ?? portfolio.portfolioId)`와 같이 Null-Safety 방어적 문자열 변환 기법 적용.
  - 유효하지 않은 식별자를 가진 항목은 `.filter()`로 사전에 안전하게 제외.

### 4-3. 화면 이동 간 좋아요 숫자 미감소(Not Discounted) 불일치 해결 (`likeCounts` Single Source of Truth)

- **증상**: 홈 화면에서 좋아요 클릭(45 -> 46) 후 매장 상세페이지에 진입하여 좋아요를 취소했을 때, 상세페이지는 45로 감소했으나 홈 화면으로 복귀 시 하트 토글 아이콘은 비활성화(OFF)되었음에도 숫자는 46에 머물러 감소하지 않는 현상.
- **원인**: 하트 아이콘 상태(`isFavorited`)는 전역 상태(`ShopContext.favorites`)를 참조하지만, 좋아요 숫자는 탭 네비게이터 특성상 백그라운드 메모리에 유지되던 홈 화면 로컬 컴포넌트 상태(`cakes`)의 값을 그대로 표시하고 있어 화면 간 전이 시 숫자가 갱신되지 못함.
- **해결 방안**:
  - `ShopContext`에 모든 화면이 공유하는 **전역 좋아요 숫자 동기화 맵 (`likeCounts: Record<string, number>`)** 을 정식 도입.
  - `toggleFavorite` 및 `removeFavorite` 호출 시마다 전역 `likeCounts[id]` 값을 실시간으로 `+1`/`-1` 증감하여 즉시 갱신.
  - 홈 화면(`CakeGrid`) 및 매장 상세페이지(`ShopDetail`) 모두 렌더링 시 **`likeCounts[id]`를 0순위 단일 진실 공급원(Single Source of Truth)** 으로 참조:

    ```typescript
    const globalLikes = likeCounts[cake.id.toString()];
    const currentLikes = globalLikes !== undefined ? globalLikes : cake.likeCount;
    ```

  - 이제 홈, 매장 상세페이지, 마이페이지 어디서 누르고 복귀하더라도 **하트 아이콘 상태와 좋아요 숫자가 100% 실시간으로 일치하며 정확히 증가 및 감소**함.
