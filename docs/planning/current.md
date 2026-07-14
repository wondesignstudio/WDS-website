# 현재 실행 상태

## 활성 마일스톤

- 마일스톤: `M5–M6 — 통합 검증·출시 준비`
- 상태: `RESEND_DNS_PENDING`
- 기준일: 2026-07-14
- 구현 코드 상태: 공개 사이트·문의·관리자 기능, 로컬 QA와 최신 Vercel Preview 빌드 완료; 실제 문의 저장·중복 방지·이메일 큐·관리자 허용/차단 E2E 통과, Resend 도메인 DNS 인증 후 실메일 재검증 필요

## 완료

- [x] 한국어 공개 경로와 404 구현
- [x] 승인 시각 콘셉트 기반 Home·공통 페이지·반응형 UI 구현
- [x] 문의 필드·검증·허니팟·rate limit·idempotency 구현
- [x] Supabase 저장·RLS·12개월 삭제·고객 전환 이관 구현
- [x] Resend 내부 알림·자동 확인·outbox 재시도 구현
- [x] Google OAuth 관리자 목록·상세·검색·필터·상태·메모·삭제 구현
- [x] 개인정보 동의 후 GA4 핵심 이벤트만 로드하도록 구현
- [x] 페이지별 canonical·Open Graph·Twitter·sitemap·robots 구현
- [x] 내부 이메일 비노출·Contact 상담 전화 공개, 미승인 Work 상세 기본 차단
- [x] 단위·계약 테스트와 정적 검사 구성
- [x] Production build 최종 통과
- [x] 실제 브라우저 데스크톱·태블릿·모바일 검수
- [x] Contact 기본·검증 오류·환경 미설정 실패 상태 검수
- [x] 승인 콘셉트와 구현 캡처 시각 비교 기록
- [x] Vercel `wds-website` 프로젝트와 READY 상태 Preview 배포 생성
- [x] Vercel Hobby 제한에 맞춰 이메일 재시도 cron을 일 1회로 조정
- [x] WDS 컬러를 흑백·중성색·`#FF5C00`으로 제한하고 레퍼런스 색상 제거
- [x] 공식 SUIT variable 웹폰트와 `44/32/24/16/14/12px` 타입 스케일 전면 적용 (`14px` 본문, `12px` 메타·카피라이트 전용)
- [x] 공식 WDS 검정·흰색 모노그램을 헤더·About·푸터에 반응형 적용
- [x] Contact 라벨·필수/선택 표시를 단일 행으로 통합하고 데스크톱·모바일 입력 시작선 정렬
- [x] 오렌지 사용을 핵심 CTA·focus·필수/활성 상태로 축소하고 장식용 섹션 구분선 제거
- [x] 공개 본문·메타데이터와 관리자 폼 라벨을 `14px` 이상으로 통일 (`12px`는 저작권·상태 chip 전용)
- [x] Supabase 운영 프로젝트 생성과 문의·관리자 migration 적용
- [x] 관리자 허용 목록에 `wondesign01@gmail.com` 등록
- [x] Google OAuth 앱·Supabase 공급자 연결과 기본 callback URL 등록
- [x] GA4 기존 웹 스트림 확인 및 Preview 환경 변수 연결
- [x] Resend `wondesign.studio` 발신 도메인 생성과 Preview API 키 연결
- [x] Vercel Preview 환경 변수 13개 등록
- [x] Vercel Preview의 `SUPABASE_SERVICE_ROLE_KEY`를 전체 운영 값으로 교체
- [x] Preview OAuth 콜백에서 불필요한 쿼리를 제거하고 Preview 와일드카드 URL 등록
- [x] 최신 Preview 배포 생성: `https://wds-website-k0hs02e6m-wondesign01-6115s-projects.vercel.app`
- [x] 권한 nameserver가 아임웹 `ens1–4.hostcocoa.com`이고 GoDaddy에서는 AWS 외부 DNS로 표시되는 상태 확인
- [x] Resend Tokyo 리전의 DKIM·SPF·MX·선택 DMARC 전환 항목 기록
- [x] 실제 처리 흐름과 2026 개인정보 처리방침 작성지침을 반영한 공개 문안·동의 버전 확정
- [x] 업데이트된 개인정보처리방침의 데스크톱·모바일 Preview 브라우저 검수 및 배포
- [x] 관리자 프로젝트 등록·수정·목록/상세 공개 제어 구현
- [x] 비공개 Supabase Storage 기반 프로젝트 이미지·고객 로고 업로드·승인·공개 관리 구현
- [x] 개인정보처리방침·이용약관 초안·버전 발행·이전 버전 보관 구현
- [x] 공개 Work·Home·법적 문서를 관리자 발행 데이터와 연결하고 migration 전 fallback 유지
- [x] Supabase 운영 프로젝트에 콘텐츠 관리자 migration 적용 및 테이블 3종·비공개 버킷·기본 프로젝트 3건 확인

