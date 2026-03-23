import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10RestorePointsCommand(parent: Command, program: Command): void {
  const rp = parent.command("restore-points").description("K10 restore points");

  rp.command("list")
    .description("List restore points")
    .option("--app <name>", "Filter by application name")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();
        const response = await api.listNamespacedCustomObject({
          group: "apps.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "restorepoints",
        });
        const body = response as { items: Array<Record<string, unknown>> };
        let items = body.items || [];

        if (opts.app) {
          items = items.filter((item) => {
            const metadata = item.metadata as Record<string, unknown> | undefined;
            const labels = metadata?.labels as Record<string, string> | undefined;
            return labels?.["k10.kasten.io/appName"] === opts.app;
          });
        }

        const rows = items.map((item) => {
          const metadata = item.metadata as Record<string, unknown> | undefined;
          const spec = item.spec as Record<string, unknown> | undefined;
          return {
            name: metadata?.name,
            namespace: metadata?.namespace,
            created: metadata?.creationTimestamp,
            application: spec?.application,
          };
        });

        if (format === "json") {
          printOutput(format, { restorePoints: rows });
        } else {
          const suffix = opts.app ? ` for "${opts.app}"` : "";
          console.log(`Found ${rows.length} restore point(s)${suffix}\n`);
          printOutput(format, rows, { columns: ["name", "namespace", "created"] });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
