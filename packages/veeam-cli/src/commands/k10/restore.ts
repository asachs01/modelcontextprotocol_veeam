import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError, printSuccess } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10RestoreCommand(parent: Command, program: Command): void {
  parent
    .command("restore")
    .description("Restore an application from a restore point")
    .argument("<app>", "Target application name")
    .requiredOption("--restore-point <name>", "Restore point name to restore from")
    .action(async (app: string, opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();

        const restoreAction = {
          apiVersion: "actions.kio.kasten.io/v1alpha1",
          kind: "RestoreAction",
          metadata: {
            generateName: "restore-" + app + "-",
            namespace,
          },
          spec: {
            subject: {
              apiVersion: "apps.kio.kasten.io/v1alpha1",
              kind: "RestorePoint",
              name: opts.restorePoint,
              namespace,
            },
            targetApplication: {
              apiVersion: "apps.kio.kasten.io/v1alpha1",
              kind: "Application",
              name: app,
              namespace,
            },
          },
        };

        const response = await api.createNamespacedCustomObject({
          group: "actions.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "restoreactions",
          body: restoreAction,
        });
        const result = response as Record<string, unknown>;
        const metadata = result.metadata as Record<string, unknown> | undefined;

        if (format === "json") {
          printOutput(format, { actionName: metadata?.name, action: result });
        } else {
          printSuccess(
            `Restore initiated for "${app}" from restore point "${opts.restorePoint}" (action: ${metadata?.name})`,
          );
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
