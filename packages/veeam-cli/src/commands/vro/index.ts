import { Command } from "commander";
import { registerVroPlansCommand } from "./plans.js";
import { registerVroReadinessCommand } from "./readiness.js";
import { registerVroLocationsCommand } from "./locations.js";
import { registerVroScopesCommand } from "./scopes.js";
import { registerVroRuntimeCommand } from "./runtime.js";
import { registerVroLicenseCommand } from "./license.js";
import { registerVroFailoverCommand } from "./failover.js";

export function registerVroCommands(program: Command): void {
  const vro = program
    .command("vro")
    .description("Veeam Recovery Orchestrator commands");

  registerVroPlansCommand(vro, program);
  registerVroReadinessCommand(vro, program);
  registerVroLocationsCommand(vro, program);
  registerVroScopesCommand(vro, program);
  registerVroRuntimeCommand(vro, program);
  registerVroLicenseCommand(vro, program);
  registerVroFailoverCommand(vro, program);
}
