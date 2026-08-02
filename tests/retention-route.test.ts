import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAuthorizedCronRequest: vi.fn(() => true),
  purgeExpiredInquiries: vi.fn(),
  purgeExpiredRateLimits: vi.fn(),
  purgeExpiredCronRuns: vi.fn(),
  startCronRun: vi.fn(),
  completeCronRun: vi.fn(),
}));

vi.mock("@/lib/auth/cron", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/cron")>(
    "@/lib/auth/cron",
  );
  return {
    ...actual,
    isAuthorizedCronRequest: mocks.isAuthorizedCronRequest,
  };
});

vi.mock("@/lib/contact/repository", () => ({
  purgeExpiredInquiries: mocks.purgeExpiredInquiries,
  purgeExpiredRateLimits: mocks.purgeExpiredRateLimits,
}));

vi.mock("@/lib/operations/cron-runs", () => ({
  purgeExpiredCronRuns: mocks.purgeExpiredCronRuns,
  startCronRun: mocks.startCronRun,
  completeCronRun: mocks.completeCronRun,
}));

import { GET } from "@/app/api/cron/retention/route";

describe("retention cron", () => {
  beforeEach(() => {
    mocks.isAuthorizedCronRequest.mockReturnValue(true);
    mocks.purgeExpiredInquiries.mockResolvedValue(2);
    mocks.purgeExpiredRateLimits.mockResolvedValue(3);
    mocks.purgeExpiredCronRuns.mockResolvedValue(4);
    mocks.startCronRun.mockResolvedValue(21);
    mocks.completeCronRun.mockResolvedValue(undefined);
  });

  it("보관 기한이 지난 데이터와 Cron 실행 기록을 정리한다", async () => {
    const response = await GET(new Request("https://example.com/api/cron/retention"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      deletedInquiries: 2,
      deletedRateLimitRows: 3,
      deletedCronRuns: 4,
    });
    expect(mocks.completeCronRun).toHaveBeenCalledWith(
      21,
      "retention",
      "succeeded",
      200,
      {
        deletedInquiries: 2,
        deletedRateLimitRows: 3,
        deletedCronRuns: 4,
      },
    );
  });

  it("인증되지 않은 요청은 실행 기록도 생성하지 않는다", async () => {
    mocks.isAuthorizedCronRequest.mockReturnValue(false);

    const response = await GET(new Request("https://example.com/api/cron/retention"));

    expect(response.status).toBe(401);
    expect(mocks.startCronRun).not.toHaveBeenCalled();
    expect(mocks.purgeExpiredInquiries).not.toHaveBeenCalled();
  });
});
