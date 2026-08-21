# 🚨 [장애 분석 및 트러블슈팅] 사장님 앱 주문 접수 미노출 및 JWT Principal 권한 누락

- **작성 일자**: 2026-08-21
- **관련 시스템**: `MakeAWish-FE`, `MakeAWish-BE`, `MakeAWish-FE-Owner`
- **해결 상태**: 해결 완료 (Resolved)

---

## 1. 장애 현상 (Incident Symptom)
- **증상**: 소비자가 특정 매장(예: `테스트테스트`, `몇번째`)으로 주문제작 케이크 주문을 정상 접수하여 소비자 앱의 "내 주문 내역"에는 표시되었으나, 사장님 앱(`MakeAWish-FE-Owner`)의 "오늘의 주문" 및 "주문 관리(`/orders`)" 목록에서 새로고침(F5)을 해도 주문이 전혀 조회되지 않고 **"총 0건 (접수된 주문이 없어요)"**으로 표시됨.

---

## 2. 근본 원인 분석 (Root Cause Analysis)

### 🔴 원인 1 (백엔드): JWT 인증 시 `userRole` 바인딩 누락 (가장 결정적 💥)
1. **코드 위치**: `TokenProvider.java`의 `getAuthentication(String token)`
2. **원인 상세**:
   ```java
   // 🚨 수정 전 버그 코드
   Claims claims = getClaims(token);
   String role = claims.get("role", String.class);
   
   User user = User.builder()
           .id(claims.get("id", Long.class))
           .email(claims.getSubject())
           // 💥 .userRole(...) 바인딩이 누락되어 null로 생성됨!
           .build();

   PrincipalDetails principalDetails = new PrincipalDetails(user);
   ```
3. **영향**:
   - 사장님 앱에서 `GET /api/orders`를 요청할 때 컨트롤러가 전달받은 `principalDetails.user().getUserRole()`이 항상 `null`로 반환됨.
   - `OrderService.getMyOrders`에서 `if (role == UserRole.ROLE_SELLER)` 분기를 타지 못하고 `else`로 빠져 **"사장님이 소비자로서 직접 주문한 내역(`findAllByUserId`)"** 쿼리가 실행됨.
   - 사장님 계정으로 본인이 케이크를 주문한 적이 없으므로 항상 `0건`만 반환됨.

---

### 🔴 원인 2 (소비자 앱): AI 챗봇 및 에디터 전환 시 `storeId` 유실 및 1번 매장 Fallback
1. **코드 위치**: `MakeAWish-FE/app/(tabs)/index.tsx`, `ai-search-bar.tsx`, `editor/[id].tsx`
2. **원인 상세**:
   ```typescript
   // 🚨 수정 전 코드
   const storeId = orderData.storeId || conversationHistory.storeId || 1; 
   ```
3. **영향**:
   - 손님이 AI 챗봇 추천 슬라이더 또는 2D 에디터에서 시안을 수정하고 상담을 진행할 때, 라우트 파라미터나 상태 객체에서 실제 매장 식별자(`storeId`)가 누락되면 무조건 `1번 매장(어드민)`으로 주문이 생성됨.
   - 신규 생성 매장 사장님은 본인 매장 주문만 조회하므로 1번 매장으로 들어간 주문을 볼 수 없었음.

---

## 3. 해결 및 개선 조치 (Resolution & Improvements)

### 1) 백엔드 (`MakeAWish-BE`)
1. **`TokenProvider.java`**:
   - 토큰의 `role` Claims를 파싱하여 `User.builder().userRole(userRole)`에 정확히 주입.
2. **`OrderService.java`**:
   - `getMyOrders` 및 `getOrderDetail` 호출 시 DB의 실시간 회원 상태 및 `user.getSellerProfile() != null` 여부를 확인하여 사장님 권한을 2중 검증.
   - 사장님이라면 무조건 본인 매장 주문(`findAllBySellerId`)을 조회하도록 방어 로직 강화.
   - `date=today` 필터 시 `ZoneId.of("Asia/Seoul")` 기준 한국 날짜를 적용하고, 대기 주문(`PENDING_QUOTE`) 및 당일 픽업/생성 주문을 모두 포괄하도록 개선.

### 2) 소비자 앱 (`MakeAWish-FE`)
1. **`ai-search-bar.tsx` & `editor/[id].tsx`**:
   - 도안 선택 ➔ 2D 에디터 ➔ 상담 확인 모달 ➔ 최종 주문서 생성까지 매장 식별자(`storeId`)와 대표 태그(`tags`)가 100% 보존되도록 파이프라인 정비.
2. **`order-reminder-card.tsx`**:
   - "포함된 태그" 항목에 대표 태그 1개(`#생일케이크`)가 깔끔하게 노출되도록 개선.

### 3) 사장님 앱 (`MakeAWish-FE-Owner`)
1. **`OrderList.jsx` & `Home.jsx`**:
   - 주문 관리 및 홈 화면에 4초 주기 자동 갱신(Polling)을 적용하여, 사장님이 F5를 누르지 않아도 새 주문이 실시간으로 상단에 노출되도록 개선.

---

## 4. 재발 방지 대책 (Prevention)
1. **Spring Security Principal 일관성 테스트**:
   - JWT 토큰 파싱 후 SecurityContext에 등록되는 Principal 객체의 필수 필드(`id`, `email`, `userRole`)가 누락되지 않는지 통합/단위 테스트 검증.
2. **프론트엔드 라우팅 파라미터 유실 방지**:
   - 전역 컨텍스트(`InquiryContext`) 및 화면 전환 간 필수 식별자(`storeId`, `productId`, `portfolioId`)가 항상 동기화되도록 유지.
