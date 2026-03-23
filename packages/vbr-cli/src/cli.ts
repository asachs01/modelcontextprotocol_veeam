#!/usr/bin/env node

import { Command } from "commander";
import { registerAuthCommand } from "./commands/auth.js";
import { registerServerCommand } from "./commands/server.js";
import { registerSessionsCommand } from "./commands/sessions.js";
import { registerRepositoriesCommand } from "./commands/repositories.js";
import { registerProxiesCommand } from "./commands/proxies.js";
import { registerObjectsCommand } from "./commands/objects.js";
import { registerRestorePointsCommand } from "./commands/restore-points.js";
import { registerMalwareCommand } from "./commands/malware.js";
import { registerProtectionGroupsCommand } from "./commands/protection-groups.js";
import { registerConfigBackupCommand } from "./commands/config-backup.js";
import { registerLicenseCommand } from "./commands/license.js";

const program = new Command();

program
  .name("vbr")
  .description("CLI for Veeam Backup & Replication REST API")
  .version("1.0.0")
  .option("--format <format>", "Output format: json or table", "table")
  .option("--host <host>", "VBR server hostname (overrides saved session)");

registerAuthCommand(program);
registerServerCommand(program);
registerSessionsCommand(program);
registerRepositoriesCommand(program);
registerProxiesCommand(program);
registerObjectsCommand(program);
registerRestorePointsCommand(program);
registerMalwareCommand(program);
registerProtectionGroupsCommand(program);
registerConfigBackupCommand(program);
registerLicenseCommand(program);

program.parse();
