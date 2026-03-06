import { describe, expect, it } from "vitest";
import { PRESS_RESPONSE_LINES, TAUNT_LINES } from "./button-voice";

function countWords(line: string): number {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

function extractAfterMarker(line: string, marker: string): string {
  const markerIndex = line.indexOf(marker);
  if (markerIndex === -1) {
    return "";
  }

  return line.slice(markerIndex + marker.length).trim().replace(/[.]+$/, "");
}

describe("button voice line pools", () => {
  it("provides 300 unique taunts", () => {
    expect(TAUNT_LINES).toHaveLength(300);
    expect(new Set(TAUNT_LINES).size).toBe(300);
    expect(new Set(TAUNT_LINES.map((line) => extractAfterMarker(line, "than "))).size).toBe(
      300,
    );
    TAUNT_LINES.forEach((line) => {
      expect(countWords(line)).toBeLessThanOrEqual(15);
    });
  });

  it("provides 300 unique click responses", () => {
    expect(PRESS_RESPONSE_LINES).toHaveLength(300);
    expect(new Set(PRESS_RESPONSE_LINES).size).toBe(300);
    expect(
      new Set(PRESS_RESPONSE_LINES.map((line) => extractAfterMarker(line, "like "))).size,
    ).toBe(300);
    PRESS_RESPONSE_LINES.forEach((line) => {
      expect(countWords(line)).toBeLessThanOrEqual(15);
    });
  });
});
