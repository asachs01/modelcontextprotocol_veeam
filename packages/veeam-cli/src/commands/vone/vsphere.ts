import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerVoneVsphereCommand(parent: Command, program: Command): void {
  const datastores = parent.command("datastores").description("vSphere datastores");

  datastores
    .command("list")
    .description("List vSphere datastores monitored by Veeam ONE")
    .option("--limit <number>", "Maximum number of datastores", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch(
          "vone",
          auth,
          `/api/v2/vSphere/datastores?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, datastores: data.data });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} datastores\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  const vms = parent.command("vms").description("vSphere virtual machines");

  vms
    .command("list")
    .description("List vSphere VMs monitored by Veeam ONE")
    .option("--limit <number>", "Maximum number of VMs", "200")
    .option("--skip <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vone", program.opts().host);
        const response = await apiFetch(
          "vone",
          auth,
          `/api/v2/vSphere/vms?limit=${opts.limit}&skip=${opts.skip}`,
        );
        const data = (await response.json()) as {
          pagination: { total: number; count: number };
          data: Array<Record<string, unknown>>;
        };

        if (format === "json") {
          printOutput(format, { pagination: data.pagination, vms: data.data });
        } else {
          console.log(`Showing ${data.pagination.count} of ${data.pagination.total} VMs\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
