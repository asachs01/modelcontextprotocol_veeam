import { z } from "zod";
import { voneFetch } from "../lib/vone-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(200).describe("Maximum number of vSphere VMs to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of VMs to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 200, skip = 0 } = params;
  const response = await voneFetch(auth, `/api/v2/vSphere/vms?limit=${limit}&skip=${skip}`);
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: Array<Record<string, unknown>>;
  };

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} vSphere VMs out of ${data.pagination.total} total`,
    vms: data.data,
    pagination: data.pagination,
  });
});
