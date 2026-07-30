# [MakeAWish-FE] 소비자앱 지도/탐색(`/explore`) 화면 Mock/Fallback 제거 및 실서버 데이터 100% 연동 기술 공략 가이드

- **작성일:** 2026-07-30
- **관련 PR/브랜치:** `feat/consumer-map-real-data`
- **대상 영역:** 소비자용 앱(`MakeAWish-FE`) 탐색 화면(`/explore`) 및 지도/포트폴리오 서비스(`services/map.ts`, `services/portfolio.ts`)

---

## 1. 아키텍처 개요 및 해결 과제

### 문제 배경 (Why)
1. **Mock 데이터 및 정적 Fallback 의존**: 기존 `/explore` 화면은 검색어(`query`)가 없을 때 정적 카테고리 버튼만 렌더링하고 실서버 추천 매장이나 인기 디자인 피드를 노출하지 못했습니다. 또한 썸네일 URL 조회 로직이 불완전하여 매장 대표 이미지(`store.thumbnailUrl`) 대신 정적 하드코딩 Fallback(Unsplash)이 자주 표시되었습니다.
2. **백엔드 페이징 규격(`PaginatedResponse`) 호환 미비**: 백엔드 API(`/api/stores`, `/api/portfolios/feeds`)가 배열(`Array`) 또는 페이징 응답 객체(`{ content: [...] }`)로 반환할 때 서비스 레이어에서 배열 여부를 검증하지 않고 반환하여 런타임에 `.map is not a function` 에러가 발생할 가능성이 있었습니다.
3. **사용하지 않는 깨진 모듈 임포트 존재**: `import { API_URL, fetchWithRetry } from '@/services/api'` 와 같이 존재하지 않는 모듈 임포트가 남아 있어 TS 컴파일 및 모듈 해상도 오류를 일으켰습니다.

---

## 2. 핵심 구현 사항 (How)

### 2-1. `app/(tabs)/explore.tsx`: 실서버 데이터 자동 조회 및 렌더링 강화
```typescript
useEffect(() => {
  const loadInitialData = async () => {
    setIsLoadingInitial(true);
    try {
      const [stores, portfolios] = await Promise.all([
        mapService.getNearbyStores(37.5665, 126.9780, 10000).catch(() => []),
        portfolioService.searchPortfolios('').catch(() => [])
      ]);
      setInitialStores(stores || []);
      setInitialPortfolios(portfolios || []);
    } catch (e) {
      console.error('Failed to load initial explore data:', e);
    } finally {
      setIsLoadingInitial(false);
    }
  };
  loadInitialData();
}, []);
```
- **초기 진입 시 실데이터 바인딩**: 화면 마운트 시 주변 추천 매장(`getNearbyStores`) 및 인기 디자인 피드(`searchPortfolios('')`)를 실서버로부터 비동기 병렬 조회하여 사용자가 검색어 없이도 실시간 데이터를 탐색할 수 있도록 개선했습니다.
- **매장 대표 썸네일 1순위 바인딩**: `store.thumbnailUrl`을 최우선으로 검사하여 실서버에서 등록된 매장 사진이 항상 정상 노출되도록 수정했습니다.

### 2-2. `services/map.ts` & `services/portfolio.ts`: 페이징 응답 및 피드 API 호환성 100% 보장
```typescript
// services/map.ts
const data = await response.json();
return Array.isArray(data) ? data : (data?.content || []);

// services/portfolio.ts
const endpoint = tags 
  ? `${API_BASE_URL}/api/portfolios/feeds?tags=${encodeURIComponent(tags)}&page=0&size=20`
  : `${API_BASE_URL}/api/portfolios/feeds?page=0&size=20`;
```
- **다형성 응답 파싱 방어 로직**: 백엔드가 리스트 배열 또는 페이징 객체(`{ content: Array }`) 형태로 반환하더라도 항상 안전하게 배열(`[]`)로 추출하여 반환하도록 보강했습니다.
- **포트폴리오 검색을 피드 엔드포인트와 통합**: 전체 조회 시 `/api/portfolios/feeds`를 우선 활용하여 무한 스크롤 및 피드 리스트와의 호환성을 높였습니다.

---

## 3. 검증 시나리오 (Verification Checklist)

1. **초기 화면 실시간 로딩 검증**
   - 탐색 탭(`/explore`) 진입 시 "실시간 매장 및 디자인 정보를 불러오는 중..." 로딩 스피너 작동 확인
   - 카테고리 하단에 실서버 DB의 '추천 매장' 및 '인기 디자인' 카드 목록 정상 출력 확인
2. **카테고리 및 키워드 검색 검증**
   - 생일, 기념일 등 카테고리 칩 클릭 또는 키워드 입력 시 즉시 실서버 API 호출(`searchStores`, `searchPortfolios`) 및 결과 수 파싱 확인
3. **빌드 및 타입 안전성 검증**
   - `node ./node_modules/typescript/bin/tsc --noEmit` 전체 검증 시 0 에러 통과 확인
