import { createApiClient } from "@veeam-mcp/core";
import type { AuthState, ApiFetchOptions } from "@veeam-mcp/core";

const client = createApiClient({
  port: 1239,
  tokenPath: "/api/token",
  apiPrefix: "/api/v2/",
  productName: "Veeam ONE",
  rejectUnauthorizedEnvVar: "VONE_REJECT_UNAUTHORIZED",
});

// Re-export with VONE-specific names for tool compatibility
export type VoneAuth = AuthState;
export type VoneFetchOptions = ApiFetchOptions;

export function voneFetch(
  auth: AuthState,
  path: string,
  options?: ApiFetchOptions,
): Promise<Response> {
  return client.apiFetch(auth, path, options);
}

export function voneAuthRequest(
  host: string,
  username: string,
  password: string,
): Promise<string> {
  return client.authRequest(host, username, password);
}
