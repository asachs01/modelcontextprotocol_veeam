import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/lib/k10-client.js", () => ({
  initK10Client: vi.fn(),
}));

import { handler } from "../../src/tools/auth-tool.js";
import { initK10Client } from "../../src/lib/k10-client.js";
import { clearAuth, getAuthOrNull } from "../../src/lib/auth-state.js";

describe("auth-k10 tool", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
    delete process.env.K10_KUBECONFIG;
    delete process.env.K10_CONTEXT;
    delete process.env.K10_NAMESPACE;
  });

  it("authenticates with default settings", async () => {
    vi.mocked(initK10Client).mockReturnValue("https://k8s.example.com");

    const result = await handler({});

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Authentication successful");
    expect(result.content[0].text).toContain("https://k8s.example.com");
    expect(getAuthOrNull()?.host).toBe("https://k8s.example.com");
    expect(getAuthOrNull()?.token).toBe("k8s");
  });

  it("authenticates with custom parameters", async () => {
    vi.mocked(initK10Client).mockReturnValue("https://custom-cluster.com");

    const result = await handler({
      kubeconfigPath: "/custom/kubeconfig",
      context: "my-context",
      namespace: "my-namespace",
    });

    expect(result.isError).toBeUndefined();
    expect(initK10Client).toHaveBeenCalledWith("/custom/kubeconfig", "my-context", "my-namespace");
  });

  it("reads settings from env vars", async () => {
    process.env.K10_KUBECONFIG = "/env/kubeconfig";
    process.env.K10_CONTEXT = "env-context";
    process.env.K10_NAMESPACE = "env-namespace";

    vi.mocked(initK10Client).mockReturnValue("https://env-cluster.com");

    const result = await handler({});

    expect(result.isError).toBeUndefined();
    expect(initK10Client).toHaveBeenCalledWith("/env/kubeconfig", "env-context", "env-namespace");
  });

  it("returns error on auth failure", async () => {
    vi.mocked(initK10Client).mockImplementation(() => {
      throw new Error("kubeconfig not found");
    });

    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("kubeconfig not found");
  });
});
