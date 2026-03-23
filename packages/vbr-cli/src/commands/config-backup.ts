import { Command } from "commander";
import { resolveAuth, apiFetch } from "../client.js";
import { printOutput, printError, printSuccess } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerConfigBackupCommand(program: Command): void {
  const cb = program.command("config-backup").description("Configuration backup");

  cb.command("get")
    .description("Get configuration backup status")
    .action(async () => {
      const format = program.opts().format as OutputFormat;
      try {
        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(auth, "/api/v1/configBackup");
        const data = (await response.json()) as Record<string, unknown>;
        printOutput(format, data);
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  cb.command("start")
    .description("Start a configuration backup")
    .option("--confirm", "Confirm you want to start the backup", false)
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        if (!opts.confirm) {
          printError("You must pass --confirm to start a configuration backup.");
          process.exit(1);
        }

        const auth = resolveAuth(program.opts().host);
        const response = await apiFetch(auth, "/api/v1/configBackup/backup", { method: "POST" });

        let body = "";
        try {
          body = await response.text();
        } catch {
          // Ignore
        }

        if (format === "json") {
          printOutput(format, { status: "started", response: body || null });
        } else {
          printSuccess("Configuration backup started successfully.");
          if (body) console.log(body);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
