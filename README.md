# WDS 웹사이트 리뉴얼

Won Design Studio의 한국어 공식 웹사이트입니다. 공개 페이지, 상담 문의 저장·알림, Google 관리자 화면, 개인정보 보관 작업과 선택형 GA4 동의를 포함합니다.

## 현재 상태

- 공개 페이지와 반응형 UI 구현 완료
- Contact 서버 검증, Supabase 저장, Resend 알림·확인 메일과 재시도 구현 완료
- 관리자 프로젝트·미디어·법적 문서 편집과 발행 흐름 구현 완료
- 비공개 Supabase Storage 기반 프로젝트 이미지·고객 로고 승인·공개 관리 구현 완료
- Google OAuth 관리자 목록·상세·검색·상태·메모·삭제 구현 완료
- 공개 승인 전 프로젝트 상세와 고객 자산은 Production에서 숨김
- 실제 Supabase·Resend·GA4·Vercel 설정, 승인 자산 반영과 DNS 전환은 출시 전 남은 작업

현재 실행 상태는 [`docs/planning/current.md`](docs/planning/current.md), 배포 순서는 [`docs/operations/deployment.md`](docs/operations/deployment.md)를 기준으로 합니다.

## 로컬 실행

Node.js 20.9 이상이 필요합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

환경 변수 없이도 공개 화면과 폼 검증을 확인할 수 있습니다. 실제 문의 저장·메일·관리자 로그인은 `.env.local`과 공급자 설정이 필요합니다.

## 검증

```bash
npm run verify
```

개별 명령은 `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`입니다.

## 주요 경로

- 공개: `/`, `/work`, `/services`, `/approach`, `/about`, `/contact`, `/privacy`
- 관리자: `/admin/login`, `/admin/inquiries`, `/admin/projects`, `/admin/media`, `/admin/legal`
- 조건부 공개: `/terms`는 관리자가 이용약관을 처음 발행한 뒤 푸터와 sitemap에 노출
- 문의 API: `/api/contact`
- 운영 작업: `/api/cron/email-retry`, `/api/cron/retention`

## 데이터베이스

새 Supabase 프로젝트의 SQL Editor에서 [`supabase/migrations/202607100001_contact_admin.sql`](supabase/migrations/202607100001_contact_admin.sql)을 실행합니다. 승인된 관리자 이메일은 저장소에 넣지 않고 `private.admin_allowlist`에 직접 등록합니다.

## 콘텐츠 원칙

실제 고객명, 로고, 프로젝트 화면과 성과는 공개 승인이 확인된 자산만 게시합니다. 현재 중립 그래픽은 개발·검수용이며, 미승인 Work 상세는 기본적으로 생성되지 않습니다.
