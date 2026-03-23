import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerProtectionGroupsCommand(program: Command): void {
  const pg = program.command("protection-groups").description("Agent protection groups");

  pg.command("list")
    .description("List protection groups")
    .option("--limit <number>", "Maximum number of groups", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(
          auth,
          `/api/v1/agents/protectionGroups?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, protectionGroups: data.data });
        } else {
          console.log(
            `Showing ${data.pagination.count} of ${data.pagination.total} protection groups\n`,
          );
          printOutput(format, data.data as Record<string, unknown>[]);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
