import { describe, it, expect, beforeEach } from "vitest";
import { getAuth, getAuthOrNull, setAuth, clearAuth } from "../src/auth-state.js";

describe("auth-state", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("returns null when not authenticated", () => {
    expect(getAuthOrNull()).toBeNull();
  });

  it("throws when getAuth() called without authentication", () => {
    expect(() => getAuth()).toThrow("Not authenticated");
  });

  it("stores and retrieves auth", () => {
    setAuth({ host: "server.example.com", token: "test-token" });
    const auth = getAuth();
    expect(auth.host).toBe("server.example.com");
    expect(auth.token).toBe("test-token");
  });

  it("clearAuth removes stored auth", () => {
    setAuth({ host: "server.example.com", token: "test-token" });
    clearAuth();
    expect(getAuthOrNull()).toBeNull();
  });
});
