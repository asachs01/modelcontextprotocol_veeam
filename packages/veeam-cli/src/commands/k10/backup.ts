import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError, printSuccess } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10BackupCommand(parent: Command, program: Command): void {
  parent
    .command("backup")
    .description("Trigger an on-demand backup of an application")
    .argument("<app>", "Application name to back up")
    .action(async (app: string) => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();

        const backupAction = {
          apiVersion: "actions.kio.kasten.io/v1alpha1",
          kind: "BackupAction",
          metadata: {
            generateName: "backup-" + app + "-",
            namespace,
          },
          spec: {
            subject: {
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
          plural: "backupactions",
          body: backupAction,
        });
        const result = response as Record<string, unknown>;
        const metadata = result.metadata as Record<string, unknown> | undefined;

        if (format === "json") {
          printOutput(format, { actionName: metadata?.name, action: result });
        } else {
          printSuccess(`Backup initiated for "${app}" (action: ${metadata?.name})`);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
