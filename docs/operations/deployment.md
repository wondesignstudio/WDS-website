# 배포·도메인 전환 런북

> 2026-07-28 Production 전환과 실제 문의 검증 결과는
> [`launch-2026-07-28.md`](./launch-2026-07-28.md)에 기록되어 있습니다.

## 1. 공급자 준비

1. Supabase 프로젝트와 Vercel 프로젝트를 생성합니다.
2. Resend에서 `wondesign.studio` 발신 도메인을 추가합니다.
3. 기존 GA4 속성의 Measurement ID를 준비합니다.
4. GoDaddy DNS 변경 전 현재 nameserver와 모든 DNS 레코드를 캡처해 복구 자료로 보관합니다.

2026-07-14 재확인 기준 권한 nameserver는 `ens1.hostcocoa.com`부터 `ens4.hostcocoa.com`까지이며, GoDaddy는 현재 DNS 공급자를 Amazon Web Services로 표시합니다. 이는 아임웹이 관리하는 DNS이므로 GoDaddy DNS 레코드 편집은 비활성 상태입니다. GoDaddy 기본 nameserver로 바꾸는 순간 사이트 DNS도 함께 전환되므로 Preview 승인 전에는 변경하지 않습니다.

전환 전 공개 DNS 복구 기준:

- root `A`: `3.168.167.26`, `3.168.167.31`, `3.168.167.39`, `3.168.167.83`
- `www` `A`: root와 동일한 네 주소
- root와 `www`의 `AAAA`, root `MX`·`TXT`, `resend._domainkey` `TXT`, `send` `MX`·`TXT`, `_dmarc` `TXT`: 없음

## 2. Supabase

1. SQL Editor에서 `supabase/migrations/202607100001_contact_admin.sql`을 실행합니다.
2. Authentication에서 Google provider를 활성화합니다.
3. Supabase와 Google OAuth 설정에 Production `https://wondesign.studio/auth/callback`과 로컬 `http://localhost:3000/auth/callback`을 허용합니다.
4. SQL Editor에서 승인된 Google 계정을 등록합니다. 실제 이메일은 저장소나 문서에 기록하지 않습니다.

```sql
insert into private.admin_allowlist (email)
values ('APPROVED_ADMIN_EMAIL')
on conflict (email) do update set enabled = true;
```

5. `/admin/login`에서 Google 로그인 후 `/admin/inquiries` 접근을 확인합니다.

## 3. Resend

1. Resend가 제시하는 SPF·DKIM 등 DNS 레코드를 그대로 기록합니다.
2. GoDaddy에서 DNS를 전환할 때 해당 레코드를 함께 추가합니다.
3. 발신자는 `WDS <contact@wondesign.studio>`로 설정합니다.
4. 내부 알림에는 문의 원문을 복제하지 않고 문의 ID와 인증된 관리자 링크만 포함됩니다.

2026-07-14 Resend 대시보드 확인 기준 상태는 `Not Started`이며 Tokyo 리전이 요구하는 공개 DNS 항목은 다음과 같습니다. DKIM 본문은 회전될 수 있으므로 전환 직전에 Resend 화면의 값과 다시 대조합니다.

- `TXT` `resend._domainkey`: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRIFIfDx4Y0TEw5GdP/5Ywgspp6FDvmWjNQV1ct7OXBKCiOu7BfZ73vK/0UEC4gryB6F/WZ7P+nRdC7VQmaFMPSDRxJBsKPrcSxIf7KmaMQ7GbaRZi4D+SBDEWl7TO3rGD3g9rH15S8UrDRN8Fyhmy9wNtW4NJxPwCOPsTv2gpNwIDAQAB`
- `MX` `send`: `feedback-smtp.ap-northeast-1.amazonses.com`, priority `10`
- `TXT` `send`: `v=spf1 include:amazonses.com ~all`
- 선택 `TXT` `_dmarc`: `v=DMARC1; p=none;`

## 4. Vercel 환경 변수

`.env.example`의 모든 항목을 Preview와 Production에 각각 등록합니다. Production의 핵심 값은 다음과 같습니다.

```text
NEXT_PUBLIC_SITE_URL=https://wondesign.studio
RESEND_FROM_EMAIL=WDS <contact@wondesign.studio>
NEXT_PUBLIC_PUBLISH_MARKETING_CATNIP=false
```

- Supabase service role key, Resend key, HMAC secret와 cron secret는 서버 전용으로 유지합니다.
- `CONTACT_NOTIFICATION_TO`와 `CONTACT_CONFIRMATION_REPLY_TO`에는 승인된 내부 주소를 Vercel에서만 등록합니다.
- 현재 승인된 내부 주소는 `wondesign01@gmail.com`이며, 공개 Contact 페이지의 전화 대체 채널은 `010-3991-9389`입니다.
- `EMAIL_SUBJECT_PREFIX`는 Preview에서 `[PREVIEW] `, Production에서는 빈 값으로 둡니다.
- Hobby 배포에서는 이메일 재시도 cron을 매일 00:00 UTC에 실행합니다. 더 짧은 재시도 주기가 필요하면 Pro 전환 후 일정을 조정합니다.

2026-07-14 확인 기준 Preview와 Production에 각각 13개 환경변수가 등록되어 있습니다. Production은 Preview 값을 복제하되 `NEXT_PUBLIC_SITE_URL`을 `https://wondesign.studio`, `EMAIL_SUBJECT_PREFIX`를 빈 값으로 분리했으며, 복제 과정에서 비밀 값을 로컬 파일이나 로그에 출력하지 않았습니다.

