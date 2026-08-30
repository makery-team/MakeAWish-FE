# AI 채팅창 입력 방어 및 주문 상세 가로 오버플로우 수정

## 1. 개요
- 비정상적인 사용자 시나리오 방어 및 주문 상세 화면 레이아웃 안정성 개선
- 작업일시: 2026-08-30

## 2. 변경 내용

### 1) AI 채팅창 입력 가드 (UI Guarding) (`components/ai-search-bar.tsx`)
- 케이크 정보 카드(`LOCAL_ORDER_REMINDER`)가 화면에 노출되어 있을 때:
  - 하단 `TextInput`의 `editable={false}` 설정 및 `opacity: 0.7` 스타일 적용
  - 인풋 플레이스홀더를 `"👆 위의 [문의하기] 버튼을 선택해주세요"`로 동적 변경
  - 전송 버튼 비활성화 (`disabled={true}`, `opacity: 0.35`)
- 카드의 [문의하기] 또는 [취소]를 클릭하면 카드가 해소되며 즉시 인풋이 정상 활성화됨.

### 2) 주문 상세 화면 옵션 레이아웃 오버플로우 수정 (`app/orders/[id].tsx`)
- 주문서의 옵션명(Label)이나 레터링 문구 등 사용자 입력값이 길어질 때 카드를 벗어나 가로로 삐져나가는 현상 수정:
  - `optionRow`: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, `gap: 12`
  - `optionKey`: `flex: 1`, `fontSize: 13`, `color: '#6B7280'`
  - `optionValue`: `flex: 1`, `textAlign: 'right'`, `flexWrap: 'wrap'`, `fontSize: 13`, `fontWeight: '600'`, `color: '#111827'`
- 내용이 길어져도 카드 우측 경계를 넘지 않고 카드 내부에서 자연스럽게 여러 줄로 줄바꿈(Wrap)됨.
