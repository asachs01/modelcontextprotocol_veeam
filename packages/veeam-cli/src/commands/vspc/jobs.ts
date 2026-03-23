import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVspcJobsCommand(parent: Command, program: Command): void {
  const jobs = parent.command("jobs").description("Backup jobs across managed servers");

  jobs
    .command("list")
    .description("List backup jobs")
    .option("--limit <number>", "Maximum number of jobs", "100")
    .option("--offset <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vspc", program.opts().host);
        const response = await apiFetch(
          "vspc",
          auth,
          `/api/v3/infrastructure/backupServers/jobs?limit=${opts.limit}&offset=${opts.offset}`,
        );
        const data = (await response.json()) as {
          meta: { pagingInfo: { total: number; count: number; offset: number } };
          data: Array<Record<string, unknown>>;
        };
        const paging = data.meta?.pagingInfo ?? { total: 0, count: 0, offset: 0 };

        if (format === "json") {
          printOutput(format, { pagination: paging, jobs: data.data });
        } else {
          console.log(`Showing ${paging.count} of ${paging.total} backup jobs\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
