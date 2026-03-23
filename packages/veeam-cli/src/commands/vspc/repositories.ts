import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVspcRepositoriesCommand(parent: Command, program: Command): void {
  const repos = parent.command("repositories").description("Backup repositories");

  repos
    .command("list")
    .description("List backup repositories across managed servers")
    .option("--limit <number>", "Maximum number of repositories", "100")
    .option("--offset <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vspc", program.opts().host);
        const response = await apiFetch(
          "vspc",
          auth,
          `/api/v3/infrastructure/backupServers/repositories?limit=${opts.limit}&offset=${opts.offset}`,
        );
        const data = (await response.json()) as {
          meta: { pagingInfo: { total: number; count: number; offset: number } };
          data: Array<Record<string, unknown>>;
        };
        const paging = data.meta?.pagingInfo ?? { total: 0, count: 0, offset: 0 };

        if (format === "json") {
          printOutput(format, { pagination: paging, repositories: data.data });
        } else {
          console.log(`Showing ${paging.count} of ${paging.total} repositories\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
