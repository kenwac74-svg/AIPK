# LONGRISE — PC Web (LRHP reskin) · GitHub 배포 소스

로그인 후 PC 대시보드. **원본 컴파일 앱(번들)을 수정하지 않고** CSS 오버라이드 + DOM 오버레이로 리스킨/기능을 얹은 정적 사이트입니다.

## 진입점
- `index.html` — GitHub Pages 루트에서 바로 서빙.

## 구조
```
index.html                 진입 HTML (LRHP 다크 베이스 + 자산 로드)
assets/                    원본 컴파일 React 번들 (수정 금지)
  index-reskin.js          엔트리(로고/패키지 카피만 리스킨)
  ui-Bpxsm5T0.js           UI 청크
  vendor-De2TMoxH.js       React 등 vendor
  api-DcNlVx-A.js          API 레이어
reskin/
  index-lrhp.css           LRHP 토큰 리스킨 스타일 (Tailwind 빌드)
  earn-pc.css              EARN 페이지 + 글로벌 푸터 스타일
  earn-pc.js               ★ 오버레이/주입 스크립트 (아래 참조)
  candles.js               캔들 차트 엔진(window.LRChart)
brand/                     랭크/로고 PNG (EARN 카드 아이콘 등)
```

## reskin/earn-pc.js 가 하는 일 (컴파일 번들 미수정, 전부 런타임 오버레이)
1. **CRYPTO AI → EARN 페이지 교체** — 네비 01 활성 시 원본 CRYPTO AI(LIQUIDITY ENGAGEMENT) 화면을 숨기고 EARN 대시보드(총자산·AI 엔진·보유 패키지·라이브 트레이드·7일 수익)를 주입.
2. **네비 라벨** — CRYPTO AI→EARN, PACKAGES→PLANS, REWARDS→NETWORK.
3. **글로벌 푸터** — LONGRISE 마케팅 사이트 푸터를 전 페이지에 이식(앱 기본 푸터는 숨김).
4. **사용자명 → 랭크 표시** — 계정 칩의 "Investor" 라벨을 회원 등급으로 표시.
5. **Platform Settings 숨김** — 계정 메뉴에서 UI만 제거(소스 보존).
6. **카피 리브랜드** — investment 계열 표현을 betting 용어로 치환.

## 개발자(개발 AI)용 TODO 마커 — `reskin/earn-pc.js` 상단 주석 참조
- **USER_RANK** — 현재 데모값 하드코딩. 운영 시 회원의 최상위 활성 패키지로 서버에서 등급 산출, 미달(<Basic $200)은 `ROOKIE`.
  | 등급 | 조건 |
  |---|---|
  | White | Basic ($200+) |
  | Blue | Standard ($500+) |
  | Purple | Premium ($1,000+) |
  | Red | VIP ($5,000+) |
  | Black | $10,000+ |
  | Rookie | 미달/신규 |
- **Platform Settings** — 아직 미개발 메뉴라 `hidePlatformSettings()`로 UI만 숨김. 개발 완료 후 reconcile()에서 해당 호출 제거하면 원복(번들에 버튼 그대로 존재).

## 주의
정적 프리뷰 — 실거래/실자금 없음. `assets/*.js`는 컴파일 아티팩트이므로 직접 수정하지 말고 `reskin/`의 CSS·오버레이로만 변경할 것.
