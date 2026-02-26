import { getAuth } from "./auth-state.js";
import type { AuthState } from "./auth-state.js";

export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function toolSuccess(data: unknown): ToolResponse {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text }] };
}

export function toolError(message: string): ToolResponse {
  return { content: [{ type: "text", text: message }], isError: true };
}

export function withAuth<T>(
  handler: (params: T, auth: AuthState) => Promise<ToolResponse>,
): (params: T) => Promise<ToolResponse> {
  return async (params: T) => {
    try {
      const auth = getAuth();
      return await handler(params, auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return toolError(message);
    }
  };
}
