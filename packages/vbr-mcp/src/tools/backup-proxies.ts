import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  limit: z.number().min(1).max(1000).default(200).describe("Maximum number of proxies to retrieve"),
  skip: z.number().min(0).default(0).describe("Number of proxies to skip (for pagination)"),
};

export const handler = withAuth(async (params: { limit: number; skip: number }, auth) => {
  const { limit = 200, skip = 0 } = params;
  const response = await vbrFetch(auth, `/api/v1/backupInfrastructure/proxies?limit=${limit}&skip=${skip}`);
  const data = (await response.json()) as {
    pagination: { total: number; count: number };
    data: Array<Record<string, unknown>>;
  };

  return toolSuccess({
    summary: `Retrieved ${data.pagination.count} backup proxies out of ${data.pagination.total} total proxies`,
    proxies: data.data.map((proxy) => ({
      id: proxy.id,
      name: proxy.name,
      description: proxy.description,
      type: proxy.type,
      transportMode: (proxy.server as Record<string, unknown>)?.transportMode,
      maxTaskCount: (proxy.server as Record<string, unknown>)?.maxTaskCount,
      failoverToNetwork: (proxy.server as Record<string, unknown>)?.failoverToNetwork,
      hostToProxyEncryption: (proxy.server as Record<string, unknown>)?.hostToProxyEncryption,
    })),
    pagination: data.pagination,
  });
});
