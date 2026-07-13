# Contact 관리자 운영

## 관리자 접근

- Supabase Auth에서 Google provider와 운영 도메인의 callback URL을 설정합니다.
- migration 적용 후 승인할 Google 계정을 `private.admin_allowlist`에 소문자 이메일로 등록합니다.
- RLS는 허용 이메일과 Google provider가 모두 확인된 세션만 통과시킵니다. 이메일·OTP 등 다른 provider 세션은 같은 이메일이어도 관리자 권한을 얻지 못합니다.

```sql
insert into private.admin_allowlist (email)
values (lower('<approved-admin-email>'))
on conflict (email) do update set enabled = true;
```

## 이메일 실패 대응

1. 이메일은 최대 5회 시도하며 5분, 15분, 1시간, 6시간 간격으로 재시도합니다.
2. 최종 실패가 하나라도 남으면 `/api/cron/email-retry`는 HTTP 500과 `unresolvedFailed` 수를 반환하고 구조화 로그를 남깁니다.
3. Admin 문의 목록의 `이메일 실패` 표시에서 대상 문의를 열고, 오류 코드와 Resend 도메인·API 키·수신 주소를 확인합니다.
4. 설정을 복구한 뒤 상세 화면의 `다시 시도`를 누릅니다. 관리자 RLS를 통과한 요청만 실패 건을 재큐잉할 수 있으며, 시도 횟수는 0으로 초기화됩니다.
5. 다음 cron 실행 후 두 이메일이 `sent`인지 확인합니다. 실패 건이 남아 있는 동안 cron의 non-2xx를 정상으로 간주하지 않습니다.

## 보관과 전환

- 문의 원본은 상태와 관계없이 접수 시각부터 12개월 후 자동 삭제됩니다.
- `converted`로 변경하려면 먼저 필요한 정보를 별도 고객기록으로 이관하고 참조값을 기록해야 합니다.
- 전환 후에도 문의 원본의 자동 삭제일은 연장되지 않습니다. 장기 보관이 필요한 고객 정보는 별도 고객기록의 정책으로 관리합니다.
- 운영자가 즉시 삭제하면 연결된 이메일 delivery 상태도 함께 삭제됩니다.
