#!/usr/bin/env node

import { bootstrapServer } from "@veeam-mcp/core";
import { registerTools } from "./lib/tool-registry.js";

await bootstrapServer({
  name: "Veeam ONE MCP Server",
  version: "1.0.0",
  envPrefix: "VONE",
  logPrefix: "vone-mcp",
  toolCount: 10,
  registerTools,
});
