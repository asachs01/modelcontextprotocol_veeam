import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(200).describe("Maximum number of backup objects to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of backup objects to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 200, skip = 0 } = params;
  const response = await vbrFetch(auth, `/api/v1/backupObjects?limit=${limit}&skip=${skip}`);
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: Array<Record<string, unknown>>;
  };

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} backup objects out of ${data.pagination.total} total`,
    backupObjects: data.data.map((obj) => ({
      id: obj.id,
      name: obj.name,
      type: obj.type,
      platformName: obj.platformName,
      viType: obj.viType,
      restorePointsCount: obj.restorePointsCount,
      lastRunFailed: obj.lastRunFailed,
    })),
    pagination: data.pagination,
  });
});
