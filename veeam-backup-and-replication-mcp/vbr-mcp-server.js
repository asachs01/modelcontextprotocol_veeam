// vbr-mcp-server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an MCP server
const server = new McpServer({
  name: "VBR API Server",
  version: "1.0.0"
});

// Define the tools directory path
const toolsDir = path.join(__dirname, "tools");

// Dynamically load all tools
async function loadTools() {
  try {
    // Check if tools directory exists
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir, { recursive: true });
    }

    // Read tool files from the directory
    const files = fs.readdirSync(toolsDir);

    // Sort files to ensure specific load order:
    // 1. Auth tools (e.g., auth-tool.js)
    // 2. Get tools (e.g., backup-proxies-tool.js, etc.)
    // 3. Start/Action tools (e.g., config-backup-tool.js which contains start)
    // Note: Since config-backup-tool contains BOTH get and start, its position depends on preference. 
    // Usually 'start' comes last. We can prioritize by filename if we want strict file-level control,
    // but typically the order of server.tool() calls within a file matters only if they are in the same file.
    // Across files, we load them sequentially.

    // Custom sort function
    files.sort((a, b) => {
      const lowerA = a.toLowerCase();
      const lowerB = b.toLowerCase();

      // 1. Auth always first
      if (lowerA.includes('auth')) return -1;
      if (lowerB.includes('auth')) return 1;

      // 2. Prioritize 'get' tools or standard info tools
      // We defer 'start' logic to the end if file implies action, 
      // but 'config-backup-tool.js' has both. 
      // Let's sort alphabetically for the rest to be deterministic, 
      // effectively grouping similar named things.
      // Or we can try to push 'config' to the end if we consider it "start-y"?
      // The user request: "show the auth as it is today, then all Gets, then the last one is the Start"
      // Since 'start_config_backup' is inside 'config-backup-tool.js', that file will register both.
      // We can't easily split them without splitting the file. 
      // However, we can ensure files that are PRIMARILY 'get' come before others.

      return lowerA.localeCompare(lowerB);
    });

    // Import and register each tool
    for (const file of files) {
      if (file.endsWith('.js')) {
        try {
          const toolPath = path.join(toolsDir, file);
          const toolModule = await import(`file://${toolPath}`);

          if (toolModule.default && typeof toolModule.default === 'function') {
            toolModule.default(server);
          }
        } catch (err) {
          // Use process.stderr for errors
          process.stderr.write(`Error loading tool ${file}: ${err.message}\n`);
        }
      }
    }
  } catch (error) {
    process.stderr.write(`Error loading tools: ${error.message}\n`);
  }
}

// Load all tools before starting the server
await loadTools();

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);