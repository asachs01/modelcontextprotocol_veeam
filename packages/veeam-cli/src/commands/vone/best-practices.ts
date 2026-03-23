import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVoneBestPracticesCommand(parent: Command, program: Command): void {
  const bp = parent.command("best-practices").description("Best practice analysis");

  bp.command("get")
    .description("Get best practice violations and recommendations")
    .option("--limit <number>", "Maximum number of items", "100")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch(
          "vone",
          auth,
          `/api/v2/vbr/bestPractices?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, bestPractices: data.data });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} best practice items\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
