import { z } from "zod";
import { vroFetch } from "../lib/vro-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  id: z.string().describe("Plan ID to get runtime status for"),
};

export const handler = withAuth(async (params: { id: string }, auth) => {
  const response = await vroFetch(auth, `/api/v7.21/RuntimeDetails/Plans/${params.id}`);
  const data = await response.json();
  return toolSuccess(data);
});
