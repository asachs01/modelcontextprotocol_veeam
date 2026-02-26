#!/usr/bin/env node

import { bootstrapServer } from "@veeam-mcp/core";
import { registerTools } from "./lib/tool-registry.js";

await bootstrapServer({
  name: "Kasten K10 MCP Server",
  version: "1.0.0",
  envPrefix: "K10",
  logPrefix: "k10-mcp",
  toolCount: 11,
  registerTools,
});
