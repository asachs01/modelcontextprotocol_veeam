import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVbrProxiesCommand(parent: Command, program: Command): void {
  const proxies = parent.command("proxies").description("Backup proxies");

  proxies
    .command("list")
    .description("List backup proxies")
    .option("--limit <number>", "Maximum number of proxies", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vbr", program.opts().host);
        const response = await apiFetch(
          "vbr",
          auth,
          `/api/v1/backupInfrastructure/proxies?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        const rows = data.data.map((p) => {
          const server = p.server as Record<string, unknown> | undefined;
          return {
            id: p.id,
            name: p.name,
            type: p.type,
            description: p.description,
            transportMode: server?.transportMode,
            maxTasks: server?.maxTaskCount,
          };
        });

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, proxies: rows });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} proxies\n`);
          printOutput(format, rows, {
            columns: ["name", "type", "transportMode", "maxTasks", "description"],
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
