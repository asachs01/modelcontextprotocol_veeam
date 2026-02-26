import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/auth-tool.js";
import { clearAuth, getAuthOrNull } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vbr-client.js", () => ({
  vbrAuthRequest: vi.fn(),
}));

import { vbrAuthRequest } from "../../src/lib/vbr-client.js";

describe("auth-tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when credentials are missing", async () => {
    // Ensure env vars are not set
    delete process.env.VBR_HOST;
    delete process.env.VBR_USERNAME;
    delete process.env.VBR_PASSWORD;

    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Missing credentials");
  });

  it("authenticates with provided params", async () => {
    vi.mocked(vbrAuthRequest).mockResolvedValue("mock-token");

    const result = await handler({
      host: "vbr.test.com",
      username: ".\\admin",
      password: "pass123",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Authentication successful");
    expect(getAuthOrNull()?.host).toBe("vbr.test.com");
    expect(getAuthOrNull()?.token).toBe("mock-token");
  });

  it("returns error on auth failure", async () => {
    vi.mocked(vbrAuthRequest).mockRejectedValue(new Error("Connection refused"));

    const result = await handler({
      host: "bad-host",
      username: ".\\admin",
      password: "pass",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Connection refused");
  });

  it("reads credentials from env vars", async () => {
    process.env.VBR_HOST = "env-host";
    process.env.VBR_USERNAME = "env-user";
    process.env.VBR_PASSWORD = "env-pass";

    vi.mocked(vbrAuthRequest).mockResolvedValue("env-token");

    const result = await handler({});
    expect(result.isError).toBeUndefined();
    expect(vbrAuthRequest).toHaveBeenCalledWith("env-host", "env-user", "env-pass");

    delete process.env.VBR_HOST;
    delete process.env.VBR_USERNAME;
    delete process.env.VBR_PASSWORD;
  });
});
