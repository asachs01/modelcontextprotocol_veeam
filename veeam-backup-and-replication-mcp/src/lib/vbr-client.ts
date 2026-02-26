import https from "node:https";
import type { VbrAuth } from "./auth-state.js";

const rejectUnauthorized = process.env.VBR_REJECT_UNAUTHORIZED === "true";

const agent = new https.Agent({ rejectUnauthorized });

const DEFAULT_API_VERSION = "1.3-rev1";

export interface VbrFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  apiVersion?: string;
}

export async function vbrFetch(
  auth: VbrAuth,
  path: string,
  options: VbrFetchOptions = {},
): Promise<Response> {
  const { method = "GET", headers = {}, body, apiVersion = DEFAULT_API_VERSION } = options;

  const url = `https://${auth.host}:9419${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      "x-api-version": apiVersion,
      Authorization: `Bearer ${auth.token}`,
      ...headers,
    },
    body,
    // @ts-expect-error Node.js fetch supports agent via dispatcher
    dispatcher: agent,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `VBR API error ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`,
    );
  }

  return response;
}

export async function vbrAuthRequest(
  host: string,
  username: string,
  password: string,
): Promise<string> {
  const url = `https://${host}:9419/api/oauth2/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-api-version": DEFAULT_API_VERSION,
      "Content-Type": "application/x-www-form-urlencoded",
    },
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
