import * as k8s from "@kubernetes/client-node";

let customObjectsApi: k8s.CustomObjectsApi | null = null;
let currentNamespace = "kasten-io";

export function getK10Client(): {
  api: k8s.CustomObjectsApi;
  namespace: string;
} {
  if (!customObjectsApi) {
    throw new Error("Not authenticated. Please call auth-k10 tool first.");
  }
  return { api: customObjectsApi, namespace: currentNamespace };
}

export function initK10Client(
  kubeconfigPath?: string,
  context?: string,
  namespace?: string,
): string {
  const kc = new k8s.KubeConfig();

  if (kubeconfigPath) {
    kc.loadFromFile(kubeconfigPath);
  } else {
    kc.loadFromDefault();
  }

  if (context) {
    kc.setCurrentContext(context);
  }

  currentNamespace = namespace || "kasten-io";
  customObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);

  const cluster = kc.getCurrentCluster();
  return cluster?.server || "unknown";
}

/** Reset client state (used in tests) */
export function resetK10Client(): void {
  customObjectsApi = null;
  currentNamespace = "kasten-io";
}
