import { Command } from "commander";
import { login, clearSession, loadSession } from "../client.js";
import { printSuccess, printError, printOutput } from "../output.js";
import type { OutputFormat } from "../output.js";

export function registerAuthCommand(program: Command): void {
  const auth = program.command("auth").description("Authentication management");

  auth
    .command("login")
    .description("Authenticate with a VBR server")
    .requiredOption("--host <host>", "VBR server hostname or IP", process.env.VBR_HOST)
    .requiredOption("--username <username>", "Username (domain\\\\user format)", process.env.VBR_USERNAME)
    .requiredOption("--password <password>", "Password", process.env.VBR_PASSWORD)
    .action(async (opts) => {
      const format = program.opts().format as OutputFormat;
      try {
        const session = await login(opts.host, opts.username, opts.password);
        if (format === "json") {
          printOutput(format, {
            status: "authenticated",
            host: session.host,
            username: session.username,
            createdAt: session.createdAt,
          });
        } else {
          printSuccess(`Authenticated to ${session.host} as ${session.username}`);
          printSuccess(`Session saved to ~/.config/vbr/session.json`);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  auth
    .command("logout")
    .description("Clear saved session")
    .action(() => {
      const format = program.opts().format as OutputFormat;
      clearSession();
      if (format === "json") {
        printOutput(format, { status: "logged_out" });
      } else {
        printSuccess("Session cleared.");
      }
    });

  auth
    .command("status")
    .description("Show current auth status")
    .action(() => {
      const format = program.opts().format as OutputFormat;
      const session = loadSession();
      if (session) {
        printOutput(format, {
          authenticated: true,
          host: session.host,
          username: session.username,
          createdAt: session.createdAt,
        });
      } else {
        if (format === "json") {
          printOutput(format, { authenticated: false });
        } else {
          printError("No saved session. Run `vbr auth login` to authenticate.");
        }
      }
    });
}
