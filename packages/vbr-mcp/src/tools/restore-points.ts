import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  id: z.string().uuid().describe("Backup object ID. To get the ID, run the get-backup-objects tool."),
  limit: z.number().min(1).max(1000).default(200).describe("Maximum number of restore points to return"),
  skip: z.number().min(0).default(0).describe("Number of restore points to skip"),
  createdAfterFilter: z.string().optional().describe("Returns restore points created after this date-time"),
  createdBeforeFilter: z.string().optional().describe("Returns restore points created before this date-time"),
  nameFilter: z.string().optional().describe("Filter by name pattern (supports *)"),
  orderBy: z.string().optional().describe("Column to sort by"),
  orderAsc: z.boolean().default(true).describe("Sort ascending"),
};

interface RestorePointParams {
  id: string;
  limit: number;
  skip: number;
  createdAfterFilter?: string;
  createdBeforeFilter?: string;
  nameFilter?: string;
  orderBy?: string;
  orderAsc: boolean;
}

export const handler = withAuth(async (params: RestorePointParams, auth) => {
  const { id, limit = 200, skip = 0, ...filters } = params;

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
  });

  if (filters.createdAfterFilter) queryParams.append("createdAfterFilter", filters.createdAfterFilter);
  if (filters.createdBeforeFilter) queryParams.append("createdBeforeFilter", filters.createdBeforeFilter);
  if (filters.nameFilter) queryParams.append("nameFilter", filters.nameFilter);
  if (filters.orderBy) {
    queryParams.append("orderColumn", filters.orderBy);
    queryParams.append("orderAsc", filters.orderAsc.toString());
  }

  const response = await vbrFetch(
    auth,
    `/api/v1/backupObjects/${id}/restorePoints?${queryParams.toString()}`,
  );
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: Array<Record<string, unknown>>;
  };

  // Fetch backup details for enrichment
  const backupIds = [...new Set(data.data.map((rp) => rp.backupId as string).filter(Boolean))];
  const backupDetailsMap = new Map<string, { jobName: string; repositoryName: string }>();

  await Promise.all(
    backupIds.map(async (backupId) => {
      try {
        const backupResponse = await vbrFetch(auth, `/api/v1/backups/${backupId}`);
        const backupData = (await backupResponse.json()) as { name: string; repositoryName: string };
        backupDetailsMap.set(backupId, {
          jobName: backupData.name,
          repositoryName: backupData.repositoryName,
        });
      } catch {
        // Ignore errors for individual backup fetches
      }
    }),
  );

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} restore points out of ${data.pagination.total} total`,
    restorePoints: data.data.map((rp) => {
      const details = backupDetailsMap.get(rp.backupId as string) || {};
      return {
        creationTime: rp.creationTime,
        type: rp.type,
        jobName: (details as Record<string, unknown>).jobName || "Unknown",
        repositoryName: (details as Record<string, unknown>).repositoryName || "Unknown",
        allowedOperations: rp.allowedOperations,
        id: rp.id,
        name: rp.name,
        platformName: rp.platformName,
        backupId: rp.backupId,
      };
    }),
    pagination: data.pagination,
  });
});
