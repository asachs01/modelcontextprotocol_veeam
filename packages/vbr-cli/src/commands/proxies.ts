import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerProxiesCommand(program: Command): void {
  const proxies = program.command("proxies").description("Backup proxies");

  proxies
    .command("list")
    .description("List backup proxies")
    .option("--limit <number>", "Maximum number of proxies", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(
          auth,
          `/api/v1/backupInfrastructure/proxies?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        const proxies = data.data.map((p) => {
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
          printOutput(format, { pagination: data.pagination, proxies });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} proxies\n`);
          printOutput(format, proxies, {
            columns: ["name", "type", "transportMode", "maxTasks", "description"],
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
