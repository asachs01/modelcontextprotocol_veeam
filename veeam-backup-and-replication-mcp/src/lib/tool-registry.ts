import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolResponse } from "./tool-helpers.js";

type SchemaShape = Record<string, import("zod").ZodTypeAny>;
type ToolHandler = (params: Record<string, unknown>) => Promise<ToolResponse>;

interface ToolManifestEntry {
  name: string;
  description: string;
  schemaExport: string;
  handlerExport: string;
  modulePath: string;
}

const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "auth-vbr",
    description: "Authenticate to Veeam Backup & Replication server",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/auth-tool.js",
  },
  {
    name: "get-server-info",
    description: "Get VBR server information",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/server-info.js",
  },
  {
    name: "get-backup-objects",
    description: "List backup objects with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/backup-objects.js",
  },
  {
    name: "get-proxies",
    description: "List backup proxies with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/backup-proxies.js",
  },
  {
    name: "get-repositories",
    description: "List backup repositories with health status",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/backup-repositories.js",
  },
  {
    name: "get-backup-sessions",
    description: "List backup job sessions with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/backup-sessions.js",
  },
  {
    name: "get-config-backup",
    description: "Get configuration backup status",
    schemaExport: "getConfigBackupSchema",
    handlerExport: "getConfigBackupHandler",
    modulePath: "../tools/config-backup.js",
  },
  {
    name: "start-config-backup",
    description: "Start a configuration backup (requires confirmation)",
    schemaExport: "startConfigBackupSchema",
    handlerExport: "startConfigBackupHandler",
    modulePath: "../tools/config-backup.js",
  },
  {
    name: "get-license-info",
    description: "Get VBR license information",
    schemaExport: "getLicenseInfoSchema",
    handlerExport: "getLicenseInfoHandler",
    modulePath: "../tools/license.js",
  },
  {
    name: "get-license-workloads",
    description: "Get license workload details grouped by type",
    schemaExport: "getLicenseWorkloadsSchema",
    handlerExport: "getLicenseWorkloadsHandler",
    modulePath: "../tools/license.js",
  },
  {
    name: "get-malware-events",
    description: "List malware detection events with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/malware-events.js",
  },
  {
    name: "get-protection-groups",
    description: "List protection groups with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/protection-groups.js",
  },
  {
    name: "get-restore-points",
    description: "List restore points for a backup object with filtering",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: "../tools/restore-points.js",
  },
];

// Cache for lazily loaded handler modules
const handlerCache = new Map<string, ToolHandler>();

export async function registerTools(server: McpServer): Promise<void> {
  for (const entry of TOOL_MANIFEST) {
    // Eagerly load schema (lightweight Zod objects)
    const mod = await import(entry.modulePath);
    const schema: SchemaShape = mod[entry.schemaExport];

    // Create a lazy handler that loads the real handler on first call
    const lazyHandler = async (params: Record<string, unknown>): Promise<ToolResponse> => {
      let handler = handlerCache.get(`${entry.modulePath}#${entry.handlerExport}`);
      if (!handler) {
        const handlerMod = await import(entry.modulePath);
        handler = handlerMod[entry.handlerExport] as ToolHandler;
        handlerCache.set(`${entry.modulePath}#${entry.handlerExport}`, handler);
        process.stderr.write(`[vbr-mcp] Loaded handler: ${entry.name}\n`);
      }
      return handler(params);
    };

    server.tool(entry.name, schema, lazyHandler);
  }
}