## 검증 결과

- [x] ESLint 통과
- [x] TypeScript 검사 통과
- [x] Vitest 67개 통과
- [x] Next.js production build 통과
- [x] 가로 오버플로·모바일 메뉴 포커스 복귀·404·관리자 환경 미설정 상태 확인
- [x] 최신 Preview에서 공개 Home·Work·개인정보처리방침과 관리자 프로젝트·미디어·법적 문서 화면을 데스크톱·모바일 검수
- [x] Questboard 공개 상세 404 수정, 프로젝트별 이미지 업로드와 서식 편집기·미리보기 Preview 검수
- [x] 관리자 페이지 전환 로딩과 프로젝트 등록·편집 폼 이탈 방지 모달 구현 및 Preview 검수
- [x] 프로젝트 관리 테이블 수정·삭제 액션과 연결 미디어 연쇄 삭제 구현
- [x] 공개·관리자 본문과 폼 컨트롤 계산값 `14px`, 모바일 가로 오버플로 0, 브라우저 오류·경고 0 확인
- [x] 최신 Preview 홈·`robots.txt`·`sitemap.xml` HTTP 200 확인
- [x] 최신 Preview 문의 API의 미지원 콘텐츠 타입 415, 멱등키 누락 400, 허니팟 무응답 성공 200 확인
- [x] Preview 실제 문의 1건 저장, 동일 멱등키 200 재사용, DB 1건 유지 확인
- [x] 내부 알림·고객 확인 메일 outbox 2건 생성과 재시도 상태 확인
- [x] 허용 관리자 Google 로그인·목록·상세 조회와 비허용 계정 차단 확인
- [x] Cron 비인가 요청 401, 허니팟 200 무저장과 DB 1건 유지 확인
- [ ] Resend DNS 인증 후 내부 알림·고객 확인 메일 실제 발송 확인

## 출시 전 외부 작업

- [x] Supabase 프로젝트 생성, migration 적용, Google OAuth와 관리자 허용 목록 설정
- [ ] Resend에서 `wondesign.studio` 발신 도메인 검증
- [x] Supabase에 `202607140001_content_admin.sql` 적용
- [x] 운영 관리자 Google 로그인과 프로젝트·미디어·법적 문서 목록·편집 화면 접근 확인
- [x] 기본 프로젝트 3건의 상세 공개 상태 보정 및 Questboard 공개 상세 404 해소
- [x] 프로젝트 생성 시 대표 이미지 등록, 편집 화면 내 추가 이미지 관리, 서식 도구·미리보기 본문 편집기 구현
- [ ] 관리자 프로젝트 저장·실제 승인 미디어 업로드·법적 문서 발행 E2E 확인
- [x] Vercel 프로젝트·Hobby 호환 cron 설정
- [x] Vercel Preview의 `SUPABASE_SERVICE_ROLE_KEY`를 전체 값으로 교체
- [x] 나머지 Vercel Preview 환경 변수 설정
- [x] 기존 GA4 Measurement ID 연결
- [x] 개인정보처리방침 공식 지침 기반 운영 검토와 공개 문안 확정
- [ ] 공개 승인된 프로젝트 화면·고객 로고 반영
- [x] Preview에서 실제 문의 1건의 저장·이메일 큐·관리자 조회 검증
- [ ] Resend DNS 인증 후 운영자 알림·고객 확인 메일 발송 및 재처리 검증
- [ ] GoDaddy DNS를 Vercel로 전환하고 root를 canonical로, `www`를 root로 리디렉션

## 출시 차단 조건

- Resend 도메인 DNS가 검증되지 않아 발신 메일을 보장할 수 없는 상태
- 현재 아임웹 권한 DNS에서는 임의 Resend 레코드를 편집할 수 없어 GoDaddy nameserver 전환과 함께 인증해야 하는 상태
- Resend 인증 후 실제 문의의 알림·확인 메일과 재처리 성공을 확인하지 않은 상태
- 실제 이미지 업로드·법적 문서 발행 E2E를 Preview 관리자에서 확인하지 않은 상태
- 공개 승인이 없는 고객 자산 또는 프로젝트 상세가 노출된 상태
- Production 도메인·HTTPS·canonical·robots·sitemap을 확인하지 않은 상태
