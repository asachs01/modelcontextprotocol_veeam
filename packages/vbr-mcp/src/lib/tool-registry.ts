import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as coreRegisterTools } from "@veeam-mcp/core";
import type { ToolManifestEntry } from "@veeam-mcp/core";

// Resolve relative module paths to absolute URLs from this file's location
const resolve = (rel: string) => new URL(rel, import.meta.url).href;

const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "auth-vbr",
    description: "Authenticate to Veeam Backup & Replication server",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/auth-tool.js"),
  },
  {
    name: "get-server-info",
    description: "Get VBR server information",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/server-info.js"),
  },
  {
    name: "get-backup-objects",
    description: "List backup objects with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-objects.js"),
  },
  {
    name: "get-proxies",
    description: "List backup proxies with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-proxies.js"),
  },
  {
    name: "get-repositories",
    description: "List backup repositories with health status",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-repositories.js"),
  },
  {
    name: "get-backup-sessions",
    description: "List backup job sessions with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-sessions.js"),
  },
  {
    name: "get-config-backup",
    description: "Get configuration backup status",
    schemaExport: "getConfigBackupSchema",
    handlerExport: "getConfigBackupHandler",
    modulePath: resolve("../tools/config-backup.js"),
  },
  {
    name: "start-config-backup",
    description: "Start a configuration backup (requires confirmation)",
    schemaExport: "startConfigBackupSchema",
    handlerExport: "startConfigBackupHandler",
    modulePath: resolve("../tools/config-backup.js"),
  },
  {
    name: "get-license-info",
    description: "Get VBR license information",
    schemaExport: "getLicenseInfoSchema",
    handlerExport: "getLicenseInfoHandler",
    modulePath: resolve("../tools/license.js"),
  },
  {
    name: "get-license-workloads",
    description: "Get license workload details grouped by type",
    schemaExport: "getLicenseWorkloadsSchema",
    handlerExport: "getLicenseWorkloadsHandler",
    modulePath: resolve("../tools/license.js"),
  },
  {
    name: "get-malware-events",
    description: "List malware detection events with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/malware-events.js"),
  },
  {
    name: "get-protection-groups",
    description: "List protection groups with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/protection-groups.js"),
  },
  {
    name: "get-restore-points",
    description: "List restore points for a backup object with filtering",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/restore-points.js"),
  },
];

export async function registerTools(server: McpServer): Promise<void> {
  await coreRegisterTools(server, TOOL_MANIFEST, "vbr-mcp");
}
