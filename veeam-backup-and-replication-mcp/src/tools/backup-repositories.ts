import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(200).describe("Maximum number of repositories to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of repositories to skip (for pagination)"),
  threshold: z.number().min(1).max(99).default(20).describe("Warning threshold percentage for free space"),
};

interface RepoState {
  id: string;
  name: string;
  description: string;
  type: string;
  path: string;
  hostName?: string;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
  isOnline: boolean;
}

function categorizeRepo(repo: RepoState, threshold: number) {
  let freeSpacePercent = 0;
  let status = "Unknown";
  let statusDetails = "";

  if (repo.capacityGB > 0) {
    freeSpacePercent = Math.round((repo.freeGB / repo.capacityGB) * 100);
    if (!repo.isOnline) {
      status = "Offline";
      statusDetails = "Repository is offline and cannot be accessed";
    } else if (freeSpacePercent <= threshold) {
      status = "Warning";
      statusDetails = `Low free space (${freeSpacePercent}%)`;
    } else {
      status = "Healthy";
      statusDetails = `Good free space (${freeSpacePercent}%)`;
    }
  } else if (!repo.isOnline) {
    status = "Offline";
    statusDetails = "Repository is offline and cannot be accessed";
  } else if (repo.type.includes("Cloud")) {
    status = "Cloud";
    statusDetails = "Object storage with unlimited capacity";
  } else {
    statusDetails = "Unable to determine free space";
  }

  return { ...repo, hostName: repo.hostName || "N/A", freeSpacePercent, status, statusDetails };
}

export const handler = withAuth(
  async (params: { limit: number; skip: number; threshold: number }, auth) => {
    const { limit = 200, skip = 0, threshold = 20 } = params;
    const response = await vbrFetch(
      auth,
      `/api/v1/backupInfrastructure/repositories/states?limit=${limit}&skip=${skip}`,
    );
    const data = (await response.json()) as {
      pagination: Record<string, unknown>;
      data: RepoState[];
    };

    const repos = data.data.map((r) => categorizeRepo(r, threshold));

    const grouped = {
      healthy: repos.filter((r) => r.status === "Healthy"),
      warnings: repos.filter((r) => r.status === "Warning"),
      offline: repos.filter((r) => r.status === "Offline"),
      cloud: repos.filter((r) => r.status === "Cloud"),
      unknown: repos.filter((r) => r.status === "Unknown"),
    };

    return toolSuccess({
      summary: {
        total: repos.length,
        healthy: grouped.healthy.length,
        warnings: grouped.warnings.length,
        offline: grouped.offline.length,
        cloud: grouped.cloud.length,
        unknown: grouped.unknown.length,
      },
      ...grouped,
      pagination: data.pagination,
    });
  },
);
