import { describe, it, expect, vi, beforeEach } from "vitest";

const mockListNamespacedCustomObject = vi.fn();

vi.mock("../../src/lib/k10-client.js", () => ({
  getK10Client: vi.fn().mockReturnValue({
    api: { listNamespacedCustomObject: (...args: unknown[]) => mockListNamespacedCustomObject(...args) },
    namespace: "kasten-io",
  }),
}));

import { handler } from "../../src/tools/list-applications.js";
import { getK10Client } from "../../src/lib/k10-client.js";

describe("list-applications tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getK10Client).mockReturnValue({
      api: { listNamespacedCustomObject: mockListNamespacedCustomObject } as never,
      namespace: "kasten-io",
    });
  });

  it("returns applications list", async () => {
    mockListNamespacedCustomObject.mockResolvedValue({
      items: [
        {
          metadata: { name: "my-app", namespace: "default" },
          status: { status: "Available" },
        },
        {
          metadata: { name: "another-app", namespace: "production" },
          status: { status: "Available" },
        },
      ],
    });

    const result = await handler({} as Record<string, never>);

    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.summary).toContain("2 application(s)");
    expect(parsed.applications).toHaveLength(2);
    expect(parsed.applications[0].name).toBe("my-app");
  });

  it("returns empty list when no applications", async () => {
    mockListNamespacedCustomObject.mockResolvedValue({ items: [] });

    const result = await handler({} as Record<string, never>);

    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.summary).toContain("0 application(s)");
    expect(parsed.applications).toHaveLength(0);
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(getK10Client).mockImplementation(() => {
      throw new Error("Not authenticated. Please call auth-k10 tool first.");
    });

    const result = await handler({} as Record<string, never>);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Not authenticated");
  });

  it("handles API errors", async () => {
    mockListNamespacedCustomObject.mockRejectedValue(new Error("Forbidden"));

    const result = await handler({} as Record<string, never>);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Forbidden");
  });
});
