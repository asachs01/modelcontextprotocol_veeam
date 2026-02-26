import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as coreRegisterTools } from "@veeam-mcp/core";
import type { ToolManifestEntry } from "@veeam-mcp/core";

// Resolve relative module paths to absolute URLs from this file's location
const resolve = (rel: string) => new URL(rel, import.meta.url).href;

const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "auth-vspc",
    description: "Authenticate to Veeam Service Provider Console",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/auth-tool.js"),
  },
  {
    name: "list-companies",
    description: "List companies managed in VSPC with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-companies.js"),
  },
  {
    name: "get-company",
    description: "Get details for a specific company by UID",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/get-company.js"),
  },
  {
    name: "get-active-alarms",
    description: "List active alarms in VSPC with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/active-alarms.js"),
  },
  {
    name: "list-backup-servers",
    description: "List backup servers registered in VSPC with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-servers.js"),
  },
  {
    name: "list-backup-jobs",
    description: "List backup jobs across all servers with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/backup-jobs.js"),
  },
  {
    name: "list-repositories",
    description: "List backup repositories across all servers with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/repositories.js"),
  },
  {
    name: "get-company-usage",
    description: "Get resource usage for companies with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/company-usage.js"),
  },
  {
    name: "get-license-usage",
    description: "Get license usage per organization with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/license-usage.js"),
  },
  {
    name: "list-protected-vms",
    description: "List protected virtual machines with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/protected-vms.js"),
  },
];

export async function registerTools(server: McpServer): Promise<void> {
  await coreRegisterTools(server, TOOL_MANIFEST, "vspc-mcp");
}
