import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient } from "../src/api-client.js";

describe("api-client", () => {
  const config = {
    port: 9419,
    tokenPath: "/api/oauth2/token",
    versionHeader: "x-api-version",
    versionValue: "1.3-rev1",
    rejectUnauthorizedEnvVar: "TEST_REJECT_UNAUTHORIZED",
    productName: "TestProduct",
  };

  const mockAuth = { host: "server.example.com", token: "test-token-123" };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("apiFetch constructs correct URL with port", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const client = createApiClient(config);
    await client.apiFetch(mockAuth, "/api/v1/serverInfo");

    expect(fetch).toHaveBeenCalledWith(
      "https://server.example.com:9419/api/v1/serverInfo",
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

  it("apiFetch throws on non-ok response", async () => {
    const mockResponse = new Response("Not Found", { status: 404, statusText: "Not Found" });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const client = createApiClient(config);
    await expect(client.apiFetch(mockAuth, "/api/v1/missing")).rejects.toThrow(
      "TestProduct API error 404",
    );
  });

  it("apiFetch omits version header when not configured", async () => {
    const mockResponse = new Response("{}", { status: 200 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const noVersionConfig = { ...config, versionHeader: undefined, versionValue: undefined };
    const client = createApiClient(noVersionConfig);
    await client.apiFetch(mockAuth, "/api/v2/test");

    const callHeaders = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(callHeaders["x-api-version"]).toBeUndefined();
  });

  it("authRequest posts credentials to token endpoint", async () => {
    const mockResponse = new Response(JSON.stringify({ access_token: "new-token" }), {
      status: 200,
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const client = createApiClient(config);
    const token = await client.authRequest("server.example.com", "admin", "pass123");

    expect(token).toBe("new-token");
    expect(fetch).toHaveBeenCalledWith(
      "https://server.example.com:9419/api/oauth2/token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }),
    );
  });

  it("authRequest throws on failure", async () => {
    const mockResponse = new Response("Unauthorized", { status: 401, statusText: "Unauthorized" });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const client = createApiClient(config);
    await expect(
      client.authRequest("server.example.com", "admin", "wrong"),
    ).rejects.toThrow("Authentication failed");
  });
});
