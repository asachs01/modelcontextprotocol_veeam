#!/usr/bin/env node

import { parseArgs } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { registerTools } from "./lib/tool-registry.js";
import { startEventPoller, stopEventPoller } from "./lib/event-poller.js";

const { values } = parseArgs({
  options: {
    transport: { type: "string", default: process.env.VBR_TRANSPORT || "stdio" },
    port: { type: "string", default: process.env.VBR_HTTP_PORT || "3000" },
    host: { type: "string", default: "localhost" },
  },
  strict: false,
});

const server = new McpServer({
  name: "VBR MCP Server",
  version: "2.0.0",
});

await registerTools(server);

if (values.transport === "http") {
  const app = express();
  const port = parseInt(values.port as string, 10);

  // Health endpoint (unauthenticated)
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", transport: "http", tools: 13 });
  });

  // SSE transport
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
    process.stderr.write(`[vbr-mcp] HTTP server listening on ${values.host}:${port}\n`);
    process.stderr.write(`[vbr-mcp] Health: http://${values.host}:${port}/health\n`);
    process.stderr.write(`[vbr-mcp] SSE: http://${values.host}:${port}/sse\n`);
  });

  // Start event poller if enabled
  if (process.env.VBR_ENABLE_NOTIFICATIONS === "true") {
    startEventPoller(server);
    process.stderr.write("[vbr-mcp] Event poller started\n");
  }

  // Graceful shutdown
  const shutdown = () => {
    stopEventPoller();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} else {
  // Default: stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
