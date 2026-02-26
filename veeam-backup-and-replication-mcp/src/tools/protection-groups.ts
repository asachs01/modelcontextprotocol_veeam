import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(200).describe("Maximum number of protection groups to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of protection groups to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 200, skip = 0 } = params;
  const response = await vbrFetch(
    auth,
    `/api/v1/agents/protectionGroups?limit=${limit}&skip=${skip}`,
  );
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: unknown[];
  };

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} protection groups out of ${data.pagination.total} total`,
    protectionGroups: data.data,
    pagination: data.pagination,
  });
});
