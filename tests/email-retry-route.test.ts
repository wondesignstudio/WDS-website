import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAuthorizedCronRequest: vi.fn(() => true),
  processPendingEmailDeliveries: vi.fn(),
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

vi.mock("@/lib/email/outbox", () => ({
  processPendingEmailDeliveries: mocks.processPendingEmailDeliveries,
}));

vi.mock("@/lib/operations/cron-runs", () => ({
  startCronRun: mocks.startCronRun,
  completeCronRun: mocks.completeCronRun,
}));

import { GET } from "@/app/api/cron/email-retry/route";

const successResult = {
  claimed: 0,
  sent: 0,
  retryScheduled: 0,
  terminalFailed: 0,
  stateUpdateFailed: 0,
  unresolvedFailed: 0,
};

describe("email retry cron", () => {
  beforeEach(() => {
    mocks.isAuthorizedCronRequest.mockReturnValue(true);
    mocks.processPendingEmailDeliveries.mockResolvedValue(successResult);
    mocks.startCronRun.mockResolvedValue(12);
    mocks.completeCronRun.mockResolvedValue(undefined);
  });

  it("해결되지 않은 최종 실패가 없으면 성공한다", async () => {
    const response = await GET(new Request("https://example.com/api/cron/email-retry"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(mocks.completeCronRun).toHaveBeenCalledWith(
      12,
      "email_retry",
      "succeeded",
      200,
      successResult,
      null,
    );
  });

  it("최종 실패가 남아 있으면 non-2xx로 운영 실패를 드러낸다", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.processPendingEmailDeliveries.mockResolvedValue({
      ...successResult,
      unresolvedFailed: 1,
    });

    const response = await GET(new Request("https://example.com/api/cron/email-retry"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      unresolvedFailed: 1,
    });
    expect(errorLog).toHaveBeenCalledWith(
      "Email retry cron completed with unresolved failures",
      {
        unresolvedFailed: 1,
        stateUpdateFailed: 0,
        terminalFailed: 0,
      },
    );
  });

  it("cron secret이 유효하지 않으면 outbox를 실행하지 않는다", async () => {
    mocks.isAuthorizedCronRequest.mockReturnValue(false);

    const response = await GET(new Request("https://example.com/api/cron/email-retry"));

    expect(response.status).toBe(401);
    expect(mocks.processPendingEmailDeliveries).not.toHaveBeenCalled();
    expect(mocks.startCronRun).not.toHaveBeenCalled();
  });
});
