import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {};

export const handler = withAuth(async (_params, auth) => {
  const response = await vbrFetch(auth, "/api/v1/serverInfo");
  const data = await response.json();
  return toolSuccess(data);
});
