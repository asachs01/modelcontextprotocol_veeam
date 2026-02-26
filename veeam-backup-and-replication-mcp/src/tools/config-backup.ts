import { z } from "zod";
import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const getConfigBackupSchema = {};

export const getConfigBackupHandler = withAuth(async (_params, auth) => {
  const response = await vbrFetch(auth, "/api/v1/configBackup");
  const data = (await response.json()) as {
    isEnabled: boolean;
    backupRepositoryId?: string;
    lastSuccessfulBackup?: { lastSuccessfulTime?: string };
  };

  let suggestion = "";
  if (data.isEnabled && data.backupRepositoryId) {
    const lastSuccess = data.lastSuccessfulBackup?.lastSuccessfulTime;
    suggestion = "\n\nConfiguration Backup is correctly configured. Use `start-config-backup` to trigger a backup now.";
    suggestion += lastSuccess
      ? ` (Last successful backup: ${lastSuccess})`
      : " (No successful backup recorded yet)";
  } else {
    suggestion = "\n\nWarning: Configuration Backup is NOT fully configured (disabled or missing repository).";
  }

  return toolSuccess(JSON.stringify(data, null, 2) + suggestion);
});

export const startConfigBackupSchema = {
  confirmation: z.boolean().describe("You MUST ask the user for confirmation before running this. Set to true if user confirmed."),
};

export const startConfigBackupHandler = withAuth(
  async (params: { confirmation: boolean }, auth): Promise<ToolResponse> => {
    if (params.confirmation !== true) {
      return toolError("Action Aborted: User confirmation is required to start a configuration backup.");
    }

    const response = await vbrFetch(auth, "/api/v1/configBackup/backup", { method: "POST" });

    let resultText = "Configuration backup started successfully.";
    try {
      const body = await response.text();
      if (body) resultText += "\nResponse: " + body;
    } catch {
      // Ignore body parse error
    }

    return toolSuccess(resultText);
  },
);
