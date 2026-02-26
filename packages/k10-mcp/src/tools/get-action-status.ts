import { z } from "zod";
import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  actionName: z.string().describe("Name of the action to check"),
  actionType: z
    .enum(["runactions", "backupactions", "restoreactions"])
    .describe("Type of action to check"),
};

export async function handler(params: {
  actionName: string;
  actionType: "runactions" | "backupactions" | "restoreactions";
}): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const response = await api.getNamespacedCustomObject({
      group: "actions.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: params.actionType,
      name: params.actionName,
    });
    const result = response as Record<string, unknown>;
    const status = result.status as Record<string, unknown> | undefined;
    const metadata = result.metadata as Record<string, unknown> | undefined;

    return toolSuccess({
      summary: `Action "${params.actionName}" status: ${status?.state || "unknown"}`,
      name: metadata?.name,
      state: status?.state,
      action: result,
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
