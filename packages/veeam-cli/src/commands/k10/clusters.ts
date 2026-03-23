import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10ClustersCommand(parent: Command, program: Command): void {
  const clusters = parent.command("clusters").description("K10-managed clusters");

  clusters
    .command("list")
    .description("List clusters registered with K10")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();
        const response = await api.listNamespacedCustomObject({
          group: "dist.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "clusters",
        });
        const body = response as { items: Array<Record<string, unknown>> };
        const items = body.items || [];

        const rows = items.map((item) => {
          const metadata = item.metadata as Record<string, unknown> | undefined;
          const spec = item.spec as Record<string, unknown> | undefined;
          const status = item.status as Record<string, unknown> | undefined;
          return {
            name: metadata?.name,
            namespace: metadata?.namespace,
            spec,
            status,
          };
        });

        if (format === "json") {
          printOutput(format, { clusters: rows });
        } else {
          console.log(`Found ${rows.length} cluster(s)\n`);
          printOutput(format, rows, { columns: ["name", "namespace"] });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
