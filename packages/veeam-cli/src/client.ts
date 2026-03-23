import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createApiClient } from "@veeam-mcp/core";
import type { AuthState, ApiFetchOptions, ApiClient } from "@veeam-mcp/core";

/** Supported product identifiers */
export type Product = "vbr" | "vone" | "vspc" | "vro" | "k10";

export interface Session {
  host: string;
  token: string;
  username: string;
  createdAt: string;
}

/** Per-product API client configurations */
const productConfigs: Record<Exclude<Product, "k10">, Parameters<typeof createApiClient>[0]> = {
  vbr: {
    port: 9419,
    tokenPath: "/api/oauth2/token",
    apiPrefix: "/api/v1/",
    versionHeader: "x-api-version",
    versionValue: "1.3-rev1",
    rejectUnauthorizedEnvVar: "VBR_REJECT_UNAUTHORIZED",
    productName: "VBR",
  },
  vone: {
    port: 1239,
    tokenPath: "/api/token",
    apiPrefix: "/api/v2/",
    rejectUnauthorizedEnvVar: "VONE_REJECT_UNAUTHORIZED",
    productName: "Veeam ONE",
  },
  vspc: {
    port: 1280,
    tokenPath: "/api/v3/token",
    apiPrefix: "/api/v3/",
    versionHeader: "x-client-version",
    versionValue: "3.6",
    rejectUnauthorizedEnvVar: "VSPC_REJECT_UNAUTHORIZED",
    productName: "VSPC",
  },
  vro: {
    port: 9898,
    tokenPath: "/api/token",
    apiPrefix: "/api/v7.21/",
    rejectUnauthorizedEnvVar: "VRO_REJECT_UNAUTHORIZED",
    productName: "VRO",
  },
};

/** Lazily-created API clients, one per product */
const clients: Partial<Record<Exclude<Product, "k10">, ApiClient>> = {};

function getClient(product: Exclude<Product, "k10">): ApiClient {
  if (!clients[product]) {
    clients[product] = createApiClient(productConfigs[product]);
  }
  return clients[product];
}

// ---------------------------------------------------------------------------
// Session persistence — one file per product under ~/.config/veeam/
// ---------------------------------------------------------------------------

const CONFIG_DIR = path.join(os.homedir(), ".config", "veeam");

function sessionPath(product: Product): string {
  return path.join(CONFIG_DIR, `${product}.json`);
}

/** Save a session for a specific product */
export function saveSession(product: Product, session: Session): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const file = sessionPath(product);
  fs.writeFileSync(file, JSON.stringify(session, null, 2), "utf-8");
  fs.chmodSync(file, 0o600);
}

/** Load session for a product, returns null if not found */
export function loadSession(product: Product): Session | null {
  try {
    const raw = fs.readFileSync(sessionPath(product), "utf-8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/** Delete the saved session for a product */
export function clearSession(product: Product): void {
  try {
    fs.unlinkSync(sessionPath(product));
  } catch {
    // Ignore if file doesn't exist
  }
}

// ---------------------------------------------------------------------------
// Environment variable names per product
// ---------------------------------------------------------------------------

const envPrefix: Record<Product, string> = {
  vbr: "VBR",
  vone: "VONE",
  vspc: "VSPC",
  vro: "VRO",
  k10: "K10",
};

/**
 * Resolve auth from:
 * 1. --host flag (combined with saved token)
 * 2. Saved session file
 */
export function resolveAuth(product: Product, hostOverride?: string): AuthState {
  const prefix = envPrefix[product];
  const session = loadSession(product);

  if (session) {
    const host = hostOverride || session.host;
    return { host, token: session.token };
  }

  const envHost = hostOverride || process.env[`${prefix}_HOST`];
  if (envHost) {
    throw new Error(
      `No saved session for ${product}. Run \`veeam auth ${product} login\` first.`,
    );
  }

  throw new Error(
    `Not authenticated to ${product}. Run \`veeam auth ${product} login --host <host> --username <user> --password <pass>\`.`,
  );
}

/** Authenticate and get a token (REST-based products only) */
export async function login(
  product: Exclude<Product, "k10">,
  host: string,
  username: string,
  password: string,
): Promise<Session> {
  const client = getClient(product);
  const token = await client.authRequest(host, username, password);
  const session: Session = {
    host,
    token,
    username,
    createdAt: new Date().toISOString(),
  };
  saveSession(product, session);
  return session;
}

/** Make an authenticated API call for a REST-based product */
export function apiFetch(
  product: Exclude<Product, "k10">,
  auth: AuthState,
  apiPath: string,
  options?: ApiFetchOptions,
): Promise<Response> {
  const client = getClient(product);
  return client.apiFetch(auth, apiPath, options);
}
