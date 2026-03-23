import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerObjectsCommand(program: Command): void {
  const objects = program.command("objects").description("Backup objects");

  objects
    .command("list")
    .description("List backup objects")
    .option("--limit <number>", "Maximum number of objects", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(
          auth,
          `/api/v1/backupObjects?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        const objects = data.data.map((o) => ({
          id: o.id,
          name: o.name,
          type: o.type,
          platform: o.platformName,
          restorePoints: o.restorePointsCount,
          lastRunFailed: o.lastRunFailed,
        }));

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, objects });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} objects\n`);
          printOutput(format, objects, {
            columns: ["name", "type", "platform", "restorePoints", "lastRunFailed"],
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
