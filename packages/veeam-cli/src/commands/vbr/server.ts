import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVbrServerCommand(parent: Command, program: Command): void {
  const server = parent.command("server").description("VBR server information");

  server
    .command("info")
    .description("Get server information")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vbr", program.opts().host);
        const response = await apiFetch("vbr", auth, "/api/v1/serverInfo");
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
