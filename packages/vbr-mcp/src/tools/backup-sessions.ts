import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(100).describe("Maximum number of sessions to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of sessions to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 100, skip = 0 } = params;
  const response = await vbrFetch(
    auth,
    `/api/v1/sessions?limit=${limit}&skip=${skip}&typeFilter=BackupJob`,
  );
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: Array<Record<string, unknown>>;
  };

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} backup job sessions out of ${data.pagination.total} total sessions`,
    sessions: data.data.map((session) => ({
      id: session.id,
      name: session.name,
      sessionType: session.sessionType,
      state: session.state,
      platformName: session.platformName,
      creationTime: session.creationTime,
      endTime: session.endTime,
      progressPercent: session.progressPercent,
      result: (session.result as Record<string, unknown>)?.result,
      message: (session.result as Record<string, unknown>)?.message,
    })),
    pagination: data.pagination,
  });
});
