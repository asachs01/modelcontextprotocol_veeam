import { z } from "zod";
import { vroFetch } from "../lib/vro-client.js";
import { withAuth, toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  id: z.string().describe("Plan ID to trigger failback for"),
  confirm: z.boolean().describe("You MUST set this to true to confirm the destructive failback operation"),
};

export const handler = withAuth(
  async (params: { id: string; confirm: boolean }, auth): Promise<ToolResponse> => {
    if (params.confirm !== true) {
      return toolError(
        "Failback is a destructive operation. Set confirm=true to proceed.",
      );
    }

    const response = await vroFetch(auth, `/api/v7.21/Plans/${params.id}/FailbackToProduction`, {
      method: "POST",
    });

    let resultText = "Failback to production triggered successfully.";
    try {
      const body = await response.text();
      if (body) resultText += "\nResponse: " + body;
    } catch {
      // Ignore body parse error
    }

    return toolSuccess(resultText);
  },
);
