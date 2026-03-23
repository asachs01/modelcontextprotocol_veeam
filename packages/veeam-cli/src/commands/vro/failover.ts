import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError, printSuccess } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVroFailoverCommand(parent: Command, program: Command): void {
  parent
    .command("failover")
    .description("Trigger a failover for a recovery plan (destructive)")
    .requiredOption("--plan-id <id>", "Plan ID to failover")
    .option("--confirm", "Confirm the destructive failover operation", false)
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        if (!opts.confirm) {
          printError(
            "Failover is a destructive operation. Pass --confirm to proceed.",
          );
          process.exit(1);
        }

        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch(
          "vro",
          auth,
          `/api/v7.21/Plans/${opts.planId}/Failover`,
          { method: "POST" },
        );

        let body = "";
        try {
          body = await response.text();
        } catch {
          // Ignore
        }

        if (format === "json") {
          printOutput(format, { status: "triggered", planId: opts.planId, response: body || null });
        } else {
          printSuccess("Failover triggered successfully.");
          if (body) console.log(body);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  parent
    .command("failback")
    .description("Trigger a failback to production for a recovery plan (destructive)")
    .requiredOption("--plan-id <id>", "Plan ID to failback")
    .option("--confirm", "Confirm the destructive failback operation", false)
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        if (!opts.confirm) {
          printError(
            "Failback is a destructive operation. Pass --confirm to proceed.",
          );
          process.exit(1);
        }

        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch(
          "vro",
          auth,
          `/api/v7.21/Plans/${opts.planId}/FailbackToProduction`,
          { method: "POST" },
        );

        let body = "";
        try {
          body = await response.text();
        } catch {
          // Ignore
        }

        if (format === "json") {
          printOutput(format, { status: "triggered", planId: opts.planId, response: body || null });
        } else {
          printSuccess("Failback to production triggered successfully.");
          if (body) console.log(body);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
