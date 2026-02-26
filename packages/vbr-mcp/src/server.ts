#!/usr/bin/env node

import { bootstrapServer } from "@veeam-mcp/core";
import { registerTools } from "./lib/tool-registry.js";
import { startEventPoller, stopEventPoller } from "./lib/event-poller.js";

await bootstrapServer({
  name: "VBR MCP Server",
  version: "2.0.0",
  envPrefix: "VBR",
  logPrefix: "vbr-mcp",
  toolCount: 13,
  registerTools,
  onHttpStart: (server) => {
    if (process.env.VBR_ENABLE_NOTIFICATIONS === "true") {
      startEventPoller(server);
      process.stderr.write("[vbr-mcp] Event poller started\n");
    }
  },
  onShutdown: () => {
    stopEventPoller();
  },
});
