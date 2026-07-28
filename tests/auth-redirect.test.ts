import { describe, expect, it } from "vitest";

import { sanitizeAdminRedirect } from "@/lib/auth/redirect";

describe("sanitizeAdminRedirect", () => {
  it.each([
    "/admin",
    "/admin/",
    "/admin/inquiries",
    "/admin/inquiries?status=new",
    "/admin#content",
  ])("내부 관리자 경로 %s를 유지한다", (value) => {
    expect(sanitizeAdminRedirect(value)).toBe(value);
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example/admin",
    "//evil.example/admin",
    "/contact",
    "/admin\\evil.example",
    "/administrator",
  ])("위험하거나 범위 밖의 next 값(%s)은 /admin으로 되돌린다", (value) => {
    expect(sanitizeAdminRedirect(value)).toBe("/admin");
  });
});
