import { describe, it, expect, vi, beforeEach } from "vitest";
import { voneFetch } from "../../src/lib/vone-client.js";

describe("vone-client", () => {
  const mockAuth = { host: "vone.example.com", token: "test-token-123" };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("constructs correct URL with host and port 1239", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await voneFetch(mockAuth, "/api/v2/about");

    expect(fetch).toHaveBeenCalledWith(
      "https://vone.example.com:1239/api/v2/about",
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

    await voneFetch(mockAuth, "/api/v2/about");

    const callArgs = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    const headers = callArgs.headers as Record<string, string>;
    expect(headers["x-api-version"]).toBeUndefined();
  });

  it("throws on non-ok response", async () => {
    const mockResponse = new Response("Not Found", { status: 404, statusText: "Not Found" });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(voneFetch(mockAuth, "/api/v2/missing")).rejects.toThrow("Veeam ONE API error 404");
  });

  it("supports custom method and headers", async () => {
    const mockResponse = new Response("", { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await voneFetch(mockAuth, "/api/v2/alarms/triggered/resolve", {
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
