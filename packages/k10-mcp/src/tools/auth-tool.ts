import { z } from "zod";
import { initK10Client } from "../lib/k10-client.js";
import { setAuth } from "../lib/auth-state.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  kubeconfigPath: z
    .string()
    .describe("Path to kubeconfig file (falls back to K10_KUBECONFIG env, then default)")
    .optional(),
  context: z
    .string()
    .describe("Kubernetes context to use (falls back to K10_CONTEXT env)")
    .optional(),
  namespace: z
    .string()
    .describe("K10 namespace (falls back to K10_NAMESPACE env, then 'kasten-io')")
    .optional(),
};

export async function handler(params: {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
}): Promise<ToolResponse> {
  try {
    const kubeconfigPath = params.kubeconfigPath || process.env.K10_KUBECONFIG || undefined;
    const context = params.context || process.env.K10_CONTEXT || undefined;
    const namespace = params.namespace || process.env.K10_NAMESPACE || "kasten-io";

    const serverUrl = initK10Client(kubeconfigPath, context, namespace);
    setAuth({ host: serverUrl, token: "k8s" });

    return toolSuccess(
      `Authentication successful. Connected to Kubernetes cluster at ${serverUrl}. ` +
        `Using namespace "${namespace}" for K10 operations.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return toolError(`Authentication failed: ${message}`);
  }
}
