import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as coreRegisterTools } from "@veeam-mcp/core";
import type { ToolManifestEntry } from "@veeam-mcp/core";

// Resolve relative module paths to absolute URLs from this file's location
const resolve = (rel: string) => new URL(rel, import.meta.url).href;

const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "auth-vone",
    description: "Authenticate to Veeam ONE server",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/auth-tool.js"),
  },
  {
    name: "get-vone-server-info",
    description: "Get Veeam ONE server information",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/server-info.js"),
  },
  {
    name: "get-triggered-alarms",
    description: "List triggered alarms with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/triggered-alarms.js"),
  },
  {
    name: "get-alarm-templates",
    description: "List alarm template definitions with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/alarm-templates.js"),
  },
  {
    name: "resolve-alarms",
    description: "Resolve triggered alarms by their IDs",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/resolve-alarms.js"),
  },
  {
    name: "get-vsphere-vms",
    description: "List vSphere virtual machines with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/vsphere-vms.js"),
  },
  {
    name: "get-vsphere-datastores",
    description: "List vSphere datastores with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/vsphere-datastores.js"),
  },
  {
    name: "get-vbr-best-practices",
    description: "List VBR best practice recommendations",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/best-practices.js"),
  },
  {
    name: "get-vbr-repositories",
    description: "List VBR repositories monitored by Veeam ONE",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/repositories.js"),
  },
  {
    name: "get-license-usage",
    description: "Get Veeam ONE license usage information",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/license-usage.js"),
  },
];

export async function registerTools(server: McpServer): Promise<void> {
  await coreRegisterTools(server, TOOL_MANIFEST, "vone-mcp");
}
