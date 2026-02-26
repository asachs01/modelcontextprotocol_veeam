import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAuthOrNull } from "./auth-state.js";
import { vbrFetch } from "./vbr-client.js";

let pollerInterval: ReturnType<typeof setInterval> | null = null;
let lastPollTime: string | null = null;

const POLL_INTERVAL_MS = parseInt(process.env.VBR_POLL_INTERVAL_MS || "30000", 10);

async function poll(server: McpServer): Promise<void> {
  const auth = getAuthOrNull();
  if (!auth) return; // Not authenticated yet, skip

  const now = new Date().toISOString();

  try {
    // Check for completed backup sessions
    const sessionsResponse = await vbrFetch(
      auth,
      `/api/v1/sessions?limit=10&typeFilter=BackupJob`,
    );
    const sessionsData = (await sessionsResponse.json()) as {
      data: Array<{
        id: string;
        name: string;
        state: string;
        endTime?: string;
        result?: { result: string };
      }>;
    };

    for (const session of sessionsData.data) {
      if (
        session.state === "Stopped" &&
        session.endTime &&
        lastPollTime &&
        session.endTime > lastPollTime
      ) {
        await server.server.sendLoggingMessage({
          level: "info",
          data: `Backup completed: ${session.name} (${session.result?.result || "unknown"})`,
        });
      }
    }

    // Check for malware events
    const malwareResponse = await vbrFetch(auth, `/api/v1/malwareDetection/events?limit=10`);
    const malwareData = (await malwareResponse.json()) as {
      data: Array<{
        id: string;
        severity: string;
        creationTimeUtc?: string;
        machine?: { displayName?: string };
      }>;
    };

    for (const event of malwareData.data) {
      if (event.creationTimeUtc && lastPollTime && event.creationTimeUtc > lastPollTime) {
        await server.server.sendLoggingMessage({
          level: "warning",
          data: `Malware detected on ${event.machine?.displayName || "unknown"} (severity: ${event.severity})`,
        });
      }
    }

    // Check for low repository space
    const reposResponse = await vbrFetch(
      auth,
      `/api/v1/backupInfrastructure/repositories/states?limit=100`,
    );
    const reposData = (await reposResponse.json()) as {
      data: Array<{
        name: string;
        capacityGB: number;
        freeGB: number;
        isOnline: boolean;
      }>;
    };

    for (const repo of reposData.data) {
      if (repo.capacityGB > 0 && repo.isOnline) {
        const freePercent = Math.round((repo.freeGB / repo.capacityGB) * 100);
        if (freePercent <= 20) {
          await server.server.sendLoggingMessage({
            level: "warning",
            data: `Repository "${repo.name}" low on space: ${freePercent}% free (${repo.freeGB}GB / ${repo.capacityGB}GB)`,
          });
        }
      }
    }
  } catch (error) {
    process.stderr.write(
      `[vbr-mcp] Event poller error: ${error instanceof Error ? error.message : error}\n`,
    );
  }

  lastPollTime = now;
}

export function startEventPoller(server: McpServer): void {
  if (pollerInterval) return;
  pollerInterval = setInterval(() => void poll(server), POLL_INTERVAL_MS);
  // Run first poll immediately
  void poll(server);
}

export function stopEventPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}
