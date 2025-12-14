import fetch from "node-fetch";
import https from "https";
import { z } from "zod";

// Create an HTTPS agent that ignores self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default function (server) {
  // Add protection groups tool
  server.tool(
    "get-protection-groups",
    {
      limit: z.number().min(1).max(1000).default(200).describe("Maximum number of protection groups to retrieve"),
      skip: z.number().min(0).default(0).describe("Number of protection groups to skip (for pagination)")
    },
    async (params) => {
      try {
        if (!global.vbrAuth) {
          return {
            content: [{
              type: "text",
              text: "Not authenticated. Please call auth-vbr tool first."
            }],
            isError: true
          };
        }

        const { host, token } = global.vbrAuth;
        const { limit = 200, skip = 0 } = params;

        const response = await fetch(`https://${host}:9419/api/v1/agents/protectionGroups?limit=${limit}&skip=${skip}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-api-version': '1.3-rev1',
            'Authorization': `Bearer ${token}`
          },
          agent: httpsAgent
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch protection groups: ${response.statusText}`);
        }

        const data = await response.json();

        // Add a summary message at the beginning
        const total = data.pagination.total;
        const count = data.pagination.count;
        const summary = `Retrieved ${count} protection groups out of ${total} total`;

        const formattedResult = {
          summary,
          protectionGroups: data.data, // Return the raw data objects for flexibility
          pagination: data.pagination
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(formattedResult, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching protection groups: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}
