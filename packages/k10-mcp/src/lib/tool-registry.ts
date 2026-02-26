import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as coreRegisterTools } from "@veeam-mcp/core";
import type { ToolManifestEntry } from "@veeam-mcp/core";

// Resolve relative module paths to absolute URLs from this file's location
const resolve = (rel: string) => new URL(rel, import.meta.url).href;

const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "auth-k10",
    description: "Authenticate to a Kubernetes cluster running Kasten K10",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/auth-tool.js"),
  },
  {
    name: "list-applications",
    description: "List applications discovered by Kasten K10",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-applications.js"),
  },
  {
    name: "get-compliance",
    description: "Get the latest K10 compliance report",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/get-compliance.js"),
  },
  {
    name: "list-policies",
    description: "List K10 backup and snapshot policies",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-policies.js"),
  },
  {
    name: "run-policy",
    description: "Trigger a manual run of a K10 policy",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/run-policy.js"),
  },
  {
    name: "backup-application",
    description: "Create an on-demand backup of a K10 application",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-application.js"),
  },
  {
    name: "restore-application",
    description: "Restore a K10 application from a restore point",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/restore-application.js"),
  },
  {
    name: "list-restore-points",
    description: "List available restore points for K10 applications",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-restore-points.js"),
  },
  {
    name: "get-action-status",
    description: "Get the status of a K10 action (backup, restore, or run)",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/get-action-status.js"),
  },
  {
    name: "list-profiles",
    description: "List K10 location profiles (storage targets)",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-profiles.js"),
  },
  {
    name: "list-clusters",
    description: "List clusters managed by K10 multi-cluster",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-clusters.js"),
  },
];

export async function registerTools(server: McpServer): Promise<void> {
  await coreRegisterTools(server, TOOL_MANIFEST, "k10-mcp");
}
