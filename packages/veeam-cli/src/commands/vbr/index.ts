import { Command } from "commander";
import { registerVbrServerCommand } from "./server.js";
import { registerVbrSessionsCommand } from "./sessions.js";
import { registerVbrRepositoriesCommand } from "./repositories.js";
import { registerVbrProxiesCommand } from "./proxies.js";
import { registerVbrObjectsCommand } from "./objects.js";
import { registerVbrRestorePointsCommand } from "./restore-points.js";
import { registerVbrMalwareCommand } from "./malware.js";
import { registerVbrProtectionGroupsCommand } from "./protection-groups.js";
import { registerVbrConfigBackupCommand } from "./config-backup.js";
import { registerVbrLicenseCommand } from "./license.js";

export function registerVbrCommands(program: Command): void {
  const vbr = program
    .command("vbr")
    .description("Veeam Backup & Replication commands");

  registerVbrServerCommand(vbr, program);
  registerVbrSessionsCommand(vbr, program);
  registerVbrRepositoriesCommand(vbr, program);
  registerVbrProxiesCommand(vbr, program);
  registerVbrObjectsCommand(vbr, program);
  registerVbrRestorePointsCommand(vbr, program);
  registerVbrMalwareCommand(vbr, program);
  registerVbrProtectionGroupsCommand(vbr, program);
  registerVbrConfigBackupCommand(vbr, program);
  registerVbrLicenseCommand(vbr, program);
}
