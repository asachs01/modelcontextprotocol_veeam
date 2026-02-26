import { z } from "zod";
import { voneFetch } from "../lib/vone-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(100).describe("Maximum number of alarm templates to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of alarm templates to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 100, skip = 0 } = params;
  const response = await voneFetch(auth, `/api/v2/alarms?limit=${limit}&skip=${skip}`);
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: Array<Record<string, unknown>>;
  };

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} alarm templates out of ${data.pagination.total} total`,
    alarmTemplates: data.data,
    pagination: data.pagination,
  });
});
