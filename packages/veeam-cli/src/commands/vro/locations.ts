import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVroLocationsCommand(parent: Command, program: Command): void {
  const locations = parent.command("recovery-locations").description("Recovery locations");

  locations
    .command("list")
    .description("List configured recovery locations")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch("vro", auth, "/api/v7.21/RecoveryLocations");
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
