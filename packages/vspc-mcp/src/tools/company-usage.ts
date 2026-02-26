import { z } from "zod";
import { vspcFetch } from "../lib/vspc-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(500).default(100).describe("Maximum number of usage records to retrieve"),
  offset: z.number().min(0).default(0).describe("Number of usage records to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; offset: number }, auth) => {
  const { limit = 100, offset = 0 } = params;
  const response = await vspcFetch(auth, `/api/v3/organizations/companies/usage?limit=${limit}&offset=${offset}`);
  const data = (await response.json()) as {
    meta: { pagingInfo: { total: number; count: number; offset: number } };
    data: Array<Record<string, unknown>>;
  };

  const paging = data.meta?.pagingInfo ?? { total: 0, count: 0, offset: 0 };

  return toolSuccess({
    summary: `Retrieved ${paging.count} company usage records out of ${paging.total} total (offset ${paging.offset})`,
    usage: data.data,
    pagination: paging,
  });
});
