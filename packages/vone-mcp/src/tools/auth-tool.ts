import { z } from "zod";
import { voneAuthRequest } from "../lib/vone-client.js";
import { setAuth } from "../lib/auth-state.js";
import { toolSuccess, toolError } from "../lib/tool-helpers.js";
import type { ToolResponse } from "../lib/tool-helpers.js";

export const schema = {
  host: z.string().describe("Veeam ONE server hostname or IP").optional(),
  username: z.string().describe("Username in domain\\\\user format").optional(),
  password: z.string().describe("Password").optional(),
};

export async function handler(params: {
  host?: string;
  username?: string;
  password?: string;
}): Promise<ToolResponse> {
  try {
    const host = params.host || process.env.VONE_HOST;
    const username = params.username || process.env.VONE_USERNAME;
    const password = params.password || process.env.VONE_PASSWORD;

    if (!host || !username || !password) {
      const missing: string[] = [];
      if (!host) missing.push("host (VONE_HOST)");
      if (!username) missing.push("username (VONE_USERNAME)");
      if (!password) missing.push("password (VONE_PASSWORD)");
      return toolError(
        `Missing credentials: ${missing.join(", ")}. ` +
          "Provide them as tool parameters or set the corresponding environment variables.",
      );
    }

    const token = await voneAuthRequest(host, username, password);
    setAuth({ host, token });

    return toolSuccess(
      `Authentication successful. Connected to ${host}. Token received and stored for subsequent API calls.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return toolError(`Authentication failed: ${message}`);
  }
}
