import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError, printSuccess } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVoneAlarmsCommand(parent: Command, program: Command): void {
  const alarms = parent.command("alarms").description("Triggered alarms");

  alarms
    .command("list")
    .description("List triggered alarms")
    .option("--limit <number>", "Maximum number of alarms", "100")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch(
          "vone",
          auth,
          `/api/v2/alarms/triggered?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, alarms: data.data });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} triggered alarms\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  alarms
    .command("resolve")
    .description("Resolve one or more triggered alarms")
    .argument("<ids...>", "Alarm IDs to resolve")
    .action(async (ids: string[]) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch("vone", auth, "/api/v2/alarms/triggered/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alarmIds: ids }),
        });

        if (response.status === 204) {
          if (format === "json") {
            printOutput(format, { resolved: ids });
          } else {
            printSuccess(`Resolved ${ids.length} alarm(s).`);
          }
          return;
        }

        const data = await response.json();
        if (format === "json") {
          printOutput(format, { resolved: ids, response: data });
        } else {
          printSuccess(`Resolved ${ids.length} alarm(s).`);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
