#!/usr/bin/env node

import { bootstrapServer } from "@veeam-mcp/core";
import { registerTools } from "./lib/tool-registry.js";

await bootstrapServer({
  name: "VSPC MCP Server",
  version: "1.0.0",
  envPrefix: "VSPC",
  logPrefix: "vspc-mcp",
  toolCount: 10,
  registerTools,
});
