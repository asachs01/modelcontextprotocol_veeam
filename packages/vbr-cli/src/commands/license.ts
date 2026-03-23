import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError } from "../output.js";
import type { OutputFormat } from "../output.js";

interface LicenseData {
  status: string;
  edition: string;
  expirationDate: string;
  licensedTo: string;
  supportExpirationDate: string;
  instanceLicenseSummary?: {
    package: string;
    licensedInstancesNumber: number;
    usedInstancesNumber: number;
    workload?: Array<Record<string, unknown>>;
  };
}

export function registerLicenseCommand(program: Command): void {
  const license = program.command("license").description("License information");

  license
    .command("info")
    .description("Get license information")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(auth, "/api/v1/license");
        const data = (await response.json()) as LicenseData;

        const info = {
          status: data.status,
          edition: data.edition,
          licensedTo: data.licensedTo,
          expirationDate: data.expirationDate,
          supportExpiration: data.supportExpirationDate,
          package: data.instanceLicenseSummary?.package,
          licensedInstances: data.instanceLicenseSummary?.licensedInstancesNumber,
          usedInstances: data.instanceLicenseSummary?.usedInstancesNumber,
        };

        printOutput(format, info);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  license
    .command("workloads")
    .description("List license workloads by type")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(auth, "/api/v1/license");
        const data = (await response.json()) as LicenseData;

        const workloads = data.instanceLicenseSummary?.workload || [];
        const byType: Record<string, unknown[]> = {};
        for (const w of workloads) {
          const type = w.type as string;
          if (!byType[type]) byType[type] = [];
          byType[type].push(w);
        }

        if (format === "json") {
          printOutput(format, byType);
        } else {
          printOutput(format, workloads as Record<string, unknown>[]);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
