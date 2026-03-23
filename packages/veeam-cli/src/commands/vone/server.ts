import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVoneServerCommand(parent: Command, program: Command): void {
  const server = parent.command("server").description("Veeam ONE server information");

  server
    .command("info")
    .description("Get Veeam ONE server information")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch("vone", auth, "/api/v2/about");
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
