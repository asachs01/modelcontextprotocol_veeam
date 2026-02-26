import { toolError } from "./tool-helpers.js";
import type { ToolResponse } from "./tool-helpers.js";

export interface ElicitationRequest {
  fields: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

/**
 * Builds a structured "needs input" response when credentials are missing.
 * This serves as a pragmatic elicitation pattern until the MCP SDK adds
 * native server.elicit() support.
 */
export function elicitCredentials(missing: string[]): ToolResponse {
  const fields = missing.map((name) => ({
    name,
    description: `Required: ${name}`,
    required: true,
  }));

  return toolError(
    `Missing credentials. Please provide the following:\n${fields.map((f) => `  - ${f.name}: ${f.description}`).join("\n")}\n\nYou can set these as environment variables or pass them as tool parameters.`,
  );
}
