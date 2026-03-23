import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createApiClient } from "@veeam-mcp/core";
import type { AuthState, ApiFetchOptions } from "@veeam-mcp/core";

const SESSION_DIR = path.join(os.homedir(), ".config", "vbr");
const SESSION_FILE = path.join(SESSION_DIR, "session.json");

const client = createApiClient({
  port: 9419,
  tokenPath: "/api/oauth2/token",
  apiPrefix: "/api/v1/",
  versionHeader: "x-api-version",
  versionValue: "1.3-rev1",
  rejectUnauthorizedEnvVar: "VBR_REJECT_UNAUTHORIZED",
  productName: "VBR",
});

export interface Session {
  host: string;
  token: string;
  username: string;
  createdAt: string;
}

/** Save a session to ~/.config/vbr/session.json */
export function saveSession(session: Session): void {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), "utf-8");
  fs.chmodSync(SESSION_FILE, 0o600);
}

/** Load session from disk, returns null if not found */
export function loadSession(): Session | null {
  try {
    const raw = fs.readFileSync(SESSION_FILE, "utf-8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/** Delete the saved session */
export function clearSession(): void {
  try {
    fs.unlinkSync(SESSION_FILE);
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Resolve auth from:
 * 1. --host flag (combined with env vars for credentials)
 * 2. Environment variables (VBR_HOST, VBR_USERNAME, VBR_PASSWORD)
 * 3. Saved session file
 */
export function resolveAuth(hostOverride?: string): AuthState {
  // Try env-based auth first if all three env vars are set
  const envHost = hostOverride || process.env.VBR_HOST;
  const envUser = process.env.VBR_USERNAME;
  const envPass = process.env.VBR_PASSWORD;

  // If env vars provide a complete set, we'd need to login first.
  // For CLI usage, we rely on saved session tokens.

  // Try saved session
  const session = loadSession();
  if (session) {
    const host = hostOverride || session.host;
    return { host, token: session.token };
  }

  // If we have env host but no session, give a clear error
  if (envHost) {
    throw new Error(
      "No saved session found. Run `vbr auth login` first, or set VBR_HOST, VBR_USERNAME, and VBR_PASSWORD environment variables and run `vbr auth login`.",
    );
  }

  throw new Error(
    "Not authenticated. Run `vbr auth login --host <host> --username <user> --password <pass>` to connect.",
  );
}

/** Authenticate and get a token */
export async function login(host: string, username: string, password: string): Promise<Session> {
  const token = await client.authRequest(host, username, password);
  const session: Session = {
    host,
    token,
    username,
    createdAt: new Date().toISOString(),
  };
  saveSession(session);
  return session;
}

/** Make an authenticated API call */
export function apiFetch(
  auth: AuthState,
  apiPath: string,
  options?: ApiFetchOptions,
): Promise<Response> {
  return client.apiFetch(auth, apiPath, options);
}
