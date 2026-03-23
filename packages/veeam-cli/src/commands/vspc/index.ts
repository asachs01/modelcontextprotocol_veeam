import { Command } from "commander";
import { registerVspcCompaniesCommand } from "./companies.js";
import { registerVspcBackupServersCommand } from "./backup-servers.js";
import { registerVspcJobsCommand } from "./jobs.js";
import { registerVspcVmsCommand } from "./vms.js";
import { registerVspcRepositoriesCommand } from "./repositories.js";
import { registerVspcLicenseCommand } from "./license.js";
import { registerVspcAlarmsCommand } from "./alarms.js";

export function registerVspcCommands(program: Command): void {
  const vspc = program
    .command("vspc")
    .description("Veeam Service Provider Console commands");

  registerVspcCompaniesCommand(vspc, program);
  registerVspcBackupServersCommand(vspc, program);
  registerVspcJobsCommand(vspc, program);
  registerVspcVmsCommand(vspc, program);
  registerVspcRepositoriesCommand(vspc, program);
  registerVspcLicenseCommand(vspc, program);
  registerVspcAlarmsCommand(vspc, program);
}
