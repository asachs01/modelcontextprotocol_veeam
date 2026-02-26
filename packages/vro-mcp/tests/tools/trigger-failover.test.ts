import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/trigger-failover.js";
import { setAuth, clearAuth } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vro-client.js", () => ({
  vroFetch: vi.fn(),
}));

import { vroFetch } from "../../src/lib/vro-client.js";

describe("trigger-failover", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    const result = await handler({ id: "plan-1", confirm: true });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Not authenticated");
  });

  it("returns error when confirm is not true", async () => {
    setAuth({ host: "vro.test.com", token: "tok" });

    const result = await handler({ id: "plan-1", confirm: false });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Failover is a destructive operation");
  });

  it("triggers failover when authenticated and confirmed", async () => {
    setAuth({ host: "vro.test.com", token: "tok" });

    const mockResponse = new Response("", { status: 200 });
    vi.mocked(vroFetch).mockResolvedValue(mockResponse);

    const result = await handler({ id: "plan-1", confirm: true });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Failover triggered successfully");
    expect(vroFetch).toHaveBeenCalledWith(
      { host: "vro.test.com", token: "tok" },
      "/api/v7.21/Plans/plan-1/Failover",
      { method: "POST" },
    );
  });
});
