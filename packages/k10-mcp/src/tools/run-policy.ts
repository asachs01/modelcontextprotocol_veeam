import { z } from "zod";
import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  policyName: z.string().describe("Name of the K10 policy to run"),
};

export async function handler(params: { policyName: string }): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const runAction = {
      apiVersion: "actions.kio.kasten.io/v1alpha1",
      kind: "RunAction",
      metadata: {
        generateName: "run-" + params.policyName + "-",
        namespace,
      },
      spec: {
        subject: {
          apiVersion: "config.kio.kasten.io/v1alpha1",
          kind: "Policy",
          name: params.policyName,
          namespace,
        },
      },
    };

    const response = await api.createNamespacedCustomObject({
      group: "actions.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: "runactions",
      body: runAction,
    });
    const result = response as Record<string, unknown>;
    const metadata = result.metadata as Record<string, unknown> | undefined;

    return toolSuccess({
      summary: `Policy run initiated for "${params.policyName}"`,
      actionName: metadata?.name,
      action: result,
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
