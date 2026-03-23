import { Command } from "commander";
import { resolveAuth, apiFetch } from "../../client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

interface VspcPaginatedResponse {
  meta: { pagingInfo: { total: number; count: number; offset: number } };
  data: Array<Record<string, unknown>>;
}

export function registerVspcCompaniesCommand(parent: Command, program: Command): void {
  const companies = parent.command("companies").description("Managed companies");

  companies
    .command("list")
    .description("List managed companies")
    .option("--limit <number>", "Maximum number of companies", "100")
    .option("--offset <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vspc", program.opts().host);
        const response = await apiFetch(
          "vspc",
          auth,
          `/api/v3/organizations/companies?limit=${opts.limit}&offset=${opts.offset}`,
        );
        const data = (await response.json()) as VspcPaginatedResponse;
        const paging = data.meta?.pagingInfo ?? { total: 0, count: 0, offset: 0 };

        if (format === "json") {
          printOutput(format, { pagination: paging, companies: data.data });
        } else {
          console.log(`Showing ${paging.count} of ${paging.total} companies\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  const company = parent.command("company").description("Single company operations");

  company
    .command("get")
    .description("Get details for a specific company")
    .argument("<uid>", "Company UID")
    .action(async (uid: string) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vspc", program.opts().host);
        const response = await apiFetch(
          "vspc",
          auth,
          `/api/v3/organizations/companies/${uid}`,
        );
        const data = await response.json();
        printOutput(format, data as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  company
    .command("usage")
    .description("Get resource usage for companies")
    .option("--limit <number>", "Maximum number of records", "100")
    .option("--offset <number>", "Number to skip", "0")
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth("vspc", program.opts().host);
        const response = await apiFetch(
          "vspc",
          auth,
          `/api/v3/organizations/companies/usage?limit=${opts.limit}&offset=${opts.offset}`,
        );
        const data = (await response.json()) as VspcPaginatedResponse;
        const paging = data.meta?.pagingInfo ?? { total: 0, count: 0, offset: 0 };

        if (format === "json") {
          printOutput(format, { pagination: paging, usage: data.data });
        } else {
          console.log(`Showing ${paging.count} of ${paging.total} usage records\n`);
          printOutput(format, data.data);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
