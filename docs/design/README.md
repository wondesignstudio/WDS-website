# WDS 디자인 구현 기준

## 승인·참조 콘셉트

| 파일 | 역할 | 상태 |
| --- | --- | --- |
| `concepts/home-hero-approved.png` | Header, Hero, 첫 뷰포트와 다음 섹션 진입 | 사용자 승인 |
| `concepts/home-challenge-featured-work.png` | Challenge, Featured Work | 승인 방향의 보조 사양 |
| `concepts/home-selected-work-capabilities.png` | Selected Work, Capabilities, How We Work | 승인 방향의 보조 사양 |
| `concepts/home-closing-sections.png` | Why WDS, About, Final CTA, Footer | 승인 방향의 보조 사양 |
| `concepts/core-pages-board.png` | 서브페이지와 내부 관리자 레이아웃 언어 | 시각 구조만 참조 |

`core-pages-board.png` 안의 프로젝트 연도, 기간, 역할, 상세 문장은 사실 근거가 아니므로 구현 콘텐츠로 사용하지 않습니다. 모든 공개 콘텐츠는 기준 기획서와 공개 승인표를 우선합니다.

## 잠긴 디자인 시스템

- 배경은 `#FFFFFF`, 본문과 선은 `#000000`, 강조는 `#FF5C00`입니다.
- 오렌지는 핵심 CTA, focus, 필수 입력 표시와 현재 활성 상태에만 제한합니다. 넓은 배경, 장식 그래픽, 반복 라벨에는 사용하지 않습니다.
- 섹션 사이를 반복 선으로 나누지 않습니다. 여백, 배경 톤과 콘텐츠 정렬로 위계를 만들고, 선은 입력 필드나 데이터 구조처럼 기능적 경계가 필요한 경우에만 사용합니다.
- 공개 본문과 메타데이터는 최소 `14px`로 사용합니다. `12px`는 저작권 문구와 독립된 상태 chip에만 허용합니다.
- 그라디언트, 글로우, 크림색 배경, 둥근 카드 반복과 의미 없는 장식 이미지는 사용하지 않습니다.
- 레이아웃은 넓은 여백, 큰 문장, 얇은 선, 개방된 밴드와 비대칭 프로젝트 프레임을 사용합니다.
- Header는 `WDS / Work / Services / Approach / About / Contact`로 고정합니다.
- Hero 상단 문구, 제목, 설명과 두 CTA는 승인 콘셉트의 카피와 순서를 유지합니다.
- 실제 프로젝트 화면과 고객 로고가 승인되기 전에는 가짜 화면을 만들지 않고 중립 구조 프레임만 사용합니다.
- UI 텍스트, 버튼, 폼과 관리자 데이터는 모두 코드로 구현하며 콘셉트 이미지를 UI로 사용하지 않습니다.

## 구현 검증 기준

- 기본 비교 크기: 승인 Hero 콘셉트 원본 `1536 × 1024`.
- 데스크톱, 태블릿, 모바일에서 내비게이션, CTA, Work 탐색과 Contact 흐름을 검증합니다.
- 공개 전에는 실제 프로젝트 자산, WDS 모노그램, SUIT 웹폰트와 개인정보 문안을 교체·승인해야 합니다.
