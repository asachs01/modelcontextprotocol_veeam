import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerSessionsCommand(program: Command): void {
  const sessions = program.command("sessions").description("Backup sessions");

  sessions
    .command("list")
    .description("List backup job sessions")
    .option("--limit <number>", "Maximum number of sessions", "100")
    .option("--skip <number>", "Number of sessions to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(
          auth,
          `/api/v1/sessions?limit=${opts.limit}&skip=${opts.skip}&typeFilter=BackupJob`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        const sessions = data.data.map((s) => ({
          id: s.id,
          name: s.name,
          state: s.state,
          platform: s.platformName,
          created: s.creationTime,
          ended: s.endTime,
          progress: s.progressPercent,
          result: (s.result as Record<string, unknown>)?.result,
        }));

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, sessions });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} sessions\n`);
          printOutput(format, sessions, {
            columns: ["name", "state", "result", "progress", "created", "ended"],
          });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
