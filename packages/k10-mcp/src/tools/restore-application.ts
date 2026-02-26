import { z } from "zod";
import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  restorePointName: z.string().describe("Name of the restore point to restore from"),
  applicationName: z.string().describe("Name of the target application to restore"),
};

export async function handler(params: {
  restorePointName: string;
  applicationName: string;
}): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const restoreAction = {
      apiVersion: "actions.kio.kasten.io/v1alpha1",
      kind: "RestoreAction",
      metadata: {
        generateName: "restore-" + params.applicationName + "-",
        namespace,
      },
      spec: {
        subject: {
          apiVersion: "apps.kio.kasten.io/v1alpha1",
          kind: "RestorePoint",
          name: params.restorePointName,
          namespace,
        },
        targetApplication: {
          apiVersion: "apps.kio.kasten.io/v1alpha1",
          kind: "Application",
          name: params.applicationName,
          namespace,
        },
      },
    };

    const response = await api.createNamespacedCustomObject({
      group: "actions.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: "restoreactions",
      body: restoreAction,
    });
    const result = response as Record<string, unknown>;
    const metadata = result.metadata as Record<string, unknown> | undefined;

    return toolSuccess({
      summary: `Restore initiated for application "${params.applicationName}" from restore point "${params.restorePointName}"`,
      actionName: metadata?.name,
      action: result,
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
