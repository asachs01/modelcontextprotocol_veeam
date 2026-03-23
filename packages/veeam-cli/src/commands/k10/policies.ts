import { Command } from "commander";
import { getK10Client } from "./k10-client.js";
import { printOutput, printError, printSuccess } from "../../output.js";
import type { OutputFormat } from "../../output.js";

export function registerK10PoliciesCommand(parent: Command, program: Command): void {
  const policies = parent.command("policies").description("K10 backup policies");

  policies
    .command("list")
    .description("List K10 policies")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();
        const response = await api.listNamespacedCustomObject({
          group: "config.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "policies",
        });
        const body = response as { items: Array<Record<string, unknown>> };
        const items = body.items || [];

        const rows = items.map((item) => {
          const metadata = item.metadata as Record<string, unknown> | undefined;
          const spec = item.spec as Record<string, unknown> | undefined;
          return {
            name: metadata?.name,
            namespace: metadata?.namespace,
            frequency: spec?.frequency,
            actions: spec?.actions,
          };
        });

        if (format === "json") {
          printOutput(format, { policies: rows });
        } else {
          console.log(`Found ${rows.length} policy/policies\n`);
          printOutput(format, rows, { columns: ["name", "namespace", "frequency"] });
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  policies
    .command("run")
    .description("Trigger a policy run")
    .argument("<policy-name>", "Name of the policy to run")
    .action(async (policyName: string) => {
      const format = program.opts().format as OutputFormat;
      try {
        const { api, namespace } = getK10Client();

        const runAction = {
          apiVersion: "actions.kio.kasten.io/v1alpha1",
          kind: "RunAction",
          metadata: {
            generateName: "run-" + policyName + "-",
            namespace,
          },
          spec: {
            subject: {
              apiVersion: "config.kio.kasten.io/v1alpha1",
              kind: "Policy",
              name: policyName,
              namespace,
            },
          },
        };

        const response = await api.createNamespacedCustomObject({
          group: "actions.kio.kasten.io",
          version: "v1alpha1",
          namespace,
          plural: "runactions",
          body: runAction,
        });
        const result = response as Record<string, unknown>;
        const metadata = result.metadata as Record<string, unknown> | undefined;

        if (format === "json") {
          printOutput(format, { actionName: metadata?.name, action: result });
        } else {
          printSuccess(`Policy run initiated for "${policyName}" (action: ${metadata?.name})`);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
