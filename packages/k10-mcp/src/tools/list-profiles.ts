import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {};

export async function handler(_params: Record<string, never>): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const response = await api.listNamespacedCustomObject({
      group: "config.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: "profiles",
    });
    const body = response as { items: Array<Record<string, unknown>> };
    const items = body.items || [];

    return toolSuccess({
      summary: `Found ${items.length} location profile(s) in namespace "${namespace}"`,
      profiles: items.map((item) => {
        const metadata = item.metadata as Record<string, unknown> | undefined;
        const spec = item.spec as Record<string, unknown> | undefined;
        return {
          name: metadata?.name,
          namespace: metadata?.namespace,
          type: spec?.type,
          locationSpec: spec?.locationSpec,
        };
      }),
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
