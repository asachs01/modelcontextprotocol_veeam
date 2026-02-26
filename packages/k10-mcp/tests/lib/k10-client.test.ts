import { describe, it, expect, vi, beforeEach } from "vitest";
import * as k8s from "@kubernetes/client-node";

vi.mock("@kubernetes/client-node", () => ({
  KubeConfig: vi.fn(),
  CustomObjectsApi: vi.fn(),
}));

import { initK10Client, getK10Client, resetK10Client } from "../../src/lib/k10-client.js";

function setupKubeConfigMock(clusterServer: string | null = "https://k8s.example.com") {
  vi.mocked(k8s.KubeConfig).mockImplementation(
    () =>
      ({
        loadFromDefault: vi.fn(),
        loadFromFile: vi.fn(),
        setCurrentContext: vi.fn(),
        getCurrentCluster: vi.fn().mockReturnValue(
          clusterServer ? { server: clusterServer } : null,
        ),
        makeApiClient: vi.fn().mockReturnValue({}),
      }) as unknown as k8s.KubeConfig,
  );
}

describe("k10-client", () => {
  beforeEach(() => {
    resetK10Client();
    vi.clearAllMocks();
    setupKubeConfigMock();
  });

  it("throws when not initialized", () => {
    expect(() => getK10Client()).toThrow("Not authenticated");
  });

  it("initializes with default kubeconfig", () => {
    const server = initK10Client();
    expect(server).toBe("https://k8s.example.com");

    const client = getK10Client();
    expect(client.api).toBeDefined();
    expect(client.namespace).toBe("kasten-io");
  });

  it("initializes with custom kubeconfig path", () => {
    const server = initK10Client("/path/to/kubeconfig");
    expect(server).toBe("https://k8s.example.com");
  });

  it("initializes with custom context and namespace", () => {
    initK10Client(undefined, "my-context", "custom-ns");
    const client = getK10Client();
    expect(client.namespace).toBe("custom-ns");
  });

  it("returns 'unknown' when cluster server is not available", () => {
    setupKubeConfigMock(null);
    const server = initK10Client();
    expect(server).toBe("unknown");
  });
});
