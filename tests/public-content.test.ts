import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ client: vi.fn(), demo: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ getSupabaseServiceClient: mocks.client }));
vi.mock("@/lib/content/demo", () => ({ isDemoPreview: mocks.demo }));

import { getPublishedProject, listPublishedProjects } from "@/lib/content/public";

function queryResult(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (resolve: (result: unknown) => unknown) => Promise.resolve({ data, error }).then(resolve),
  };
  return query;
}

describe("public portfolio publication boundary", () => {
  beforeEach(() => mocks.demo.mockReturnValue(false));
  afterEach(() => vi.clearAllMocks());

  it("keeps an intentionally empty published list empty", async () => {
    const query = queryResult([]);
    mocks.client.mockReturnValue({ from: () => query });
    expect(await listPublishedProjects()).toEqual([]);
    expect(query.eq).toHaveBeenCalledWith("is_published", true);
  });

  it("never resurrects seed projects on a database failure", async () => {
    mocks.client.mockReturnValue({ from: () => queryResult(null, { code: "unavailable" }) });
    expect(await listPublishedProjects()).toEqual([]);
    expect(await getPublishedProject("marketing-catnip")).toBeUndefined();
  });

  it("fails closed when the service is not configured", async () => {
    mocks.client.mockImplementation(() => { throw new Error("not configured"); });
    expect(await listPublishedProjects()).toEqual([]);
  });

  it("retains explicit local demo previews without querying production data", async () => {
    mocks.demo.mockReturnValue(true);
    const projects = await listPublishedProjects();
    expect(projects).toHaveLength(3);
    expect(projects.every((project) => project.media.length === 3)).toBe(true);
    expect(mocks.client).not.toHaveBeenCalled();
  });
});
