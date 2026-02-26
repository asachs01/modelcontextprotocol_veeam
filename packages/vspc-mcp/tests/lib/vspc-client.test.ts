import { describe, it, expect, vi, beforeEach } from "vitest";
import { vspcFetch } from "../../src/lib/vspc-client.js";

describe("vspc-client", () => {
  const mockAuth = { host: "vspc.example.com", token: "test-token-123" };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("constructs correct URL with host and port 1280", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vspcFetch(mockAuth, "/api/v3/organizations/companies");

    expect(fetch).toHaveBeenCalledWith(
      "https://vspc.example.com:1280/api/v3/organizations/companies",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token-123",
          "x-client-version": "3.6",
          accept: "application/json",
        }),
      }),
    );
  });

  it("throws on non-ok response", async () => {
    const mockResponse = new Response("Not Found", { status: 404, statusText: "Not Found" });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(vspcFetch(mockAuth, "/api/v3/missing")).rejects.toThrow("VSPC API error 404");
  });

  it("supports custom method and headers", async () => {
    const mockResponse = new Response("", { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await vspcFetch(mockAuth, "/api/v3/organizations/companies", {
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
