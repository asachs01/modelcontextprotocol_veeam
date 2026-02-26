import { voneFetch } from "../lib/vone-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {};

export const handler = withAuth(async (_params, auth) => {
  const response = await voneFetch(auth, "/api/v2/licensing/usage");
  const data = await response.json();
  return toolSuccess(data);
});
