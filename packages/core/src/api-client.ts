import https from "node:https";
import type { AuthState } from "./auth-state.js";

export interface ApiClientConfig {
  /** Default port for the product API */
  port: number;
  /** Path to the OAuth2 token endpoint (e.g., "/api/oauth2/token") */
  tokenPath: string;
  /** API path prefix (e.g., "/api/v1/") — informational, not enforced */
  apiPrefix?: string;
  /** Optional version header name (e.g., "x-api-version") */
  versionHeader?: string;
  /** Optional version header value (e.g., "1.3-rev1") */
  versionValue?: string;
  /** Environment variable name for reject-unauthorized setting */
  rejectUnauthorizedEnvVar?: string;
  /** Product name for error messages */
  productName: string;
}

export interface ApiFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiClient {
  apiFetch: (auth: AuthState, path: string, options?: ApiFetchOptions) => Promise<Response>;
  authRequest: (host: string, username: string, password: string) => Promise<string>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const rejectUnauthorized =
    process.env[config.rejectUnauthorizedEnvVar || "REJECT_UNAUTHORIZED"] === "true";
  const agent = new https.Agent({ rejectUnauthorized });

  async function apiFetch(
    auth: AuthState,
    path: string,
    options: ApiFetchOptions = {},
  ): Promise<Response> {
    const { method = "GET", headers = {}, body } = options;
    const url = `https://${auth.host}:${config.port}${path}`;

    const requestHeaders: Record<string, string> = {
      accept: "application/json",
      Authorization: `Bearer ${auth.token}`,
      ...headers,
    };

    if (config.versionHeader && config.versionValue) {
      requestHeaders[config.versionHeader] = config.versionValue;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body,
      // @ts-expect-error Node.js fetch supports agent via dispatcher
      dispatcher: agent,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `${config.productName} API error ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`,
      );
    }

    return response;
  }

  async function authRequest(
    host: string,
    username: string,
    password: string,
  ): Promise<string> {
    const url = `https://${host}:${config.port}${config.tokenPath}`;

    const requestHeaders: Record<string, string> = {
      accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (config.versionHeader && config.versionValue) {
      requestHeaders[config.versionHeader] = config.versionValue;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: new URLSearchParams({
        grant_type: "password",
        username,
        password,
      }).toString(),
      // @ts-expect-error Node.js fetch supports agent via dispatcher
      dispatcher: agent,
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  return { apiFetch, authRequest };
}
