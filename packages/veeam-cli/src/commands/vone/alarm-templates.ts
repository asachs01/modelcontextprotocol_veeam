import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVoneAlarmTemplatesCommand(parent: Command, program: Command): void {
  const templates = parent.command("alarm-templates").description("Alarm templates");

  templates
    .command("list")
    .description("List alarm templates")
    .option("--limit <number>", "Maximum number of templates", "100")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch(
          "vone",
          auth,
          `/api/v2/alarms?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, alarmTemplates: data.data });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} alarm templates\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
