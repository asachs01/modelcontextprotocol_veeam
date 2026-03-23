import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerServerCommand(program: Command): void {
  const server = program.command("server").description("VBR server information");

  server
    .command("info")
    .description("Get server information")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(auth, "/api/v1/serverInfo");
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
