import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "../../src/tools/auth-tool.js";
import { clearAuth, getAuthOrNull } from "../../src/lib/auth-state.js";

vi.mock("../../src/lib/vspc-client.js", () => ({
  vspcAuthRequest: vi.fn(),
}));

import { vspcAuthRequest } from "../../src/lib/vspc-client.js";

describe("auth-tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("returns error when credentials are missing", async () => {
    delete process.env.VSPC_HOST;
    delete process.env.VSPC_USERNAME;
    delete process.env.VSPC_PASSWORD;

    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Missing credentials");
  });

  it("authenticates with provided params", async () => {
    vi.mocked(vspcAuthRequest).mockResolvedValue("mock-token");

    const result = await handler({
      host: "vspc.test.com",
      username: "admin",
      password: "pass123",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Authentication successful");
    expect(getAuthOrNull()?.host).toBe("vspc.test.com");
    expect(getAuthOrNull()?.token).toBe("mock-token");
  });

  it("returns error on auth failure", async () => {
    vi.mocked(vspcAuthRequest).mockRejectedValue(new Error("Connection refused"));

    const result = await handler({
      host: "bad-host",
      username: "admin",
      password: "pass",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Connection refused");
  });

  it("reads credentials from env vars", async () => {
    process.env.VSPC_HOST = "env-host";
    process.env.VSPC_USERNAME = "env-user";
    process.env.VSPC_PASSWORD = "env-pass";

    vi.mocked(vspcAuthRequest).mockResolvedValue("env-token");

    const result = await handler({});
    expect(result.isError).toBeUndefined();
    expect(vspcAuthRequest).toHaveBeenCalledWith("env-host", "env-user", "env-pass");

    delete process.env.VSPC_HOST;
    delete process.env.VSPC_USERNAME;
    delete process.env.VSPC_PASSWORD;
  });
});
