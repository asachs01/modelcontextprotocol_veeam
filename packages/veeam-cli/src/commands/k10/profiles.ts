import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10ProfilesCommand(parent: Command, program: Command): void {
  const profiles = parent.command("profiles").description("K10 location profiles");

  profiles
    .command("list")
    .description("List location profiles")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();
        const response = await api.listNamespacedCustomObject({
          group: "config.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "profiles",
        });
        const body = response as { items: Array<Record<string, unknown>> };
        const items = body.items || [];

        const rows = items.map((item) => {
          const metadata = item.metadata as Record<string, unknown> | undefined;
          const spec = item.spec as Record<string, unknown> | undefined;
          return {
            name: metadata?.name,
            namespace: metadata?.namespace,
            type: spec?.type,
          };
        });

        if (format === "json") {
          printOutput(format, { profiles: rows });
        } else {
          console.log(`Found ${rows.length} location profile(s)\n`);
          printOutput(format, rows, { columns: ["name", "namespace", "type"] });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
