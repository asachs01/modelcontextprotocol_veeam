import { z } from "zod";
import { vspcFetch } from "../lib/vspc-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

export const schema = {
  uid: z.string().describe("The unique identifier (UID) of the company"),
};

export const handler = withAuth(async (params: { uid: string }, auth) => {
  const response = await vspcFetch(auth, `/api/v3/organizations/companies/${params.uid}`);
  const data = await response.json();
  return toolSuccess(data);
});
