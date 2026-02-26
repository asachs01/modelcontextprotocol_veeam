import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/server-info.js";
import { setAuth, clearAuth } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vbr-client.js", () => ({
  vbrFetch: vi.fn(),
}));

import { vbrFetch } from "../../src/lib/vbr-client.js";

describe("server-info tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Not authenticated");
  });

  it("returns server info when authenticated", async () => {
    setAuth({ host: "vbr.test.com", token: "token" });

    const mockData = { vbrVersion: "12.0.0", serverName: "VBR01" };
    vi.mocked(vbrFetch).mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as unknown as Response);

    const result = await handler({});
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("12.0.0");
    expect(result.content[0].text).toContain("VBR01");
  });
});
