import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVroReadinessCommand(parent: Command, program: Command): void {
  parent
    .command("readiness-check")
    .description("Run a readiness check on a recovery plan")
    .argument("<plan-id>", "Plan ID to check")
    .action(async (planId: string) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch(
          "vro",
          auth,
          `/api/v7.21/Plans/${planId}/ReadinessCheck`,
          { method: "POST" },
        );
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
