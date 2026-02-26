import { z } from "zod";
import { voneFetch } from "../lib/vone-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  alarmIds: z.array(z.string()).describe("Array of triggered alarm IDs to resolve"),
};

export const handler = withAuth(async (params: { alarmIds: string[] }, auth) => {
  const { alarmIds } = params;
  const response = await voneFetch(auth, "/api/v2/alarms/triggered/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alarmIds }),
  });

  // Some APIs return 204 No Content on success
  if (response.status === 204) {
    return toolSuccess({
      summary: `Successfully resolved ${alarmIds.length} alarm(s)`,
      resolvedIds: alarmIds,
    });
  }

  const data = await response.json();
  return toolSuccess({
    summary: `Successfully resolved ${alarmIds.length} alarm(s)`,
    resolvedIds: alarmIds,
    response: data,
  });
});
