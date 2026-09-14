import { afterEach, describe, expect, it, vi } from "vitest";
import { isDemoPreview } from "@/lib/content/demo";

afterEach(() => vi.unstubAllEnvs());

describe("demo preview isolation", () => {
  it("never enables demo assets in production even with the flag set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WDS_DEMO_PREVIEW", "1");
    expect(isDemoPreview()).toBe(false);
  });
  it("requires explicit opt-in in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("WDS_DEMO_PREVIEW", "");
    expect(isDemoPreview()).toBe(false);
    vi.stubEnv("WDS_DEMO_PREVIEW", "1");
    expect(isDemoPreview()).toBe(true);
  });
});
