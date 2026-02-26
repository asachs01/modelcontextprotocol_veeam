import { createApiClient } from "@veeam-mcp/core";
import type { AuthState, ApiFetchOptions } from "@veeam-mcp/core";

const client = createApiClient({
  port: 1280,
  tokenPath: "/api/v3/token",
  apiPrefix: "/api/v3/",
  versionHeader: "x-client-version",
  versionValue: "3.6",
  rejectUnauthorizedEnvVar: "VSPC_REJECT_UNAUTHORIZED",
  productName: "VSPC",
});

// Re-export with VSPC-specific names for tool compatibility
export type VspcAuth = AuthState;
export type VspcFetchOptions = ApiFetchOptions;

export function vspcFetch(
  auth: AuthState,
  path: string,
  options?: ApiFetchOptions,
): Promise<Response> {
  return client.apiFetch(auth, path, options);
}

export function vspcAuthRequest(
  host: string,
  username: string,
  password: string,
): Promise<string> {
  return client.authRequest(host, username, password);
}
