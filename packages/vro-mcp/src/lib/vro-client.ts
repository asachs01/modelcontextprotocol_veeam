import { createApiClient } from "@veeam-mcp/core";
import type { AuthState, ApiFetchOptions } from "@veeam-mcp/core";

const client = createApiClient({
  port: 9898,
  tokenPath: "/api/token",
  apiPrefix: "/api/v7.21/",
  rejectUnauthorizedEnvVar: "VRO_REJECT_UNAUTHORIZED",
  productName: "VRO",
});

// Re-export with VRO-specific names for tool compatibility
export type VroAuth = AuthState;
export type VroFetchOptions = ApiFetchOptions;

export function vroFetch(
  auth: AuthState,
  path: string,
  options?: ApiFetchOptions,
): Promise<Response> {
  return client.apiFetch(auth, path, options);
}

export function vroAuthRequest(
  host: string,
  username: string,
  password: string,
): Promise<string> {
  return client.authRequest(host, username, password);
}
