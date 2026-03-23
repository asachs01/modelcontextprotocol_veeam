import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVbrRestorePointsCommand(parent: Command, program: Command): void {
  const rp = parent.command("restore-points").description("Restore points");

  rp.command("list")
    .description("List restore points for a backup object")
    .argument("<object-id>", "Backup object ID (UUID)")
    .option("--limit <number>", "Maximum number of restore points", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (objectId: string, opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vbr", program.opts().host);
        const response = await apiFetch(
          "vbr",
          auth,
          `/api/v1/backupObjects/${objectId}/restorePoints?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        const rows = data.data.map((rp) => ({
          id: rp.id,
          name: rp.name,
          type: rp.type,
          platform: rp.platformName,
          created: rp.creationTime,
          backupId: rp.backupId,
        }));

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, restorePoints: rows });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} restore points\n`);
          printOutput(format, rows, {
            columns: ["name", "type", "platform", "created"],
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
