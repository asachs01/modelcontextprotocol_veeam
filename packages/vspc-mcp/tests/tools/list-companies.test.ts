import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/list-companies.js";
import { setAuth, clearAuth } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vspc-client.js", () => ({
  vspcFetch: vi.fn(),
}));

import { vspcFetch } from "../../src/lib/vspc-client.js";

describe("list-companies tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    const result = await handler({ limit: 100, offset: 0 });
    expect(result.isError).toBe(true);
  });

  it("returns formatted company list with offset pagination", async () => {
    setAuth({ host: "vspc.test.com", token: "token" });

    vi.mocked(vspcFetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          meta: { pagingInfo: { total: 2, count: 2, offset: 0 } },
          data: [
            { instanceUid: "uid-1", name: "Company A", status: "Active" },
            { instanceUid: "uid-2", name: "Company B", status: "Active" },
          ],
        }),
    } as unknown as Response);

    const result = await handler({ limit: 100, offset: 0 });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.summary).toContain("2 companies");
    expect(parsed.companies).toHaveLength(2);
    expect(parsed.companies[0].name).toBe("Company A");
    expect(parsed.pagination.total).toBe(2);
  });

  it("passes offset parameter to API", async () => {
    setAuth({ host: "vspc.test.com", token: "token" });

    vi.mocked(vspcFetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          meta: { pagingInfo: { total: 50, count: 10, offset: 20 } },
          data: [],
        }),
    } as unknown as Response);

    await handler({ limit: 10, offset: 20 });

    expect(vspcFetch).toHaveBeenCalledWith(
      expect.objectContaining({ host: "vspc.test.com" }),
      "/api/v3/organizations/companies?limit=10&offset=20",
    );
  });
});
