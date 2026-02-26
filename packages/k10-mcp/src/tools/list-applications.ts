import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {};

export async function handler(_params: Record<string, never>): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const response = await api.listNamespacedCustomObject({
      group: "apps.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: "applications",
    });
    const body = response as { items: Array<Record<string, unknown>> };
    const items = body.items || [];

    return toolSuccess({
      summary: `Found ${items.length} application(s) in namespace "${namespace}"`,
      applications: items.map((item) => {
        const metadata = item.metadata as Record<string, unknown> | undefined;
        const status = item.status as Record<string, unknown> | undefined;
        return {
          name: metadata?.name,
          namespace: metadata?.namespace,
          status: status?.status,
        };
      }),
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
