import { getK10Client } from "../lib/k10-client.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {};

export async function handler(_params: Record<string, never>): Promise<ToolResponse> {
  try {
    const { api, namespace } = getK10Client();

    const response = await api.listNamespacedCustomObject({
      group: "reporting.kio.kasten.io",
      version: "v1alpha1",
      namespace,
      plural: "compliancereports",
    });
    const body = response as { items: Array<Record<string, unknown>> };
    const items = body.items || [];

    if (items.length === 0) {
      return toolSuccess({ summary: "No compliance reports found", report: null });
    }

    // Return the latest report (last in list)
    const latest = items[items.length - 1];
    const metadata = latest.metadata as Record<string, unknown> | undefined;

    return toolSuccess({
      summary: `Latest compliance report: ${metadata?.name || "unknown"}`,
      report: latest,
    });
  } catch (error) {
    return toolError(error instanceof Error ? error.message : String(error));
  }
}
