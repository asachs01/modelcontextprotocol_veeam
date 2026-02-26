import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/auth-tool.js";
import { clearAuth, getAuthOrNull } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vro-client.js", () => ({
  vroAuthRequest: vi.fn(),
}));

import { vroAuthRequest } from "../../src/lib/vro-client.js";

describe("auth-tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when credentials are missing", async () => {
    delete process.env.VRO_HOST;
    delete process.env.VRO_USERNAME;
    delete process.env.VRO_PASSWORD;

    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Missing credentials");
  });

  it("authenticates with provided params", async () => {
    vi.mocked(vroAuthRequest).mockResolvedValue("mock-token");

    const result = await handler({
      host: "vro.test.com",
      username: "admin",
      password: "pass123",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Authentication successful");
    expect(getAuthOrNull()?.host).toBe("vro.test.com");
    expect(getAuthOrNull()?.token).toBe("mock-token");
  });

  it("returns error on auth failure", async () => {
    vi.mocked(vroAuthRequest).mockRejectedValue(new Error("Connection refused"));

    const result = await handler({
      host: "bad-host",
      username: "admin",
      password: "pass",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Connection refused");
  });

  it("reads credentials from env vars", async () => {
    process.env.VRO_HOST = "env-host";
    process.env.VRO_USERNAME = "env-user";
    process.env.VRO_PASSWORD = "env-pass";

    vi.mocked(vroAuthRequest).mockResolvedValue("env-token");

    const result = await handler({});
    expect(result.isError).toBeUndefined();
    expect(vroAuthRequest).toHaveBeenCalledWith("env-host", "env-user", "env-pass");

    delete process.env.VRO_HOST;
    delete process.env.VRO_USERNAME;
    delete process.env.VRO_PASSWORD;
  });
});
