import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as coreRegisterTools } from "@veeam-mcp/core";
import type { ToolManifestEntry } from "@veeam-mcp/core";

// Resolve relative module paths to absolute URLs from this file's location
const resolve = (rel: string) => new URL(rel, import.meta.url).href;

const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "auth-vro",
    description: "Authenticate to Veeam Recovery Orchestrator server",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/auth-tool.js"),
  },
  {
    name: "list-plans",
    description: "List orchestration plans with pagination",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/list-plans.js"),
  },
  {
    name: "get-plan",
    description: "Get details of a specific orchestration plan",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/get-plan.js"),
  },
  {
    name: "run-readiness-check",
    description: "Run a readiness check on an orchestration plan",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/readiness-check.js"),
  },
  {
    name: "get-runtime-status",
    description: "Get runtime status of an orchestration plan",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/runtime-status.js"),
  },
  {
    name: "trigger-failover",
    description: "Trigger failover for an orchestration plan (destructive, requires confirmation)",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/trigger-failover.js"),
  },
  {
    name: "trigger-failback",
    description: "Trigger failback to production for an orchestration plan (destructive, requires confirmation)",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/trigger-failback.js"),
  },
  {
    name: "list-recovery-locations",
    description: "List available recovery locations",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/recovery-locations.js"),
  },
  {
    name: "get-license-usage",
    description: "Get VRO server license usage information",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/license-usage.js"),
  },
  {
    name: "list-scopes",
    description: "List VRO scopes",
    schemaExport: "schema",
    handlerExport: "handler",
    modulePath: resolve("../tools/scopes.js"),
  },
];

export async function registerTools(server: McpServer): Promise<void> {
  await coreRegisterTools(server, TOOL_MANIFEST, "vro-mcp");
}
