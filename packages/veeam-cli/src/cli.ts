#!/usr/bin/env node

import { Command } from "commander";
import { registerAuthCommand } from "./commands/auth.js";
import { registerVbrCommands } from "./commands/vbr/index.js";
import { registerVoneCommands } from "./commands/vone/index.js";
import { registerVspcCommands } from "./commands/vspc/index.js";
import { registerVroCommands } from "./commands/vro/index.js";
import { registerK10Commands } from "./commands/k10/index.js";

const program = new Command();

program
  .name("veeam")
  .description("Unified CLI for Veeam products — VBR, VONE, VSPC, VRO, and K10")
  .version("1.0.0")
  .option("--format <format>", "Output format: json or table", "table")
  .option("--host <host>", "Server hostname (overrides saved session)");

registerAuthCommand(program);
registerVbrCommands(program);
registerVoneCommands(program);
registerVspcCommands(program);
registerVroCommands(program);
registerK10Commands(program);

program.parse();
