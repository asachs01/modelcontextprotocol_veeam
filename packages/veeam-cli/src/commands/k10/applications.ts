import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10ApplicationsCommand(parent: Command, program: Command): void {
  const apps = parent.command("applications").description("K10-discovered applications");

  apps
    .command("list")
    .description("List applications discovered by K10")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();
        const response = await api.listNamespacedCustomObject({
          group: "apps.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "applications",
        });
        const body = response as { items: Array<Record<string, unknown>> };
        const items = body.items || [];

        const rows = items.map((item) => {
          const metadata = item.metadata as Record<string, unknown> | undefined;
          const status = item.status as Record<string, unknown> | undefined;
          return {
            name: metadata?.name,
            namespace: metadata?.namespace,
            status: status?.status,
          };
        });

        if (format === "json") {
          printOutput(format, { applications: rows });
        } else {
          console.log(`Found ${rows.length} application(s)\n`);
          printOutput(format, rows, { columns: ["name", "namespace", "status"] });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
