import { createApiClient } from "@veeam-mcp/core";
import type { AuthState, ApiFetchOptions } from "@veeam-mcp/core";

const client = createApiClient({
  port: 9419,
  tokenPath: "/api/oauth2/token",
  apiPrefix: "/api/v1/",
  versionHeader: "x-api-version",
  versionValue: "1.3-rev1",
  rejectUnauthorizedEnvVar: "VBR_REJECT_UNAUTHORIZED",
  productName: "VBR",
});

// Re-export with VBR-specific names for existing tool compatibility
export type VbrAuth = AuthState;
export type VbrFetchOptions = ApiFetchOptions;

export function vbrFetch(
  auth: AuthState,
  path: string,
  options?: ApiFetchOptions,
): Promise<Response> {
  return client.apiFetch(auth, path, options);
}

export function vbrAuthRequest(
  host: string,
  username: string,
  password: string,
): Promise<string> {
  return client.authRequest(host, username, password);
}
