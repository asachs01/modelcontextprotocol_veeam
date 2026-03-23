import { Command } from "commander";
import { registerVoneAlarmsCommand } from "./alarms.js";
import { registerVoneAlarmTemplatesCommand } from "./alarm-templates.js";
import { registerVoneRepositoriesCommand } from "./repositories.js";
import { registerVoneBestPracticesCommand } from "./best-practices.js";
import { registerVoneVsphereCommand } from "./vsphere.js";
import { registerVoneLicenseCommand } from "./license.js";
import { registerVoneServerCommand } from "./server.js";

export function registerVoneCommands(program: Command): void {
  const vone = program
    .command("vone")
    .description("Veeam ONE monitoring and analytics commands");

  registerVoneAlarmsCommand(vone, program);
  registerVoneAlarmTemplatesCommand(vone, program);
  registerVoneRepositoriesCommand(vone, program);
  registerVoneBestPracticesCommand(vone, program);
  registerVoneVsphereCommand(vone, program);
  registerVoneLicenseCommand(vone, program);
  registerVoneServerCommand(vone, program);
}
