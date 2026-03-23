import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10ComplianceCommand(parent: Command, program: Command): void {
  const compliance = parent.command("compliance").description("Compliance reporting");

  compliance
    .command("get")
    .description("Get the latest compliance report")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();
        const response = await api.listNamespacedCustomObject({
          group: "reporting.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "compliancereports",
        });
        const body = response as { items: Array<Record<string, unknown>> };
        const items = body.items || [];

        if (items.length === 0) {
          if (format === "json") {
            printOutput(format, { report: null });
          } else {
            console.log("No compliance reports found.");
          }
          return;
        }

        // Return the latest report
        const latest = items[items.length - 1];
        printOutput(format, latest as Record<string, unknown>);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
