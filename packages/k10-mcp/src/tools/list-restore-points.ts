import { z } from "zod";
import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  applicationName: z
    .string()
    .describe("Filter restore points by application name")
    .optional(),
};

export async function handler(params: {
  applicationName?: string;
}): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const response = await api.listNamespacedCustomObject({
      group: "apps.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: "restorepoints",
    });
    const body = response as { items: Array<Record<string, unknown>> };
    let items = body.items || [];

    // Filter by application label if provided
    if (params.applicationName) {
      items = items.filter((item) => {
        const metadata = item.metadata as Record<string, unknown> | undefined;
        const labels = metadata?.labels as Record<string, string> | undefined;
        return labels?.["k10.kasten.io/appName"] === params.applicationName;
      });
    }

    return toolSuccess({
      summary: `Found ${items.length} restore point(s)${params.applicationName ? ` for application "${params.applicationName}"` : ""}`,
      restorePoints: items.map((item) => {
        const metadata = item.metadata as Record<string, unknown> | undefined;
        const spec = item.spec as Record<string, unknown> | undefined;
        return {
          name: metadata?.name,
          namespace: metadata?.namespace,
          creationTimestamp: metadata?.creationTimestamp,
          application: spec?.application,
        };
      }),
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
