import { Command } from "commander";
import { registerK10ClustersCommand } from "./clusters.js";
import { registerK10ApplicationsCommand } from "./applications.js";
import { registerK10PoliciesCommand } from "./policies.js";
import { registerK10ProfilesCommand } from "./profiles.js";
import { registerK10RestorePointsCommand } from "./restore-points.js";
import { registerK10ComplianceCommand } from "./compliance.js";
import { registerK10ActionsCommand } from "./actions.js";
import { registerK10BackupCommand } from "./backup.js";
import { registerK10RestoreCommand } from "./restore.js";

export function registerK10Commands(program: Command): void {
  const k10 = program
    .command("k10")
    .description("Kasten K10 Kubernetes data management commands");

  registerK10ClustersCommand(k10, program);
  registerK10ApplicationsCommand(k10, program);
  registerK10PoliciesCommand(k10, program);
  registerK10ProfilesCommand(k10, program);
  registerK10RestorePointsCommand(k10, program);
  registerK10ComplianceCommand(k10, program);
  registerK10ActionsCommand(k10, program);
  registerK10BackupCommand(k10, program);
  registerK10RestoreCommand(k10, program);
}
