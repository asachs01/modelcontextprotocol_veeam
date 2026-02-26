import { describe, it, expect, vi, beforeEach } from "vitest";
import { vroFetch } from "../../src/lib/vro-client.js";

describe("vro-client", () => {
  const mockAuth = { host: "vro.example.com", token: "test-token-123" };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("constructs correct URL with host and port 9898", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vroFetch(mockAuth, "/api/v7.21/Plans");

    expect(fetch).toHaveBeenCalledWith(
      "https://vro.example.com:9898/api/v7.21/Plans",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token-123",
          accept: "application/json",
        }),
      }),
    );
  });

  it("does not include a version header", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vroFetch(mockAuth, "/api/v7.21/Plans");

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const options = callArgs[1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers["x-api-version"]).toBeUndefined();
  });

  it("throws on non-ok response", async () => {
    const mockResponse = new Response("Not Found", { status: 404, statusText: "Not Found" });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(vroFetch(mockAuth, "/api/v7.21/missing")).rejects.toThrow("VRO API error 404");
  });

  it("supports custom method and headers", async () => {
    const mockResponse = new Response("", { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vroFetch(mockAuth, "/api/v7.21/Plans/123/Failover", {
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
