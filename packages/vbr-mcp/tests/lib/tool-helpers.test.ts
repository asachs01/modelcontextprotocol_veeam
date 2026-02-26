import { describe, it, expect, beforeEach } from "vitest";
import { toolSuccess, toolError, withAuth } from "../../src/lib/tool-helpers.js";
import { setAuth, clearAuth } from "../../src/lib/auth-state.js";

describe("tool-helpers", () => {
  describe("toolSuccess", () => {
    it("wraps string data in content array", () => {
      const result = toolSuccess("hello");
      expect(result.content).toEqual([{ type: "text", text: "hello" }]);
      expect(result.isError).toBeUndefined();
    });

    it("JSON-stringifies object data", () => {
      const result = toolSuccess({ foo: "bar" });
      expect(result.content[0].text).toBe(JSON.stringify({ foo: "bar" }, null, 2));
    });
  });

  describe("toolError", () => {
    it("wraps message and sets isError", () => {
      const result = toolError("something went wrong");
      expect(result.content[0].text).toBe("something went wrong");
      expect(result.isError).toBe(true);
    });
  });

  describe("withAuth", () => {
    beforeEach(() => {
      clearAuth();
    });

    it("returns error when not authenticated", async () => {
      const handler = withAuth(async (_params, _auth) => toolSuccess("ok"));
      const result = await handler({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Not authenticated");
    });

    it("passes auth to handler when authenticated", async () => {
      setAuth({ host: "test-host", token: "test-token" });
      const handler = withAuth(async (_params, auth) => toolSuccess(`host: ${auth.host}`));
      const result = await handler({});
      expect(result.content[0].text).toContain("test-host");
    });

    it("catches handler errors and returns toolError", async () => {
      setAuth({ host: "test-host", token: "test-token" });
      const handler = withAuth(async () => {
        throw new Error("boom");
      });
      const result = await handler({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("boom");
    });
  });
});
