import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/triggered-alarms.js";
import { setAuth, clearAuth } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vone-client.js", () => ({
  voneFetch: vi.fn(),
}));

import { voneFetch } from "../../src/lib/vone-client.js";

describe("triggered-alarms tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    const result = await handler({ limit: 100, skip: 0 });
    expect(result.isError).toBe(true);
  });

  it("returns formatted triggered alarms", async () => {
    setAuth({ host: "vone.test.com", token: "token" });

    vi.mocked(voneFetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          pagination: { total: 2, count: 2 },
          data: [
            { id: "alarm-1", name: "High CPU", severity: "Critical" },
            { id: "alarm-2", name: "Low Disk", severity: "Warning" },
          ],
        }),
    } as unknown as Response);

    const result = await handler({ limit: 100, skip: 0 });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.summary).toContain("2 triggered alarms");
    expect(parsed.alarms).toHaveLength(2);
    expect(parsed.alarms[0].name).toBe("High CPU");
  });
});
