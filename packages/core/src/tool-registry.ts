import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolResponse } from "./tool-helpers.js";

type SchemaShape = Record<string, import("zod").ZodTypeAny>;
type ToolHandler = (params: Record<string, unknown>) => Promise<ToolResponse>;

export interface ToolManifestEntry {
  name: string;
  description: string;
  schemaExport: string;
  handlerExport: string;
  /** Absolute file:// URL or path. Use import.meta.resolve() in the caller. */
  modulePath: string;
}

const handlerCache = new Map<string, ToolHandler>();

export async function registerTools(
  server: McpServer,
  manifest: ToolManifestEntry[],
  logPrefix = "mcp",
): Promise<void> {
  for (const entry of manifest) {
    const mod = await import(entry.modulePath);
    const schema: SchemaShape = mod[entry.schemaExport];

    const lazyHandler = async (params: Record<string, unknown>): Promise<ToolResponse> => {
      let handler = handlerCache.get(`${entry.modulePath}#${entry.handlerExport}`);
      if (!handler) {
        const handlerMod = await import(entry.modulePath);
        handler = handlerMod[entry.handlerExport] as ToolHandler;
        handlerCache.set(`${entry.modulePath}#${entry.handlerExport}`, handler);
        process.stderr.write(`[${logPrefix}] Loaded handler: ${entry.name}\n`);
      }
      return handler(params);
    };

    server.tool(entry.name, schema, lazyHandler);
  }
}
