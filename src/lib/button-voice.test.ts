import { describe, expect, it } from "vitest";
import { PRESS_RESPONSE_LINES, TAUNT_LINES } from "./button-voice";

describe("button voice line pools", () => {
  it("provides 300 unique taunts", () => {
    expect(TAUNT_LINES).toHaveLength(300);
    expect(new Set(TAUNT_LINES).size).toBe(300);
  });

  it("provides 300 unique click responses", () => {
    expect(PRESS_RESPONSE_LINES).toHaveLength(300);
    expect(new Set(PRESS_RESPONSE_LINES).size).toBe(300);
  });
});
