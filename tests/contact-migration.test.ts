import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/202607100001_contact_admin.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contact admin migration security contracts", () => {
  it("Google provider와 허용 이메일을 모두 관리자 조건으로 요구한다", () => {
    const isAdminFunction = migration.match(
      /create or replace function private\.is_admin\(\)[\s\S]*?\$\$;/,
    )?.[0];

    expect(isAdminFunction).toBeDefined();
    expect(isAdminFunction).toContain("allowed.email");
    expect(isAdminFunction).toContain("'app_metadata'");
    expect(isAdminFunction).toContain("'providers'");
    expect(isAdminFunction).toContain("'google'");
  });

  it("실패 이메일 재큐잉을 관리자에게만 허용한다", () => {
    const requeueFunction = migration.match(
      /create or replace function public\.requeue_failed_email_deliveries\([\s\S]*?\$\$;/,
    )?.[0];

    expect(requeueFunction).toBeDefined();
    expect(requeueFunction).toContain("if not private.is_admin()");
    expect(requeueFunction).toContain("delivery.status = 'failed'");
    expect(migration).toContain(
      "grant execute on function public.requeue_failed_email_deliveries(uuid) to authenticated;",
    );
  });

  it("전환 전 이관을 강제하고 문의 원본 삭제일은 접수 후 12개월로 유지한다", () => {
    expect(migration).toContain(
      "new.purge_after := new.created_at + interval '12 months';",
    );
    expect(migration).toContain("new.purge_after := old.purge_after;");
    expect(migration).toContain(
      "raise exception 'customer record transfer is required before conversion';",
    );

    const purgeFunction = migration.match(
      /create or replace function public\.purge_expired_inquiries\(\)[\s\S]*?\$\$;/,
    )?.[0];
    expect(purgeFunction).toContain("where purge_after <= now()");
  });

  it("프로젝트 배경의 DB 최소 길이는 20자다", () => {
    expect(migration).toContain(
      "check (char_length(btrim(project_background)) between 20 and 5000)",
    );
  });
});
