import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVspcVmsCommand(parent: Command, program: Command): void {
  const vms = parent.command("vms").description("Protected virtual machines");

  vms
    .command("list")
    .description("List protected VMs")
    .option("--limit <number>", "Maximum number of VMs", "100")
    .option("--offset <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vspc", program.opts().host);
        const response = await apiFetch(
          "vspc",
          auth,
          `/api/v3/protectedWorkloads/virtualMachines?limit=${opts.limit}&offset=${opts.offset}`,
        );
        const data = (await response.json()) as {
          meta: { pagingInfo: { total: number; count: number; offset: number } };
          data: Array<Record<string, unknown>>;
        };
        const paging = data.meta?.pagingInfo ?? { total: 0, count: 0, offset: 0 };

        if (format === "json") {
          printOutput(format, { pagination: paging, vms: data.data });
        } else {
          console.log(`Showing ${paging.count} of ${paging.total} protected VMs\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
