import { describe, it, expect, vi, beforeEach } from "vitest";
import { vbrFetch } from "../../src/lib/vbr-client.js";

describe("vbr-client", () => {
  const mockAuth = { host: "vbr.example.com", token: "test-token-123" };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("constructs correct URL with host and path", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vbrFetch(mockAuth, "/api/v1/serverInfo");

    expect(fetch).toHaveBeenCalledWith(
      "https://vbr.example.com:9419/api/v1/serverInfo",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token-123",
          "x-api-version": "1.3-rev1",
          accept: "application/json",
        }),
      }),
    );
  });

  it("throws on non-ok response", async () => {
    const mockResponse = new Response("Not Found", { status: 404, statusText: "Not Found" });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(vbrFetch(mockAuth, "/api/v1/missing")).rejects.toThrow("VBR API error 404");
  });

  it("supports custom method and headers", async () => {
    const mockResponse = new Response("", { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vbrFetch(mockAuth, "/api/v1/configBackup/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
