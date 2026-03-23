import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10ActionsCommand(parent: Command, program: Command): void {
  const actions = parent.command("actions").description("K10 action status");

  actions
    .command("status")
    .description("Get status of a K10 action")
    .argument("<action-name>", "Name of the action")
    .requiredOption(
      "--type <type>",
      "Action type: runactions | backupactions | restoreactions",
    )
    .action(async (actionName: string, opts) => {
      const format = program.opts().format as OutputFormat;
      const validTypes = ["runactions", "backupactions", "restoreactions"];
      if (!validTypes.includes(opts.type)) {
        printError(`Invalid action type "${opts.type}". Must be one of: ${validTypes.join(", ")}`);
        process.exit(1);
      }

      try {
        const { api, namespace } = getK10Client();
        const response = await api.getNamespacedCustomObject({
          group: "actions.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: opts.type,
          name: actionName,
        });
        const result = response as Record<string, unknown>;
        const status = result.status as Record<string, unknown> | undefined;
        const metadata = result.metadata as Record<string, unknown> | undefined;

        if (format === "json") {
          printOutput(format, {
            name: metadata?.name,
            state: status?.state,
            action: result,
          });
        } else {
          printOutput(format, {
            name: metadata?.name,
            state: status?.state,
            type: opts.type,
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
