import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/backup-objects.js";
import { setAuth, clearAuth } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vbr-client.js", () => ({
  vbrFetch: vi.fn(),
}));

import { vbrFetch } from "../../src/lib/vbr-client.js";

describe("backup-objects tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    const result = await handler({ limit: 200, skip: 0 });
    expect(result.isError).toBe(true);
  });

  it("returns formatted backup objects", async () => {
    setAuth({ host: "vbr.test.com", token: "token" });

    vi.mocked(vbrFetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          pagination: { total: 1, count: 1 },
          data: [
            {
              id: "abc-123",
              name: "VM-1",
              type: "VirtualMachine",
              platformName: "VMware",
              viType: "VmTask",
              restorePointsCount: 5,
              lastRunFailed: false,
            },
          ],
        }),
    } as unknown as Response);

    const result = await handler({ limit: 200, skip: 0 });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.summary).toContain("1 backup objects");
    expect(parsed.backupObjects).toHaveLength(1);
    expect(parsed.backupObjects[0].name).toBe("VM-1");
  });
});
