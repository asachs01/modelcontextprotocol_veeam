import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVroRuntimeCommand(parent: Command, program: Command): void {
  const runtime = parent.command("runtime").description("Runtime status");

  runtime
    .command("status")
    .description("Get runtime status for a recovery plan")
    .argument("<plan-id>", "Plan ID")
    .action(async (planId: string) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch(
          "vro",
          auth,
          `/api/v7.21/RuntimeDetails/Plans/${planId}`,
        );
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
