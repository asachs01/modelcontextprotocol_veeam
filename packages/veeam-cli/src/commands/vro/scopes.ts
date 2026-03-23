import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVroScopesCommand(parent: Command, program: Command): void {
  const scopes = parent.command("scopes").description("Recovery scopes");

  scopes
    .command("list")
    .description("List configured scopes")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch("vro", auth, "/api/v7.21/Scopes");
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
