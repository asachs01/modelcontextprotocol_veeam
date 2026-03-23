import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerRepositoriesCommand(program: Command): void {
  const repos = program.command("repositories").description("Backup repositories");

  repos
    .command("list")
    .description("List backup repository states")
    .option("--limit <number>", "Maximum number of repositories", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(
          auth,
          `/api/v1/backupInfrastructure/repositories/states?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        const repos = data.data.map((r) => {
          const capacityGB = r.capacityGB as number;
          const freeGB = r.freeGB as number;
          const freePercent = capacityGB > 0 ? Math.round((freeGB / capacityGB) * 100) : 0;
          return {
            id: r.id,
            name: r.name,
            type: r.type,
            path: r.path,
            capacityGB,
            freeGB,
            freePercent: `${freePercent}%`,
            online: r.isOnline,
          };
        });

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, repositories: repos });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} repositories\n`);
          printOutput(format, repos, {
            columns: ["name", "type", "capacityGB", "freeGB", "freePercent", "online"],
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
