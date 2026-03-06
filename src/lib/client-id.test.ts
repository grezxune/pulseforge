import { describe, expect, it } from "vitest";
import { getOrCreateClientId } from "./client-id";

describe("getOrCreateClientId", () => {
  it("creates and persists a stable browser identifier", () => {
    window.localStorage.clear();

    const first = getOrCreateClientId();
    const second = getOrCreateClientId();

    expect(first.length).toBeGreaterThan(8);
    expect(second).toBe(first);
  });
});
