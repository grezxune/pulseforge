import { describe, expect, it } from "vitest";
import { getLevelDifficulty } from "./level-engine";

describe("getLevelDifficulty", () => {
  it("returns baseline mechanics for level 1", () => {
    const profile = getLevelDifficulty(1);

    expect(profile.title).toBe("Won't get easier");
    expect(profile.slide).toBe(false);
    expect(profile.teleport).toBe(false);
    expect(profile.camouflage).toBe(false);
    expect(profile.pulse).toBe(false);
    expect(profile.windowOpenMs).toBe(profile.windowCycleMs);
    expect(profile.pulseMinScale).toBe(1);
  });

  it("enables movement and visual mechanics as levels rise", () => {
    const levelTwo = getLevelDifficulty(2);
    const levelThree = getLevelDifficulty(3);
    const levelFour = getLevelDifficulty(4);

    expect(levelTwo.slide).toBe(true);
    expect(levelTwo.teleport).toBe(false);
    expect(levelThree.teleport).toBe(true);
    expect(levelFour.camouflage).toBe(true);
    expect(levelTwo.pulse).toBe(true);
  });

  it("keeps scaling difficulty and title cycles after level ten", () => {
    const levelTen = getLevelDifficulty(10);
    const levelEleven = getLevelDifficulty(11);
    const levelFifty = getLevelDifficulty(50);

    expect(levelEleven.title).toContain("(Tier 2)");
    expect(levelFifty.slideDistancePx).toBeGreaterThan(levelTen.slideDistancePx);
    expect(levelFifty.teleportIntervalMs).toBeLessThan(levelTen.teleportIntervalMs);
    expect(levelFifty.pulseDurationMs).toBeLessThan(levelTen.pulseDurationMs);
    expect(levelFifty.pulseMinScale).toBeLessThan(levelTen.pulseMinScale);
    expect(levelFifty.windowOpenMs).toBeLessThan(levelTen.windowOpenMs);
  });

  it("enforces fairness guardrails at high levels", () => {
    for (let level = 4; level <= 5000; level += 1) {
      const profile = getLevelDifficulty(level);
      const closedGapMs = profile.windowCycleMs - profile.windowOpenMs;

      expect(profile.windowOpenMs).toBeGreaterThanOrEqual(420);
      expect(closedGapMs).toBeLessThanOrEqual(900);
      expect(profile.windowCycleMs).toBeGreaterThanOrEqual(1600);
      expect(profile.windowCycleMs).toBeLessThanOrEqual(60_000);
      expect(profile.teleportIntervalMs).toBeGreaterThanOrEqual(850);
      expect(profile.pulseMinScale).toBeGreaterThanOrEqual(0.44);
      expect(profile.pulseDurationMs).toBeGreaterThanOrEqual(760);
    }
  });
});
