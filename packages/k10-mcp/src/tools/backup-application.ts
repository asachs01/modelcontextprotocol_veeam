import { z } from "zod";
import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  applicationName: z.string().describe("Name of the K10 application to back up"),
};

export async function handler(params: { applicationName: string }): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const backupAction = {
      apiVersion: "actions.kio.kasten.io/v1alpha1",
      kind: "BackupAction",
      metadata: {
        generateName: "backup-" + params.applicationName + "-",
        namespace,
      },
      spec: {
        subject: {
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
      plural: "backupactions",
      body: backupAction,
    });
    const result = response as Record<string, unknown>;
    const metadata = result.metadata as Record<string, unknown> | undefined;

    return toolSuccess({
      summary: `Backup initiated for application "${params.applicationName}"`,
      actionName: metadata?.name,
      action: result,
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
