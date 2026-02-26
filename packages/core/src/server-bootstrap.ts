import { parseArgs } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

export interface ServerConfig {
  /** Server name shown in MCP protocol */
  name: string;
  /** Server version */
  version: string;
  /** Environment variable prefix for transport/port config (e.g., "VBR") */
  envPrefix: string;
  /** Log prefix for stderr messages (e.g., "vbr-mcp") */
  logPrefix: string;
  /** Number of tools registered (for health endpoint) */
  toolCount: number;
  /** Called after server creation to register tools */
  registerTools: (server: McpServer) => Promise<void>;
  /** Optional: called when HTTP transport starts (e.g., for event pollers) */
  onHttpStart?: (server: McpServer) => void;
  /** Optional: called on shutdown */
  onShutdown?: () => void;
}

export async function bootstrapServer(config: ServerConfig): Promise<void> {
  const { values } = parseArgs({
    options: {
      transport: {
        type: "string",
        default: process.env[`${config.envPrefix}_TRANSPORT`] || "stdio",
      },
      port: {
        type: "string",
        default: process.env[`${config.envPrefix}_HTTP_PORT`] || "3000",
      },
      host: { type: "string", default: "localhost" },
    },
    strict: false,
  });

  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  await config.registerTools(server);

  if (values.transport === "http") {
    const app = express();
    const port = parseInt(values.port as string, 10);

    app.get("/health", (_req, res) => {
      res.json({ status: "ok", transport: "http", tools: config.toolCount });
    });

    const transports = new Map<string, SSEServerTransport>();

    app.get("/sse", async (req, res) => {
      const transport = new SSEServerTransport("/messages", res);
      transports.set(transport.sessionId, transport);
      res.on("close", () => {
        transports.delete(transport.sessionId);
      });
      await server.connect(transport);
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports.get(sessionId);
      if (!transport) {
        res.status(400).json({ error: "Unknown session" });
        return;
      }
      await transport.handlePostMessage(req, res);
    });

    app.listen(port, values.host as string, () => {
      process.stderr.write(`[${config.logPrefix}] HTTP server listening on ${values.host}:${port}\n`);
      process.stderr.write(`[${config.logPrefix}] Health: http://${values.host}:${port}/health\n`);
      process.stderr.write(`[${config.logPrefix}] SSE: http://${values.host}:${port}/sse\n`);
    });

    config.onHttpStart?.(server);

    const shutdown = () => {
      config.onShutdown?.();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}
