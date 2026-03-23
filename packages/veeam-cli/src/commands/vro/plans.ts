import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVroPlansCommand(parent: Command, program: Command): void {
  const plans = parent.command("plans").description("Recovery plans");

  plans
    .command("list")
    .description("List recovery plans")
    .option("--limit <number>", "Maximum number of plans", "100")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch(
          "vro",
          auth,
          `/api/v7.21/Plans?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination?: { total: number; count: number };
          data?: Array<Record<string, unknown>>;
        };

        const items = data.data ?? [];
        const total = data.pagination?.total ?? items.length;
        const count = data.pagination?.count ?? items.length;

        if (format === "json") {
          printOutput(format, { pagination: { total, count }, plans: items });
        } else {
          console.log(`Showing ${count} of ${total} plans\n`);
          printOutput(format, items);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  const plan = parent.command("plan").description("Single plan operations");

  plan
    .command("get")
    .description("Get details for a specific plan")
    .argument("<id>", "Plan ID")
    .action(async (id: string) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vro", program.opts().host);
        const response = await apiFetch("vro", auth, `/api/v7.21/Plans/${id}`);
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
