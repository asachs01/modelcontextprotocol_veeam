#!/usr/bin/env node

import { bootstrapServer } from "@veeam-mcp/core";
import { registerTools } from "./lib/tool-registry.js";

await bootstrapServer({
  name: "VRO MCP Server",
  version: "1.0.0",
  envPrefix: "VRO",
  logPrefix: "vro-mcp",
  toolCount: 10,
  registerTools,
});
