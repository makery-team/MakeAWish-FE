# 2026-08-24 소비자 앱 주문 내역 조회 role=consumer 쿼리 연동 가이드

## 1. 개요
- 소비자가 사장님 계정(ROLE_SELLER)을 보유하고 있더라도 소비자 앱 마이페이지 주문 내역에서는 본인이 구매한 주문(소비자 모드)을 정상 조회할 수 있도록 개선
- services/order.ts의 getMyOrders에서 GET /api/orders?role=consumer 파라미터 전달

## 2. 변경 파일
1. services/order.ts: getMyOrders API 엔드포인트에 ?role=consumer 쿼리 파라미터 추가
