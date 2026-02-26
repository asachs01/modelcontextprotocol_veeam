import { vroFetch } from "../lib/vro-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {};

export const handler = withAuth(async (_params, auth) => {
  const response = await vroFetch(auth, "/api/v7.21/RecoveryLocations");
  const data = await response.json();
  return toolSuccess(data);
});