## 5. Preview 검수

1. `npm run verify`를 통과합니다.
2. Preview에서 공개 경로, 모바일 메뉴, 404와 미공개 Work 상세 차단을 확인합니다.
3. 합성 데이터로 문의 1건을 제출합니다.
4. Supabase 저장, 내부 알림, 문의자 확인 메일과 관리자 상세를 확인합니다.
5. 메일 발송을 의도적으로 실패시켜 Admin 실패 표시, 수동 재큐잉과 cron 실패 상태를 확인합니다.
6. 개인정보 동의 전 GA4가 로드되지 않고, 동의 후 핵심 이벤트만 기록되는지 확인합니다.

## 6. GoDaddy·Vercel 도메인 전환

1. Vercel에 `wondesign.studio`와 `www.wondesign.studio`를 모두 추가합니다.
2. root를 Primary Domain으로 지정하고 `www`는 root로 영구 리디렉션합니다.
3. 현재 nameserver가 기존 호스팅을 가리키므로, GoDaddy 기본 DNS로 되돌릴 경우 기존 레코드를 먼저 재현합니다.
4. Vercel과 Resend 화면이 제시하는 DNS 값을 GoDaddy에 추가합니다. 대시보드가 제시하지 않은 값을 추정해 넣지 않습니다.
5. DNS 확인 후 HTTPS, root와 `www` 리디렉션, canonical, sitemap과 robots를 공개 URL에서 확인합니다.

아임웹 권한 DNS에서는 Resend용 임의 TXT·MX 레코드 편집 경로가 제공되지 않았습니다. 따라서 Resend 인증은 GoDaddy 기본 nameserver 전환, Vercel 레코드 설정과 같은 유지보수 창에서 함께 처리합니다.

2026-07-14 확인 기준 `wondesign.studio`와 `www.wondesign.studio`는 `wds-website` Vercel 프로젝트에 추가되었습니다. 권한 DNS는 아직 기존 값을 유지하므로 두 도메인의 Vercel 검증은 대기 중입니다. Vercel이 안내한 전환용 레코드는 root와 `www` 각각 `A 76.76.21.21`이며, 실제 변경은 Resend 레코드 준비와 출시 승인 뒤 한 번의 유지보수 창에서 진행합니다.

프로젝트 배포 보호는 custom domain을 제외한 표준 보호로 설정되어 있습니다. 따라서 `*.vercel.app` 생성 주소는 Vercel 로그인으로 보호되지만 DNS 검증이 끝난 `wondesign.studio`와 `www.wondesign.studio`는 공개됩니다.

## 7. 출시 후 확인

- Production 문의 1건을 제출하고 저장·양쪽 메일·관리자 상태 변경을 확인합니다.
- `/admin/inquiries`에서 이메일 최종 실패가 없는지 확인합니다.
- Vercel 함수 로그와 cron 실행 결과를 확인합니다.
- 24시간 뒤 문의, 인증, 분석과 주요 공개 경로를 다시 점검합니다.

## 롤백

- 화면·서버 오류: Vercel의 직전 정상 배포로 복구합니다.
- DNS 오류: 전환 전에 저장한 nameserver·DNS 레코드로 복구합니다.
- 문의 장애: 공개 폼을 비활성화하기 전에 저장된 문의와 outbox 상태를 보존하고, 관리자에서 실패 원인을 확인합니다.
- 고객 자산 승인 철회: 해당 Work 상세 공개 플래그를 끄고 재배포한 뒤 sitemap·공유 미리보기를 확인합니다.
