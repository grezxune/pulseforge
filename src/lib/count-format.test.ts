import { describe, expect, it } from "vitest";
import { formatCount } from "./count-format";

describe("formatCount", () => {
  it("formats integers with separators", () => {
    expect(formatCount(15203)).toBe("15,203");
  });

  it("normalizes invalid negative values to zero", () => {
    expect(formatCount(-42)).toBe("0");
  });
});
