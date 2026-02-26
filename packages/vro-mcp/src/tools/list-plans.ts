import { z } from "zod";
import { vroFetch } from "../lib/vro-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(100).describe("Maximum number of plans to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of plans to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 100, skip = 0 } = params;
  const response = await vroFetch(auth, `/api/v7.21/Plans?limit=${limit}&skip=${skip}`);
  const data = (await response.json()) as {
    pagination?: { total: number; count: number };
    data?: Array<Record<string, unknown>>;
  };

  const plans = data.data ?? [];
  const total = data.pagination?.total ?? plans.length;
  const count = data.pagination?.count ?? plans.length;

  return toolSuccess({
    summary: `Retrieved ${count} plans out of ${total} total`,
    plans,
    pagination: data.pagination ?? { total, count },
  });
});
